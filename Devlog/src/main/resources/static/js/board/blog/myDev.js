console.log("myDev.js loaded");

// 상태 관리 변수들
let currentSort = 'id';
let currentType = 'all'; // [추가됨 1] 현재 탭 상태 (all: 전체, paid: 유료)
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
    const blogOptionBtn = document.getElementById('blogOptionBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

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

    // [기능 4] 탭 클릭 (수정됨!)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. 스타일 변경
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 2. [추가됨 2] 탭 타입 변경 (HTML의 data-type 속성 읽기)
            const newType = btn.getAttribute('data-type'); // 'all' 또는 'paid'
            
            if (currentType !== newType) {
                currentType = newType;
                console.log("탭 변경됨:", currentType); // 확인용 로그
                renderPosts(true); // 목록 초기화하고 다시 불러오기
            }
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

    // 닉네임 옆 점 세개(내 활동, 프로필 설정) 드롭다운
    if (blogOptionBtn && dropdownMenu) {
        // 1. 버튼 클릭 시 메뉴 열기/닫기
        blogOptionBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 이벤트가 부모로 전파되지 않게 막음
            dropdownMenu.classList.toggle('active'); // CSS에 정의된 .active 클래스 토글
        });

        // 2. 화면의 빈 곳을 클릭하면 메뉴 닫기
        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && !blogOptionBtn.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

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
            // [추가됨 3] URL 끝에 &type=${currentType} 추가!
            // blogOwnerId는 HTML 파일의 th:inline="javascript"에서 넘어옴
            const url = `/api/blog/${blogOwnerId}/list?page=${page}&size=${PAGE_SIZE}&sort=${currentSort}&type=${currentType}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('데이터 로드 실패');

            const data = await response.json(); // Map 반환
            const posts = data.content; // 실제 리스트

            if ((!posts || posts.length === 0) && page === 0) {
                // 목록이 비었을 때 메시지 (아이콘 추가로 조금 더 예쁘게)
                listWrap.innerHTML = `
                    <div style="padding:50px; text-align:center; width:100%; color:#666;">
                        <i class="fa-regular fa-folder-open" style="font-size: 2rem; margin-bottom: 10px;"></i>
                        <p>작성된 글이 없습니다.</p>
                    </div>`;
                isLastPage = true;
            } else if (!posts || posts.length === 0) {
                isLastPage = true;
            }

            if (posts) {
                posts.forEach(post => {
                    // 썸네일 처리
                    const thumb = post.thumbnailUrl ? post.thumbnailUrl : 'https://placehold.co/170x120/eeeeee/333?text=DevLog';
                    
                    // 본문 요약 처리
                    const desc = post.boardContent ? post.boardContent : ''; 

                    // 태그 리스트 처리
                    let tagsHtml = '';
                    if (post.tagList && post.tagList.length > 0) {
                        post.tagList.forEach(t => {
                            tagsHtml += `<span class="tag-pill">#${t}</span> `;
                        });
                    }

                    // 유료 글 표시 아이콘
                    const paidIcon = (post.isPaid === 'Y') 
                        ? '<span style="background:#ffca28; color:#fff; padding:2px 6px; border-radius:4px; font-size:12px; margin-right:5px; vertical-align: middle;">Premium</span>' 
                        : '';

                    // HTML 생성
                    const html = `
                        <article class="post-item" onclick="location.href='/blog/detail/${post.boardNo}'" style="cursor:pointer;">
                            <div class="post-main">
                                <h2>${paidIcon}${post.boardTitle}</h2>
                                <p class="post-content">${desc}</p>
                                <div class="post-stats">
                                    <span><i class="fa-solid fa-heart"></i> ${post.likeCount}</span>
                                    <span><i class="fa-solid fa-comment"></i> ${post.commentCount}</span>
                                    <span><i class="fa-solid fa-eye"></i> ${post.boardCount}</span> 
                                    <span>${post.bCreateDate}</span> 
                                </div>
                                <div class="post-tags">${tagsHtml}</div>
                            </div>
                            <img src="${thumb}" class="post-thumb-img" alt="thumbnail">
                        </article>`;
                    
                    listWrap.insertAdjacentHTML('beforeend', html);
                });
            }

            if (data.last) {
                isLastPage = true;
                if (loader) loader.style.display = 'none';
            } else {
                page++;
            }

        } catch (error) {
            console.error("Error:", error);
            alert("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            isLoading = false;
        }
    }

    // 무한 스크롤 옵저버
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