// 1. 데이터 확장 (무한스크롤 확인용 40개)
const tagsArr = ["React", "Java", "Docker", "디버깅", "이직", "Kotlin", "환경세팅"];
const mockPosts = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    title: `${i + 1}번째 게시글: ${i % 5 === 0 ? '유료 콘텐츠' : '일반 기술 포스팅'}`,
    content: "본문 미리보기 내용입니다. 검색이나 필터링, 정렬 기능을 테스트하기 위한 충분한 양의 데이터입니다.",
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 2000),
    date: "1일 전",
    tags: [tagsArr[i % tagsArr.length], tagsArr[(i + 2) % tagsArr.length]],
    isPaid: i % 5 === 0,
    isScrap: i % 7 === 0,
    thumb: `https://placehold.co/170x120/${i % 2 === 0 ? 'f3ebff' : 'eeeeee'}/333?text=Post+${i + 1}`
}));

const mockUsers = [
    { nick: "CodeMaster", bio: "풀스택 지망생", img: "https://i.pravatar.cc/150?u=1" },
    { nick: "JavaLover", bio: "자바가 제일 쉽네요", img: "https://i.pravatar.cc/150?u=2" },
    { nick: "DevExplorer", bio: "새로운 기술을 찾는 중", img: "https://i.pravatar.cc/150?u=3" }
];

// 상태 관리 변수들
let currentType = 'all';
let selectedTags = [];    // 다중 태그 저장을 위한 배열
let searchQuery = '';     // 검색어
let currentSort = '최신순'; // 정렬 기준
let page = 1;
const PAGE_SIZE = 6;

