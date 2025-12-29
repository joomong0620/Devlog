// [수정] DTO 필드명에 맞춰 변수명 수정 (desc -> summary, time -> createdAt 등)
// [추가] 정렬(Sort) 기능 구현

const blogGrid = document.getElementById('blogGrid');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const loader = document.getElementById('loader');
const filterButtons = document.querySelectorAll('.filter-btn');

// 상태 변수
let currentPage = 1;      // SSR로 0페이지(12개)는 이미 로딩됨 -> 1페이지부터 호출
let currentSort = 'id';   // 기본 정렬: 최신순 (id DESC)
let isLoading = false;    // 중복 로딩 방지
let isLastPage = false;   // 마지막 페이지 도달 여부

// =========================================================
// 1. 카드 HTML 생성 함수
// =========================================================
function createCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';

    // 이미지 처리
    const imgSrc = post.thumbnailUrl ? post.thumbnailUrl : 'https://placehold.co/300x200/eeeeee/333?text=DevLog';
    const detailUrl = `/blog/detail/${post.id}`;

    // 태그 처리 (DTO에 tags가 있다면)
    let tagsHtml = '';
    if (post.tags && post.tags.length > 0) {
        // 최대 3개까지만 표시 등 디자인에 따라 조절 가능
        post.tags.forEach(tag => {
            tagsHtml += `<span style="font-size:12px; color:#666; margin-right:5px;">#${tag}</span>`;
        });
    }

    // DTO 필드명: summary, authorName, likeCount, commentCount, viewCount, createdAt 사용
    card.innerHTML = `
        <a href="${detailUrl}" class="card-link">
            <div class="card-image">
                <img src="${imgSrc}" alt="썸네일" onerror="this.src='https://via.placeholder.com/300'">
            </div>
            <div class="card-content">
                <h3 class="card-title">${post.title}</h3>
                <p class="card-desc">${post.summary ? post.summary : ''}</p>
                
                <div class="card-meta">
                    <span class="author">${post.authorName}</span>
                    <div class="stats">
                        <span><i class="fa-solid fa-heart"></i> ${post.likeCount}</span>
                        <span><i class="fa-solid fa-comment"></i> ${post.commentCount}</span>
                        <span><i class="fa-solid fa-eye"></i> ${post.viewCount}</span>
                    </div>
                </div>
                <div class="card-footer-time" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${post.createdAt}</span>
                    <div class="card-tags">${tagsHtml}</div>
                </div>
            </div>
        </a>
    `;
    return card;
}

// =========================================================
// 2. 서버에서 데이터 가져오기 (AJAX)
// =========================================================
function fetchPosts(isReset = false) {
    if (isLoading) return;
    
    // 정렬 변경 등으로 인한 초기화 시
    if (isReset) {
        blogGrid.innerHTML = ''; // 기존 목록 삭제
        currentPage = 0;         // 0페이지부터 다시 시작 (API 호출용)
        isLastPage = false;
        loader.style.display = 'block';
    }

    if (isLastPage) return;

    isLoading = true;

    // API 호출 (page, size, sort 파라미터 전달)
    // 예: /api/blog/list?page=0&size=12&sort=viewCount,desc
    const url = `/api/blog/list?page=${currentPage}&size=12&sort=${currentSort},desc`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('데이터 로드 실패');
            return response.json();
        })
        .then(data => {
            const posts = data.content;
            const last = data.last;

            // 데이터가 없거나 마지막 페이지면 처리
            if (posts.length === 0 || last) {
                isLastPage = true;
                loader.style.display = 'none';
            }

            posts.forEach(post => {
                blogGrid.appendChild(createCard(post));
            });

            // 다음 페이지 준비
            currentPage++;
        })
        .catch(error => {
            console.error('API Error:', error);
        })
        .finally(() => {
            isLoading = false;
        });
}

// =========================================================
// 3. 무한 스크롤 옵저버
// =========================================================
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLastPage && !isLoading) {
        // SSR로 1페이지(0번인덱스)까지는 로딩되었다고 가정하더라도
        // 정렬이 바뀌면 currentPage=0 부터 가져와야 하므로 로직 유지
        setTimeout(() => {
            fetchPosts();
        }, 300);
    }
}, { threshold: 0.1 });

if (loader) observer.observe(loader);

// =========================================================
// 4. 필터(정렬) 버튼 클릭 이벤트
// =========================================================
filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        // UI 활성화 처리
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // 정렬 기준 설정 (HTML data-sort 속성 활용 권장)
        // HTML 예시: <button class="filter-btn" data-sort="viewCount">조회순</button>
        // 만약 data 속성이 없다면 텍스트로 구분
        const text = this.innerText.trim();
        
        if (text === '조회순') currentSort = 'viewCount';
        else if (text === '인기순') currentSort = 'likeCount'; // 좋아요순
        else if (text === '댓글순') currentSort = 'commentCount';
        else currentSort = 'id'; // 최신순

        // 목록 초기화 후 재로딩
        fetchPosts(true); 
    });
});

// =========================================================
// 5. TOP 버튼
// =========================================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// [검색 기능] 엔터키 이벤트 (추후 백엔드 검색 API 필요)
const searchInput = document.getElementById('searchInput');
if(searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            alert("검색 기능은 추후 백엔드 QueryDSL 연동 후 구현 예정입니다.");
        }
    });
}