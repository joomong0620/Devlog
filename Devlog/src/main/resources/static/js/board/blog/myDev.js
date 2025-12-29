// 상태 관리 변수들
let currentSort = 'latest'; // 정렬 기준 (기본값 수정)
let page = 0;
const PAGE_SIZE = 6;
let isLoading = false;
let isLastPage = false;

document.addEventListener('DOMContentLoaded', () => {
    const listWrap = document.getElementById('post-list-wrap');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tagItems = document.querySelectorAll('.tag-item');
    const filterItems = document.querySelectorAll('.filter-item');
    const searchInput = document.getElementById('searchInput');
    const goTopBtn = document.getElementById('goTopBtn');

    // [수정됨] 모드 전환 버튼 관련 로직 삭제됨 (modeBtn)

    // [기능 1] TOP 버튼
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            goTopBtn.style.display = 'block';
        } else {
            goTopBtn.style.display = 'none';
        }
    });
    goTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // [기능 2] 검색 기능
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                alert("검색 기능은 추후 백엔드 API 연동 예정입니다.");
            }
        });
    }

    // [기능 3] 정렬 필터
    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            filterItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const sortText = item.getAttribute('data-sort');
            // 백엔드 Pageable sort 파라미터에 맞게 매핑
            if (sortText === 'view') currentSort = 'viewCount';
            else if (sortText === 'like') currentSort = 'likeCount';
            else if (sortText === 'comment') currentSort = 'commentCount';
            else currentSort = 'id'; // 최신순 (latest)

            renderPosts(true);
        });
    });

    // [기능 4] 탭 클릭
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // TODO: 탭 타입(scrap, paid 등)에 따라 API 호출 파라미터 변경 필요
            renderPosts(true);
        });
    });

    // [기능 5] 태그 클릭
    tagItems.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('selected');
            // TODO: 선택된 태그들을 수집해서 API 호출 시 파라미터로 전달 필요
            renderPosts(true);
        });
    });

    // ============================================================
    // [핵심] 게시글 로딩 함수
    // ============================================================
    async function renderPosts(isReset = false) {
        if (isLoading) return;

        if (isReset) {
            listWrap.innerHTML = '';
            page = 0;
            isLastPage = false;
        }

        if (isLastPage) return;

        isLoading = true;
        const loader = document.getElementById('infinite-sentinel');
        if (loader) loader.style.display = 'block';

        try {
            // API 호출: 컨트롤러에서 Pageable을 받으므로 sort 포맷 주의 (ex: sort=id,desc)
            // blogOwnerId는 HTML th:inline="javascript"에서 주입받은 변수 사용 가능
            const url = `/api/blog/${blogOwnerId}/list?page=${page}&size=${PAGE_SIZE}&sort=${currentSort},desc`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('데이터 로드 실패');

            const data = await response.json(); // Page<Dto>
            const posts = data.content;

            if (posts.length === 0 && page === 0) {
                listWrap.innerHTML = '<div style="padding:50px; text-align:center; width:100%; color:#666;">작성된 글이 없습니다.</div>';
                isLastPage = true; // 더 로드할게 없음
            } else if (posts.length === 0) {
                isLastPage = true;
            }

            posts.forEach(post => {
                const thumb = post.thumbnailUrl ? post.thumbnailUrl : 'https://placehold.co/170x120/eeeeee/333?text=DevLog';
                const desc = post.summary ? post.summary : ''; // DTO 필드명 확인 필요

                // 태그 렌더링 (DTO에 tags 리스트가 있다고 가정)
                let tagsHtml = '';
                if (post.tags && post.tags.length > 0) {
                    post.tags.forEach(t => {
                        tagsHtml += `<span class="tag-pill">#${t}</span> `;
                    });
                }

                const html = `
                    <article class="post-item" onclick="location.href='/blog/detail/${post.id}'" style="cursor:pointer;">
                        <div class="post-main">
                            <h2>${post.title}</h2>
                            <p class="post-content">${desc}</p>
                            <div class="post-stats">
                                <span><i class="fa-solid fa-heart"></i> ${post.likeCount}</span>
                                <span><i class="fa-solid fa-comment"></i> ${post.commentCount}</span>
                                <span><i class="fa-solid fa-eye"></i> ${post.viewCount}</span> 
                                <span>${post.createdAt}</span> </div>
                            <div class="post-tags">${tagsHtml}</div>
                        </div>
                        <img src="${thumb}" class="post-thumb-img" alt="thumbnail">
                    </article>`;
                listWrap.insertAdjacentHTML('beforeend', html);
            });

            if (data.last) {
                isLastPage = true;
                if (loader) loader.style.display = 'none';
            } else {
                page++;
            }

        } catch (error) {
            console.error("Error:", error);
        } finally {
            isLoading = false;
        }
    }

    // 무한 스크롤 옵저버 설정
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLastPage) {
            renderPosts();
        }
    }, { threshold: 0.5 });

    const sentinel = document.getElementById('infinite-sentinel');
    if (sentinel) observer.observe(sentinel);

    // 초기 로드
    renderPosts(true);
});