document.addEventListener('DOMContentLoaded', () => {
    const listWrap = document.getElementById('post-list-wrap');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tagItems = document.querySelectorAll('.tag-item');
    const filterItems = document.querySelectorAll('.filter-item');
    const searchInput = document.getElementById('searchInput');
    const goTopBtn = document.getElementById('goTopBtn');
    const modeBtn = document.getElementById('tempModeSwitcher');
    const menuBtn = document.getElementById('menuBtn');
    const dropdown = document.getElementById('dropdownMenu');
    const writeBtn = document.querySelector('.owner-only .btn-white');

    // [기능 1] TOP 버튼 제어
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            goTopBtn.style.display = 'block';
        } else {
            goTopBtn.style.display = 'none';
        }
    });
    goTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // [기능 2] 검색 기능
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderPosts(true);
    });

    // [기능 3] 정렬 필터 클릭
    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            filterItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentSort = item.innerText;
            renderPosts(true);
        });
    });

    // [기능 4] 새 글 작성 이동
    if (writeBtn) writeBtn.onclick = () => { location.href = 'write.html'; };

    // [기능 5] 모드 전환
    if (modeBtn) {
        modeBtn.addEventListener('click', () => {
            const currentMode = document.body.getAttribute('data-user-type');
            const nextMode = currentMode === 'owner' ? 'visitor' : 'owner';
            document.body.setAttribute('data-user-type', nextMode);
            modeBtn.innerText = `[임시] 모드 전환 (현재: ${nextMode === 'owner' ? '주인' : '방문자'})`;
            renderPosts(true);
        });
    }

    // [기능 6] 탭 클릭
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.getAttribute('data-type');
            renderPosts(true);
        });
    });

    // [기능 7] 다중 태그 필터링
    tagItems.forEach(tag => {
        tag.addEventListener('click', () => {
            const tagName = tag.getAttribute('data-tag') || tag.innerText.split(' ')[0];

            if (selectedTags.includes(tagName)) {
                selectedTags = selectedTags.filter(t => t !== tagName);
                tag.classList.remove('selected');
            } else {
                selectedTags.push(tagName);
                tag.classList.add('selected');
            }
            updateFilterBar();
            renderPosts(true);
        });
    });

    function updateFilterBar() {
        const bar = document.getElementById('active-filter-bar');
        const container = document.getElementById('filter-tags-container');
        if (selectedTags.length > 0) {
            bar.style.display = 'flex';
            container.innerHTML = selectedTags.map(t => `<span class="tag-pill">#${t}</span>`).join('');
        } else {
            bar.style.display = 'none';
        }
    }

    document.getElementById('clear-filter').onclick = () => {
        selectedTags = [];
        tagItems.forEach(t => t.classList.remove('selected'));
        updateFilterBar();
        renderPosts(true);
    };

    // [기능 8] 모달 및 팔로우 버튼 제어
    const modal = document.getElementById('modal-overlay');
    document.querySelectorAll('.stat-btn').forEach(btn => {
        btn.onclick = () => {
            const userType = document.body.getAttribute('data-user-type');
            document.getElementById('modal-title').innerText = btn.innerText.split(' ')[0] + " 목록";
            const listContainer = document.getElementById('modal-list');

            listContainer.innerHTML = mockUsers.map(u => `
                <li class="user-item">
                    <img src="${u.img}">
                    <div class="user-item-info"><span class="u-nick">${u.nick}</span><span class="u-bio">${u.bio}</span></div>
                    ${userType === 'visitor' ? '<button class="temp-mode-btn">팔로우</button>' : ''}
                </li>
            `).join('');
            modal.classList.add('active');
        };
    });
    document.querySelector('.close-modal').onclick = () => modal.classList.remove('active');

    // [기능 9] 드롭다운
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    window.onclick = (e) => {
        dropdown?.classList.remove('active');
        if (e.target === modal) modal.classList.remove('active');
    };

    // 핵심: 통합 렌더링 함수
    function renderPosts(isReset = false) {
        if (isReset) { listWrap.innerHTML = ''; page = 1; }

        // 필터링 로직
        let filtered = mockPosts.filter(p => {
            // 탭 필터
            const typeMatch = (currentType === 'all' && !p.isPaid) ||
                (currentType === 'paid' && p.isPaid) ||
                (currentType === 'scrap' && p.isScrap);
            // 검색 필터
            const searchMatch = p.title.toLowerCase().includes(searchQuery) ||
                p.content.toLowerCase().includes(searchQuery);
            // 다중 태그 필터 (AND 조건: 선택한 모든 태그를 포함해야 함)
            const tagMatch = selectedTags.length === 0 || selectedTags.every(t => p.tags.includes(t));

            return typeMatch && searchMatch && tagMatch;
        });

        // 정렬 로직
        if (currentSort === '조회순') filtered.sort((a, b) => b.views - a.views);
        else if (currentSort === '인기순') filtered.sort((a, b) => b.likes - a.likes);
        else if (currentSort === '댓글순') filtered.sort((a, b) => b.comments - a.comments);
        else filtered.sort((a, b) => b.id - a.id); // 최신순

        const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        if (slice.length === 0 && page === 1) {
            listWrap.innerHTML = '<p style="padding:50px; text-align:center;">글이 없습니다.</p>';
            return;
        }

        slice.forEach(post => {
            const html = `
                <article class="post-item" onclick="location.href='post_detail.html?id=${post.id}'" style="cursor:pointer;">
                    <div class="post-main">
                        <h2>${post.isPaid ? '<i class="fa-solid fa-crown" style="color:#9b5de5; margin-right:8px;"></i>' : ''}${post.title}</h2>
                        <p class="post-content">${post.content}</p>
                        <div class="post-stats">
                            <span><i class="fa-solid fa-heart"></i> ${post.likes}</span>
                            <span><i class="fa-solid fa-comment"></i> ${post.comments}</span>
                            <span><i class="fa-solid fa-eye"></i> ${post.views}</span> 
                            <span>${post.date}</span>
                        </div>
                        <div class="post-tags">${post.tags.map(t => `<span class="tag-pill">#${t}</span>`).join(' ')}</div>
                    </div>
                    <img src="${post.thumb}" class="post-thumb-img">
                </article>`;
            listWrap.insertAdjacentHTML('beforeend', html);
        });
    }

    // 무한 스크롤
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { page++; renderPosts(); }
    }, { threshold: 0.5 });
    observer.observe(document.getElementById('infinite-sentinel'));

    renderPosts(true);
});