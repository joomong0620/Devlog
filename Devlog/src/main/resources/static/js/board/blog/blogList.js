console.log("blogList.js loaded")

const blogGrid = document.getElementById('blogGrid');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const loader = document.getElementById('loader');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentPage = 1;  // SSR로 0페이지는 로딩됨 -> 1페이지부터
let currentSort = 'id';
let isLoading = false;
let isLastPage = false;


// 블로그 목록 카드에 HTML 태그 제거 및 길이 제한 함수
function stripHtml(html) {
    if (!html) return '';
    // 1. 임시 엘리먼트를 만들어 HTML을 주입
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    // 2. 텍스트만 추출 (태그는 사라짐)
    let text = tmp.textContent || tmp.innerText || "";

    // 3. 너무 길면 100자까지만 자르고 ... 붙이기 (카드 모양 유지용)
    if (text.length > 30) {
        text = text.substring(0, 30) + "...";
    }
    return text;
}

// 본문에서 첫 번째 이미지 URL 추출 (정규식 추가 버전)
function extractFirstImage(htmlOrMd) {
    if (!htmlOrMd) return '/images/logo.png';

    // 1. HTML 태그 형태의 img src 추출 (<img src="...">)
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["']/;
    const match = htmlOrMd.match(imgTagRegex);
    if (match && match[1]) {
        return match[1];
    }

    // 2. 마크다운 형태의 이미지 추출 (![alt](url))
    const mdImgRegex = /!\[.*?\]\((.*?)\)/;
    const mdMatch = htmlOrMd.match(mdImgRegex);
    if (mdMatch && mdMatch[1]) {
        return mdMatch[1];
    }

    // 3. 둘 다 없으면 DOMParser 시도 (최후의 수단)
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlOrMd, 'text/html');
        const img = doc.querySelector('img');
        if (img && img.src) return img.src;
    } catch (e) {
        console.error("Image parsing error", e);
    }

    return '/images/logo.png'; // 없으면 기본 이미지
}

// 1. 카드 생성 함수
function createCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';

    const content = post.board_content || post.boardContent || "";
    const imgSrc = extractFirstImage(content);
    const detailUrl = `/blog/detail/${post.board_no}`;
    const paidIcon = (post.is_paid === 'Y') ? '<i class="fa-solid fa-crown" style="color:#ffd700; margin-right:5px;"></i>' : '';

    const cleanContent = stripHtml(post.board_content);

    card.innerHTML = `
        <a href="${detailUrl}" class="card-link">
            <div class="card-image">
                <img src="${imgSrc}" alt="썸네일" onerror="this.src='/images/logo.png'">
            </div>

            <div class="card-content">
                <h3 class="card-title">${paidIcon}${post.board_title}</h3> 
                
                <p class="card-desc">${cleanContent}</p>
                
                <div class="card-meta">
                    <span class="author">${post.member_nickname}</span>
                    <div class="stats">
                        <span><i class="fa-solid fa-eye"></i> ${post.board_count}</span>
                        <span><i class="fa-solid fa-comment"></i> ${post.comment_count}</span>
                    </div>
                </div>
                <div class="card-footer-time" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${post.bcreate_date}</span>
                </div>
            </div>
        </a>
    `;
    return card;
}

// 2. 데이터 페치
function fetchPosts(isReset = false) {
    if (isLoading) return;

    if (isReset) {
        blogGrid.innerHTML = '';
        currentPage = 0; // 초기화 시 0부터
        isLastPage = false;
        loader.style.display = 'block';
    }

    if (isLastPage) return;
    isLoading = true;

    // API 호출
    const url = `/api/blog/list?page=${currentPage}&size=12&sort=${currentSort},desc`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('실패');
            return res.json();
        })
        .then(data => {
            // [수정] Service에서 Map으로 리턴하므로 data.content가 리스트임
            const posts = data.content;
            const last = data.last;

            if (!posts || posts.length === 0) {
                isLastPage = true;
                loader.style.display = 'none';
                if (isReset) blogGrid.innerHTML = '<p class="no-data">등록된 게시글이 없습니다.</p>';
                return;
            }

            if (last) {
                isLastPage = true;
                loader.style.display = 'none';
            }

            posts.forEach(post => {
                blogGrid.appendChild(createCard(post));
            });
            currentPage++;
        })
        .catch(err => console.error(err))
        .finally(() => isLoading = false);
}

// 3. 무한 스크롤 옵저버
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLastPage && !isLoading) {
        setTimeout(() => fetchPosts(), 300);
    }
}, { threshold: 0.1 });

if (loader) observer.observe(loader);

// 4. 필터 버튼
filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const sort = this.getAttribute('data-sort');
        // 백엔드 파라미터 매핑
        if (sort === 'view') currentSort = 'viewCount';
        else if (sort === 'like') currentSort = 'likeCount';
        else if (sort === 'comment') currentSort = 'commentCount';
        else currentSort = 'id';

        fetchPosts(true);
    });
});

// TOP 버튼
window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = (window.scrollY > 500) ? 'flex' : 'none';
});
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 초기 로딩 카드 내 게시글 내용 태그 제거 처리
document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll('.blog-card');

    cards.forEach(card => {
        const descEl = card.querySelector('.card-desc');
        const imgEl = card.querySelector('.card-image img');
        
        if (descEl) {
            // 1. th:text로 인해 문자열로 들어온 HTML 원본을 가져옴
            const rawContent = descEl.innerText || descEl.textContent;

            // 2. 썸네일 처리 (텍스트를 깎기 전에 원본 문자열에서 추출)
            if (imgEl) {
                const newSrc = extractFirstImage(rawContent);
                imgEl.src = newSrc;
                
                imgEl.onerror = function () {
                    this.src = '/images/logo.png';
                };
            }

            // 3. 내용 처리 (이미지 추출이 끝난 후 태그를 제거하고 화면에 출력)
            descEl.innerText = stripHtml(rawContent);
        }
    });
});