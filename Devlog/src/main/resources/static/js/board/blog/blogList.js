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

// 본문에서 첫 번째 이미지 URL 추출 (없으면 로고 반환)
function extractFirstImage(html) {
    if (!html) return '/images/logo.png';
    
    // 1. HTML 문자열을 DOM으로 변환
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 2. img 태그 찾기
    const img = doc.querySelector('img');
    
    // 3. 이미지가 있으면 src 반환, 없으면 로고 반환
    if (img) {
        return img.src;
    } else {
        return '/images/logo.png';
    }
}

// 1. 카드 생성 함수
function createCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';

    const imgSrc = extractFirstImage(post.board_content);
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
document.addEventListener("DOMContentLoaded", function() {
    // 1. 모든 카드들을 찾기
    const cards = document.querySelectorAll('.blog-card');
    
    cards.forEach(card => {
        // [내용 처리]
        const descEl = card.querySelector('.card-desc');
        let rawContent = "";
        
        if (descEl) {
            // th:text로 뿌려졌다면 태그가 그대로 text로 들어있으므로 innerText로 가져옴
            rawContent = descEl.innerText || descEl.textContent;
            
            // stripHtml 돌려서 다시 넣기
            descEl.innerText = stripHtml(rawContent);
        }
        
        // 썸네일 처리
        const imgEl = card.querySelector('.card-image img');
        if (imgEl && rawContent) {
            // extractFirstImage로 썸네일 주소 뽑기
            const newSrc = extractFirstImage(rawContent);
            
            // 이미지 주소 교체 (원래 있던 프로필 사진 -> 본문 이미지 or 로고)
            imgEl.src = newSrc;
            
            // 혹시라도 이미지가 깨지면 로고로 방어
            imgEl.onerror = function() {
                this.src = '/images/logo.png';
            };
        }
    });
});