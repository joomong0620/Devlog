console.log("blogList.js loaded")

const blogGrid = document.getElementById('blogGrid');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const loader = document.getElementById('loader');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentPage = 1;
let currentSort = 'id';
let isLoading = false;
let isLastPage = false;


// HTML 태그 + 마크다운 문법 제거 및 길이 제한 함수
function cleanContent(htmlContent) {
    if (!htmlContent) return '';

    // 1. DOMParser를 이용해 HTML 태그를 해석해서 텍스트만 추출
    // (<div>, <p>, <br> 등이 여기서 사라짐)
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    let text = doc.body.textContent || "";

    // 2. 마크다운 특수문자 제거 (정규식)
    // # (헤더), * (볼드), _ (이탤릭), ~ (취소선), ` (코드), [ ] (링크/이미지 괄호) 제거
    text = text.replace(/[#*`_~\[\]]/g, '');

    // 3. 이미지 마크다운 문법 제거 (![...](...)) 및 링크 문법 제거
    text = text.replace(/!\[.*?\]\(.*?\)/g, ''); // 이미지 태그 제거
    text = text.replace(/\(.*?\)/g, ''); // 괄호 안에 있는 링크 주소 등 제거

    // 4. 공백 정리 (연속된 공백, 줄바꿈을 공백 한 칸으로)
    text = text.replace(/\s+/g, ' ').trim();

    // 5. 카드 내 내용 길이 제한 (100자)
    if (text.length > 30) {
        text = text.substring(0, 30) + "...";
    }
    return text;
}

// 1. 카드 생성 함수
function createCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';

    // [핵심 로직] DB에 있는 썸네일 주소만 봅니다. 없으면 무조건 기본 이미지.
    let displayImg = '/images/logo.png'; // 기본 이미지 경로

    // DB에서 가져온 thumbnail_url이 있으면 그걸 사용
    if (post.thumbnail_url && post.thumbnail_url.trim() !== '') {
        displayImg = post.thumbnail_url;
    }

    const detailUrl = `/blog/detail/${post.boardNo || post.board_no}`;
    const paidIcon = (post.isPaid === 'Y' || post.is_paid === 'Y') ? '<i class="fa-solid fa-crown" style="color:#ffd700; margin-right:5px;"></i>' : '';
    
    // [수정됨] cleanContent 함수를 사용하여 마크다운/HTML 모두 제거된 깔끔한 텍스트 가져오기
    const rawContent = post.boardContent || post.board_content;
    const cleanText = cleanContent(rawContent);

    // 날짜 포맷팅
    const dateStr = post.bCreateDate || post.bcreate_date;

    card.innerHTML = `
        <a href="${detailUrl}" class="card-link">
            <div class="card-image">
                <img src="${displayImg}" alt="썸네일" onerror="this.src='/images/logo.png'">
            </div>

            <div class="card-content">
                <h3 class="card-title">${paidIcon}${post.boardTitle || post.board_title}</h3> 
                
                <p class="card-desc">${cleanText}</p>
                
                <div class="card-meta">
                    <span class="author">${post.memberNickname || post.member_nickname}</span>
                    <div class="stats">
                        <span><i class="fa-solid fa-eye"></i> ${post.boardCount || post.board_count || 0}</span>
                        <span><i class="fa-solid fa-comment"></i> ${post.commentCount || post.comment_count || 0}</span>
                    </div>
                </div>
                <div class="card-footer-time">
                    <span>${dateStr}</span>
                </div>
            </div>
        </a>
    `;
    return card;
}

// 2. 데이터 페치 (무한 스크롤)
function fetchPosts(isReset = false) {
    if (isLoading) return;

    if (isReset) {
        blogGrid.innerHTML = '';
        currentPage = 0;
        isLastPage = false;
        loader.style.display = 'block';
    }

    if (isLastPage) return;
    isLoading = true;

    // 백엔드 API 호출
    const url = `/api/blog/list?page=${currentPage}&size=12&sort=${currentSort},desc`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('불러오기 실패');
            return res.json();
        })
        .then(data => {
            const posts = data.content; 
            
            if (!posts || posts.length === 0) {
                isLastPage = true;
                loader.style.display = 'none';
                if (isReset) blogGrid.innerHTML = '<div class="no-data"><p>등록된 게시글이 없습니다.</p></div>';
                return;
            }

            if (data.last) {
                isLastPage = true;
                loader.style.display = 'none';
            }

            posts.forEach(post => {
                blogGrid.appendChild(createCard(post));
            });
            currentPage++;
        })
        .catch(err => {
            console.error(err);
            loader.style.display = 'none';
        })
        .finally(() => isLoading = false);
}

// 3. 무한 스크롤 옵저버
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLastPage && !isLoading) {
        fetchPosts();
    }
}, { threshold: 0.1 });

if (loader) observer.observe(loader);

// 4. 필터 버튼
filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const sort = this.getAttribute('data-sort');
        if (sort === 'view') currentSort = 'viewCount';
        else if (sort === 'like') currentSort = 'likeCount';
        else if (sort === 'comment') currentSort = 'commentCount';
        else currentSort = 'id';

        fetchPosts(true);
    });
});

// TOP 버튼
if(scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.style.display = (window.scrollY > 500) ? 'flex' : 'none';
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}