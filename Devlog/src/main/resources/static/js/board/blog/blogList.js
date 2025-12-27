/* [수정사항]
  1. 가상 데이터 생성 함수(getBlogData) 삭제
  2. DTO 필드명과 일치하도록 변수명 수정 (likes -> likeCount, thumbnail -> thumbnailUrl 등)
  3. 첫 페이지는 SSR(Thymeleaf)로 이미 로딩되었으므로, page는 1부터 시작
*/

const blogGrid = document.getElementById('blogGrid');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const loader = document.getElementById('loader');

// 상태 변수
let currentPage = 1;      // 0페이지는 이미 Thymeleaf가 렌더링함
let isLoading = false;    // 중복 로딩 방지
let isLastPage = false;   // 마지막 페이지 도달 여부

// DTO 필드명에 맞춘 카드 생성 함수
function createCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';

    // 이미지 처리 (null일 경우 기본 이미지)
    const imgSrc = post.thumbnailUrl ? post.thumbnailUrl : 'https://via.placeholder.com/300';

    // 상세 페이지 링크 생성 (/blog/detail/{id})
    const detailUrl = `/blog/detail/${post.id}`;

    card.innerHTML = `
        <a href="${detailUrl}" class="card-link">
            <div class="card-image">
                <img src="${imgSrc}" alt="썸네일">
            </div>
            <div class="card-content">
                <h3 class="card-title">${post.title}</h3>
                <p class="card-desc">${post.desc}</p> <div class="card-meta">
                    <span class="author">${post.authorName}</span>
                    <div class="stats">
                        <span>❤️ ${post.likeCount}</span>
                        <span>💬 ${post.commentCount}</span>
                        <span>👁️ ${post.viewCount}</span>
                    </div>
                </div>
                <div class="card-footer-time">
                    ${post.time}
                </div>
            </div>
        </a>
    `;
    return card;
}

// 서버에서 데이터 가져오기 (AJAX)
function fetchPosts() {
    if (isLoading || isLastPage) return;

    isLoading = true;
    loader.classList.add('active'); // 로딩 애니메이션 표시 (CSS 필요 시 추가)

    // Controller의 /api/blog/list 와 매핑
    fetch(`/api/blog/list?page=${currentPage}&size=12`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Spring Data JPA의 Page 객체 구조: content(데이터배열), last(마지막여부) 등
            const posts = data.content;
            const last = data.last;

            if (posts.length === 0 || last) {
                isLastPage = true;
                loader.style.display = 'none'; // 더 이상 로딩바 안 보이기
            }

            posts.forEach(post => {
                blogGrid.appendChild(createCard(post));
            });

            if (!isLastPage) {
                currentPage++; // 다음 페이지 준비
            }
        })
        .catch(error => {
            console.error('데이터 로드 실패:', error);
        })
        .finally(() => {
            isLoading = false;
        });
}

// 무한 스크롤 옵저버
const observer = new IntersectionObserver((entries) => {
    // 로더가 보이고, 마지막 페이지가 아니고, 로딩 중이 아닐 때만 실행
    if (entries[0].isIntersecting && !isLastPage && !isLoading) {
        // 너무 빠른 요청 방지를 위해 살짝 딜레이를 줄 수도 있음
        setTimeout(() => {
            fetchPosts();
        }, 500);
    }
}, { threshold: 0.1 });

// 로더 감지 시작
if (loader) {
    observer.observe(loader);
}

// 최상단 이동 버튼 로직
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 필터 버튼 클릭 로직 (추후 정렬 기능 구현 시 수정 필요)
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // 정렬 변경 시: 목록 초기화 후 다시 0페이지부터 로드하는 로직 필요
        // console.log("정렬 변경:", this.innerText);
    });
});