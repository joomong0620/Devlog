console.log("myDev.js loaded");

// 상태 관리 변수들
let currentSort = 'id';
let currentType = 'all'; // [추가됨 1] 현재 탭 상태 (all: 전체, paid: 유료)
let page = 0;
const PAGE_SIZE = 6;
let isLoading = false;
let isLastPage = false;

// HTML 태그 제거 및 길이 제한 함수
function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || "";
    if (text.length > 30) {
        text = text.substring(0, 30) + "...";
    }
    return text;
}

// 본문에서 첫 번째 이미지 URL 추출 (없으면 로고 반환)
function extractFirstImage(html) {
    // 내용이 없으면 로고 반환
    if (!html) return '/images/logo.png';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const img = doc.querySelector('img');

    // 이미지가 있으면 그 주소, 없으면 로고 반환
    if (img) {
        return img.src;
    } else {
        return '/images/logo.png';
    }
}

// 팔로우 기능
function toggleFollow() {
    // blogOwnerId는 HTML 하단에서 정의됨 (주인장 이메일)
    if (!blogOwnerId) return;

    fetch(`/api/blog/follow/${blogOwnerId}`, {
        method: 'POST'
    })
        .then(res => {
            if (res.status === 401) {
                if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
                    location.href = "/member/login";
                }
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;

            if (data.success) {
                const btn = document.getElementById('btnFollow');
                const followerCntEl = document.getElementById('followerCnt');
                let currentCount = parseInt(followerCntEl.innerText);

                if (data.isFollowed) {
                    // 팔로우 성공 상태로 변경
                    btn.innerText = "팔로잉";
                    btn.classList.add('active'); // CSS로 스타일링 (흰색 배경 등)
                    // 숫자 증가
                    followerCntEl.innerText = currentCount + 1;
                } else {
                    // 언팔로우 상태로 변경
                    btn.innerText = "팔로우";
                    btn.classList.remove('active');
                    // 숫자 감소
                    followerCntEl.innerText = Math.max(0, currentCount - 1);
                }
            }
        })
        .catch(err => console.error("Follow Error:", err));
}

/* =========================================
[추가] 유저 목록 모달 관련 로직
========================================= */

const modalOverlay = document.getElementById('userModal');
const modalTitle = document.getElementById('modalTitle');
const modalUserList = document.getElementById('modalUserList');

// 1. 모달 열기 함수
function openUserModal(type) {
    if (!blogOwnerId) {
        alert("블로그 정보가 없습니다.");
        return;
    }

    // 제목 설정
    let titleText = "";
    let apiUrl = "";

    if (type === 'follower') {
        titleText = "팔로워 목록";
        // 예: /api/blog/{id}/followers
        apiUrl = `/api/blog/${blogOwnerId}/followers`;
    } else if (type === 'following') {
        titleText = "팔로잉 목록";
        // 예: /api/blog/{id}/followings
        apiUrl = `/api/blog/${blogOwnerId}/followings`;
    } else if (type === 'subscriber') {
        titleText = "구독자 목록";
        apiUrl = `/api/blog/${blogOwnerId}/subscribers`;
    }

    modalTitle.innerText = titleText;
    modalUserList.innerHTML = '<li style="text-align:center; padding:20px;">로딩 중...</li>';

    // 모달 표시
    modalOverlay.classList.add('active');

    // 데이터 가져오기
    fetchUserList(apiUrl);
}

// 2. 유저 목록 API 호출 및 렌더링
async function fetchUserList(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("목록을 불러오지 못했습니다.");

        const users = await res.json(); // List<UserDto> 형태 가정

        renderUserList(users);

    } catch (err) {
        console.error(err);
        modalUserList.innerHTML = '<li style="text-align:center; color:red;">목록을 불러오는데 실패했습니다.</li>';
    }
}

