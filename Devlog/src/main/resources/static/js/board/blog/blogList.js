// 가상 데이터 생성기
const getBlogData = (count) => {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            author: "디자인고수",
            title: "세계 최고의 웹디자인 트렌드 " + (i + 1),
            desc: "이 게시글은 가로 1440px 환경에 최적화된 카드형 UI 예시입니다. 깔끔한 그라데이션과 가독성 높은 폰트를 사용하여 사용자에게 최고의 경험을 제공합니다.",
            thumbnail: `https://picsum.photos/400/300?random=${Math.random()}`,
            time: "2시간 전"
        });
    }
    return data;
};

const blogGrid = document.getElementById('blogGrid');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const loader = document.getElementById('loader');

// 카드 생성 함수
function createCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
        <div class="card-top">
            <div class="card-stats">
                <span>❤️ ${post.likes}</span>
                <span>💬 ${post.comments}</span>
            </div>
            <span class="author-name">${post.author}</span>
        </div>
        <div class="card-thumb">
            <img src="${post.thumbnail}" alt="thumbnail">
        </div>
        <div class="card-body">
            <h3 class="card-title">${post.title}</h3>
            <p class="card-desc">${post.desc}</p>
        </div>
        <div class="card-footer">
            ${post.time}
        </div>
    `;
    return card;
}

// 초기 데이터 로드 (12개)
function loadInitialPosts() {
    const posts = getBlogData(12);
    posts.forEach(post => blogGrid.appendChild(createCard(post)));
}

// 무한 스크롤 로직 (Intersection Observer 활용)
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        // 로딩 시뮬레이션
        setTimeout(() => {
            const newPosts = getBlogData(4); // 4개씩 추가
            newPosts.forEach(post => blogGrid.appendChild(createCard(post)));
        }, 800);
    }
}, { threshold: 1.0 });

observer.observe(loader);

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

// 필터 버튼 클릭 시 활성화 UI 변경 로직 추가
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // 기존 active 제거
        filterButtons.forEach(b => b.classList.remove('active'));
        // 클릭한 버튼에 active 추가
        this.classList.add('active');
        
        // 정렬 로직이 들어갈 자리 (예: 데이터 재로딩)
        console.log(this.innerText + " 정렬 실행");
    });
});

// 스크롤 탑 버튼 화살표 각도 조절 (HTML 아이콘이 왼쪽 기준일 경우)
// 만약 아이콘 자체가 왼쪽이면 rotate(-90deg)를 위쪽인 0deg 혹은 90deg로 맞춰야 합니다.
// 제공된 코드상으로는 CSS의 .scroll-top-btn img 부분에서 rotate를 직접 제어하도록 수정했습니다.

// 실행
loadInitialPosts();