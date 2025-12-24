document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-item');
    const listContainer = document.getElementById('list-container');
    const sectionTitle = document.getElementById('section-title');
    const loadingSpinner = document.getElementById('loading-spinner');

    // 모달 관련
    const modal = document.getElementById('delete-modal');
    const btnCancel = document.getElementById('btn-cancel-delete');
    const btnConfirm = document.getElementById('btn-confirm-delete');
    let targetDeleteId = null;

    // 탭 클릭 이벤트
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabType = tab.dataset.tab;
            updateTitle(tabType);
            fetchData(tabType);
        });
    });

    function updateTitle(type) {
        const titles = {
            'likes': '좋아요 한 게시물',
            'history': '최근 본 게시물',
            'drafts': '임시 저장한 글',
            'purchases': '구매 내역'
        };
        sectionTitle.textContent = titles[type];
    }

    function fetchData(type) {
        listContainer.innerHTML = '';
        listContainer.appendChild(loadingSpinner);
        loadingSpinner.style.display = 'flex';

        setTimeout(() => {
            const data = getMockData(type);
            renderList(data, type);
        }, 300);
    }

    function renderList(items, type) {
        listContainer.innerHTML = '';

        if (items.length === 0) {
            listContainer.innerHTML = '<p style="color:#999; padding:20px;">내역이 없습니다.</p>';
            return;
        }

        const isDraft = (type === 'drafts');

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'post-item';

            // 1. 링크 설정
            // 임시저장이면 에디터로, 아니면 게시글 상세로 이동
            const contentLink = isDraft ? `/write?id=${item.id}` : `/post/${item.id}`;

            // 2. 제목 앞 아이콘 (구매내역인 경우만)
            const titlePrefix = (type === 'purchases') ? '<i class="fa-solid fa-crown crown-icon"></i> ' : '';

            // 3. 게시판/작성자 정보 (임시저장은 안보임)
            let metaInfoHtml = '';
            if (!isDraft) {
                // 블로그 글이면 작성자 닉네임, 아니면 게시판 이름
                const sourceName = (item.category === 'BLOG') ? item.author : item.boardName;
                const sourceLink = (item.category === 'BLOG') ? `/blog/${item.authorId}` : `/board/${item.boardId}`;
                metaInfoHtml = `<a href="${sourceLink}" class="source-link">${sourceName}</a>`;
            }

            // 4. 태그 (임시저장이 아니고, 카테고리가 블로그일 때만 표시)
            let tagsHtml = '';
            if (!isDraft && item.category === 'BLOG' && item.tags && item.tags.length > 0) {
                const tags = item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
                tagsHtml = `<div class="post-tags">${tags}</div>`;
            }

            // 5. 삭제 버튼 (임시저장인 경우만)
            const deleteHtml = isDraft
                ? `<div class="delete-btn-wrapper" onclick="openDeleteModal(${item.id})"><i class="fa-regular fa-trash-can"></i></div>`
                : '';

            // HTML 조립
            itemEl.innerHTML = `
                <a href="${contentLink}" class="thumb-link">
                    <img src="${item.img}" alt="썸네일" class="post-thumb">
                </a>
                <div class="post-info">
                    <div class="post-header">
                        <a href="${contentLink}" class="title-link">
                            <span>${titlePrefix}${item.title}</span>
                        </a>
                        ${deleteHtml}
                    </div>
                    ${metaInfoHtml}
                    ${tagsHtml}
                </div>
            `;
            listContainer.appendChild(itemEl);
        });
    }

    // 모달 로직
    window.openDeleteModal = (id) => {
        targetDeleteId = id;
        modal.classList.remove('hidden');
    };
    btnCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
        targetDeleteId = null;
    });
    btnConfirm.addEventListener('click', () => {
        alert(`ID: ${targetDeleteId} 삭제 완료 (UI 갱신 필요)`);
        modal.classList.add('hidden');
        fetchData('drafts'); // 목록 갱신 시뮬레이션
    });

    // 초기 실행
    fetchData('likes');
});

// Mock Data (수정된 요구사항 반영)
function getMockData(type) {
    const thumb = 'https://via.placeholder.com/150';

    // 카테고리: 'BLOG', 'NEWS', 'JOB'

    if (type === 'likes' || type === 'history') {
        return [
            {
                id: 1, img: thumb, category: 'JOB',
                title: '2025년 12월 신입/경력 채용',
                boardName: 'IT 채용정보', boardId: 'job',
                tags: [] // 채용정보는 태그 안나옴
            },
            {
                id: 2, img: thumb, category: 'NEWS',
                title: '게임 축제 "AGF 2025", 뜨거운 열기',
                boardName: 'IT 지식뉴스', boardId: 'news',
                tags: [] // 뉴스는 태그 안나옴
            },
            {
                id: 3, img: thumb, category: 'BLOG',
                title: '개발자 첫 출근 시 기강 잡는 OOTD',
                author: 'Fit_the_size', authorId: 'user100',
                tags: ['OOTD', '출근', 'Java'] // 블로그만 태그 나옴
            },
            {
                id: 4, img: thumb, category: 'BLOG',
                title: '사수님에게 잘 보이는 법 (질문 잘하는 법)',
                author: 'Dev_master123', authorId: 'user200',
                tags: ['사수', '인사', '꿀팁']
            }
        ];
    }
    else if (type === 'drafts') {
        // 임시저장: 제목, 썸네일만 있음
        return [
            { id: 101, img: thumb, title: 'Spring Boot JPA 정복기 (작성중)' },
            { id: 102, img: thumb, title: '리액트 훅 완벽 가이드 (초안)' }
        ];
    }
    else if (type === 'purchases') {
        // 구매내역: 유료 글
        return [
            {
                id: 3, img: thumb, category: 'BLOG',
                title: '개발자 첫 출근 시 기강 잡는 OOTD (Premium)',
                author: 'Fit_the_size', authorId: 'user100',
                tags: ['OOTD', '출근']
            }
        ];
    }
    return [];
}