// 3. 리스트 HTML 그리기
function renderUserList(users) {
    modalUserList.innerHTML = ''; // 초기화

    if (!users || users.length === 0) {
        modalUserList.innerHTML = '<li style="text-align:center; padding:20px; color:#999;">목록이 비어있습니다.</li>';
        return;
    }

    users.forEach(user => {
        // 프로필 이미지 없으면 기본 이미지
        const profileImg = user.profileImgUrl ? user.profileImgUrl : 'https://placehold.co/40x40/eee/999?text=U';
        // 소개글 없으면 빈칸
        const bio = user.bio ? user.bio : '';

        let btnHtml = '';

        if (user.isFollowed) {
            btnHtml = `<button class="modal-follow-btn active" onclick="toggleModalFollow(this, '${user.id}')" style="margin-left:auto;">팔로잉</button>`;
        } else {
            btnHtml = `<button class="modal-follow-btn" onclick="toggleModalFollow(this, '${user.id}')" style="margin-left:auto;">팔로우</button>`;
        }

        // 유저 아이템 HTML (클릭 시 해당 유저 블로그로 이동 기능 추가 가능)
        const li = document.createElement('li');
        li.className = 'user-item';
        li.innerHTML = `
            <img src="${profileImg}" alt="profile" style="cursor:pointer;" onclick="location.href='/blog/${user.id}'">
            <div class="user-item-info">
                <span class="u-nick" onclick="location.href='/blog/${user.id}'" style="cursor:pointer;">
                    ${user.nickname}
                </span>
                <span class="u-bio">${bio}</span>
            </div>
            ${btnHtml}  
        `;
        modalUserList.appendChild(li);
    });
}

// 모달 내부 팔로우 버튼 동작
function toggleModalFollow(btn, targetId) {
    fetch(`/api/blog/follow/${targetId}`, { method: 'POST' })
        .then(res => {
            if (res.status === 401) {
                alert("로그인이 필요합니다.");
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;

            if (data.success) {
                // 1. 모달 버튼 디자인 토글 (modal-follow-btn active 클래스 활용)
                if (data.isFollowed) {
                    btn.innerText = "팔로잉";
                    btn.classList.add('active');
                } else {
                    btn.innerText = "팔로우";
                    btn.classList.remove('active');
                }

                // 2. [핵심] 메인 화면의 '팔로잉 숫자' 즉시 업데이트
                // 방금 HTML에 추가한 id="followingCnt"를 찾습니다.
                const followingCntEl = document.getElementById('followingCnt');

                if (followingCntEl) {
                    // 현재 숫자를 가져와서 정수로 변환 (콤마가 있을 수 있으니 제거 후 변환 추천)
                    let currentVal = parseInt(followingCntEl.innerText.replace(/,/g, '')) || 0;

                    if (data.isFollowed) {
                        // 팔로우 성공 -> 숫자 +1
                        followingCntEl.innerText = currentVal + 1;
                    } else {
                        // 언팔로우 성공 -> 숫자 -1 (0보다 작아지진 않게 방어)
                        followingCntEl.innerText = Math.max(0, currentVal - 1);
                    }
                }
            }
        })
        .catch(console.error);
}

// 4. 모달 닫기 함수
function closeUserModal() {
    modalOverlay.classList.remove('active');
}

// 5. 모달 바깥 영역 클릭 시 닫기
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeUserModal();
    }
});


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

                    // 썸네일 추출 (본문에서 이미지 꺼내기 + 없으면 로고)
                    const thumb = extractFirstImage(post.boardContent);

                    // 본문 내용 태그 제거 (글자만 남기기)
                    const desc = stripHtml(post.boardContent);

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
                                <p class="post-content">${desc}</p> <div class="post-stats">
                                    <span><i class="fa-solid fa-heart"></i> ${post.likeCount}</span>
                                    <span><i class="fa-solid fa-comment"></i> ${post.commentCount}</span>
                                    <span><i class="fa-solid fa-eye"></i> ${post.boardCount}</span> 
                                    <span>${post.bcreateDate}</span> 
                                </div>
                                <div class="post-tags">${tagsHtml}</div>
                            </div>
                            <img src="${thumb}" class="post-thumb-img" alt="thumbnail" onerror="this.src='/images/logo.png'">
                        </article>`;

                    listWrap.insertAdjacentHTML('beforeend', html);
                });

                // [추가] 데이터가 로드됐는데 스크롤이 안 생길 정도로 적으면, 자동으로 다음 페이지 로드 시도
                const observerEl = document.getElementById('infinite-sentinel');
                if (observerEl && !isLastPage && document.body.scrollHeight <= window.innerHeight) {
                    // 약간의 딜레이 후 재호출
                    setTimeout(() => {
                        page++; // 페이지 수동 증가 후 호출
                        renderPosts();
                    }, 500);
                }
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