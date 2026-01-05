console.log("myDev.js loaded");

// 상태 관리 변수들
let currentSort = "id";
let currentType = "all"; // 현재 탭 상태 (all: 전체, paid: 유료)
let searchQuery = ""; // 검색어 상태 추가
let selectedTag = ""; // 태그 상태 추가
let page = 0;
const PAGE_SIZE = 6;
let isLoading = false;
let isLastPage = false;

// HTML 태그 제거 및 길이 제한 함수
function stripHtml(html) {
  if (!html) return "";
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
  if (!html) return "/images/logo.png";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");

  // 이미지가 있으면 그 주소, 없으면 로고 반환
  if (img) {
    return img.src;
  } else {
    return "/images/logo.png";
  }
}

// 팔로우 기능
function toggleFollow() {
  // blogOwnerId는 HTML 하단에서 정의됨 (주인장 이메일)
  if (!blogOwnerId) return;

  fetch(`/api/blog/follow/${blogOwnerId}`, {
    method: "POST",
  })
    .then((res) => {
      if (res.status === 401) {
        if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
          location.href = "/member/login";
        }
        return null;
      }
      return res.json();
    })
    .then((data) => {
      if (!data) return;

      if (data.success) {
        const btn = document.getElementById("btnFollow");
        const followerCntEl = document.getElementById("followerCnt");
        let currentCount = parseInt(followerCntEl.innerText);

        if (data.isFollowed) {
          // 팔로우 성공 상태로 변경
          btn.innerText = "팔로잉";
          btn.classList.add("active"); // CSS로 스타일링 (흰색 배경 등)
          // 숫자 증가
          followerCntEl.innerText = currentCount + 1;
        } else {
          // 언팔로우 상태로 변경
          btn.innerText = "팔로우";
          btn.classList.remove("active");
          // 숫자 감소
          followerCntEl.innerText = Math.max(0, currentCount - 1);
        }
      }
    })
    .catch((err) => console.error("Follow Error:", err));
}

/* =========================================
[추가] 유저 목록 모달 관련 로직
========================================= */

const modalOverlay = document.getElementById("userModal");
const modalTitle = document.getElementById("modalTitle");
const modalUserList = document.getElementById("modalUserList");

// 1. 모달 열기 함수
function openUserModal(type) {
  if (!blogOwnerId) {
    alert("블로그 정보가 없습니다.");
    return;
  }

  // 제목 설정
  let titleText = "";
  let apiUrl = "";

  if (type === "follower") {
    titleText = "팔로워 목록";
    // 예: /api/blog/{id}/followers
    apiUrl = `/api/blog/${blogOwnerId}/followers`;
  } else if (type === "following") {
    titleText = "팔로잉 목록";
    // 예: /api/blog/{id}/followings
    apiUrl = `/api/blog/${blogOwnerId}/followings`;
  } else if (type === "subscriber") {
    titleText = "구독자 목록";
    apiUrl = `/api/blog/${blogOwnerId}/subscribers`;
  }

  modalTitle.innerText = titleText;
  modalUserList.innerHTML =
    '<li style="text-align:center; padding:20px;">로딩 중...</li>';

  // 모달 표시
  modalOverlay.classList.add("active");

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
    modalUserList.innerHTML =
      '<li style="text-align:center; color:red;">목록을 불러오는데 실패했습니다.</li>';
  }
}

// 3. 리스트 HTML 그리기
function renderUserList(users) {
  modalUserList.innerHTML = ""; // 초기화

  if (!users || users.length === 0) {
    modalUserList.innerHTML =
      '<li style="text-align:center; padding:20px; color:#999;">목록이 비어있습니다.</li>';
    return;
  }

  users.forEach((user) => {
    // 프로필 이미지 없으면 기본 이미지
    const profileImg = user.profileImgUrl
      ? user.profileImgUrl
      : "https://placehold.co/40x40/eee/999?text=U";
    // 소개글 없으면 빈칸
    const bio = user.bio ? user.bio : "";

    let btnHtml = "";

    if (user.isFollowed) {
      btnHtml = `<button class="modal-follow-btn active" onclick="toggleModalFollow(this, '${user.id}')" style="margin-left:auto;">팔로잉</button>`;
    } else {
      btnHtml = `<button class="modal-follow-btn" onclick="toggleModalFollow(this, '${user.id}')" style="margin-left:auto;">팔로우</button>`;
    }

    // 유저 아이템 HTML (클릭 시 해당 유저 블로그로 이동 기능 추가 가능)
    const li = document.createElement("li");
    li.className = "user-item";
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
  fetch(`/api/blog/follow/${targetId}`, { method: "POST" })
    .then((res) => {
      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        return null;
      }
      return res.json();
    })
    .then((data) => {
      if (!data) return;

      if (data.success) {
        // 1. 모달 버튼 디자인 토글 (modal-follow-btn active 클래스 활용)
        if (data.isFollowed) {
          btn.innerText = "팔로잉";
          btn.classList.add("active");
        } else {
          btn.innerText = "팔로우";
          btn.classList.remove("active");
        }

        // 2. [핵심] 메인 화면의 '팔로잉 숫자' 즉시 업데이트
        // 방금 HTML에 추가한 id="followingCnt"를 찾습니다.
        const followingCntEl = document.getElementById("followingCnt");

        if (followingCntEl) {
          // 현재 숫자를 가져와서 정수로 변환 (콤마가 있을 수 있으니 제거 후 변환 추천)
          let currentVal =
            parseInt(followingCntEl.innerText.replace(/,/g, "")) || 0;

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
  modalOverlay.classList.remove("active");
}

// 5. 모달 바깥 영역 클릭 시 닫기
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeUserModal();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const listWrap = document.getElementById("post-list-wrap");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tagItems = document.querySelectorAll(".tag-item");
  const filterItems = document.querySelectorAll(".filter-item");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn"); // 검색 아이콘 버튼 ID 가정
  const goTopBtn = document.getElementById("goTopBtn");
  const blogOptionBtn = document.getElementById("blogOptionBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");

  // [기능 1] TOP 버튼
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      goTopBtn.style.display = "block";
    } else {
      goTopBtn.style.display = "none";
    }
  });
  goTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // [기능 2] 검색 기능
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchQuery = searchInput.value.trim();
        renderPosts(true); // 검색어 포함하여 초기화 후 다시 불러오기
      }
    });
  }
  if (searchBtn) {
    searchBtn.onclick = () => {
      searchQuery = searchInput.value.trim();
      renderPosts(true);
    };
  }

  // [기능 3] 정렬 필터
  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      filterItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const sortText = item.getAttribute("data-sort");
      // 백엔드 Pageable sort 파라미터에 맞게 매핑
      if (sortText === "view") currentSort = "viewCount";
      else if (sortText === "like") currentSort = "likeCount";
      else if (sortText === "comment") currentSort = "commentCount";
      else currentSort = "id"; // 최신순 (latest)

      renderPosts(true);
    });
  });

  // [기능 4] 탭 클릭 (수정됨!)
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 1. 스타일 변경
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 2. [추가됨 2] 탭 타입 변경 (HTML의 data-type 속성 읽기)
      const newType = btn.getAttribute("data-type"); // 'all' 또는 'paid'

      if (currentType !== newType) {
        currentType = newType;
        console.log("탭 변경됨:", currentType); // 확인용 로그
        renderPosts(true); // 목록 초기화하고 다시 불러오기
      }
    });
  });

  // [기능 5] 태그 클릭
  tagItems.forEach((tag) => {
    tag.addEventListener("click", () => {
      // 스타일 토글
      tagItems.forEach((t) => t.classList.remove("selected"));

      const tagValue = tag.getAttribute("data-tag");
      if (selectedTag === tagValue) {
        selectedTag = ""; // 이미 선택된 걸 다시 누르면 해제
      } else {
        tag.classList.add("selected");
        selectedTag = tagValue;
      }
      renderPosts(true);
    });
  });

  // 닉네임 옆 점 세개(내 활동, 프로필 설정) 드롭다운
  if (blogOptionBtn && dropdownMenu) {
    // 1. 버튼 클릭 시 메뉴 열기/닫기
    blogOptionBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // 이벤트가 부모로 전파되지 않게 막음
      dropdownMenu.classList.toggle("active"); // CSS에 정의된 .active 클래스 토글
    });

    // 2. 화면의 빈 곳을 클릭하면 메뉴 닫기
    document.addEventListener("click", (e) => {
      if (
        !dropdownMenu.contains(e.target) &&
        !blogOptionBtn.contains(e.target)
      ) {
        dropdownMenu.classList.remove("active");
      }
    });
  }

  // 게시글 로딩 함수 부분
  async function renderPosts(isReset = false) {
    if (isLoading) return;

    if (isReset) {
      listWrap.innerHTML = "";
      page = 0;
      isLastPage = false;
    }

    if (isLastPage) return;

    isLoading = true;
    const loader = document.getElementById("infinite-sentinel");
    if (loader) loader.style.display = "block";

    try {
      const url = `/api/blog/${blogOwnerId}/list?page=${page}&size=${PAGE_SIZE}&sort=${currentSort}&type=${currentType}&query=${encodeURIComponent(
        searchQuery
      )}&tag=${encodeURIComponent(selectedTag)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("데이터 로드 실패");

      const data = await response.json();
      const posts = data.content;

      // 데이터가 없을 때 메시지 (기존 유지)
      if ((!posts || posts.length === 0) && page === 0) {
        listWrap.innerHTML = `<div style="padding:50px; text-align:center; width:100%; color:#666;"><p>결과가 없습니다.</p></div>`;
        isLastPage = true;
      }

      if (posts) {
        posts.forEach((post) => {
          const bNo = post.boardNo || post.board_no;
          const bTitle = post.boardTitle || post.board_title || "제목 없음";
          const bContent = post.boardContent || post.board_content || "";
          const bDate = post.bcreateDate || post.bcreate_date || "";

          // 카운트 수 반영 (이미 방어코드가 잘 작성되어 있습니다)
          const lCount = post.likeCount ?? post.like_count ?? 0;
          const cCount = post.commentCount ?? post.comment_count ?? 0;
          const vCount = post.boardCount ?? post.board_count ?? 0;
          const isPaidStatus = post.isPaid || post.is_paid || "N";

          const thumb = extractFirstImage(bContent);
          const desc = stripHtml(bContent);

          // 유료글 "Premium" 텍스트를 "왕관 아이콘"으로 변경
          const paidIcon =
            isPaidStatus === "Y"
              ? '<i class="fa-solid fa-crown" style="color:#ffca28; margin-right:8px; font-size: 0.9em;"></i>'
              : "";

          let tagsHtml = "";
          const tagList = post.tagList || post.tag_list;
          if (tagList) {
            tagList.forEach((t) => {
              tagsHtml += `<span class="tag-pill">#${t}</span> `;
            });
          }

          const html = `
                    <article class="post-item" onclick="location.href='/blog/detail/${bNo}'" style="cursor:pointer;">
                        <div class="post-main">
                            <h2>${paidIcon}${bTitle}</h2>
                            <p class="post-content">${desc}</p> 
                            <div class="post-stats">
                                <span><i class="fa-solid fa-heart"></i> ${lCount}</span>
                                <span><i class="fa-solid fa-comment"></i> ${cCount}</span>
                                <span><i class="fa-solid fa-eye"></i> ${vCount}</span> 
                                <span>${bDate}</span> 
                            </div>
                            <div class="post-tags">${tagsHtml}</div>
                        </div>
                        <img src="${thumb}" class="post-thumb-img" alt="thumbnail" onerror="this.src='/images/logo.png'">
                    </article>`;

          listWrap.insertAdjacentHTML("beforeend", html);
        });
      }

      if (data.last) {
        isLastPage = true;
        if (loader) loader.style.display = "none";
      } else {
        page++;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      isLoading = false;
    }
  }

  // 무한 스크롤 옵저버
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoading && !isLastPage) {
        renderPosts();
      }
    },
    { threshold: 0.5 }
  );

  const sentinel = document.getElementById("infinite-sentinel");
  if (sentinel) observer.observe(sentinel);

  // 초기 로드
  renderPosts(true);
});

document.addEventListener("DOMContentLoaded", () => {
  const subModal = document.getElementById("subModal");
  const btnSubscribe = document.querySelector(".btn-purple[data-sub-price]"); // 구독 버튼

  if (btnSubscribe) {
    btnSubscribe.addEventListener("click", () => {
      // 1. 필요한 데이터 준비
      const price = btnSubscribe.getAttribute("data-sub-price");
      const blogOwnerNickname =
        document.querySelector(".nickname-area h1").innerText;

      document.getElementById("subDisplayPrice").innerText =
        Number(price).toLocaleString();
      document.getElementById("subBlogOwner").innerText = blogOwnerNickname;

      // 3. 내 보유 커피콩 불러오기 (AJAX)
      fetch("/payment/myBeans")
        .then((res) => {
          console.log("응답 상태 코드:", res.status); // 200이 아니면 주소나 세션 문제
          if (!res.ok) throw new Error("네트워크 응답 이상");
          return res.text(); // 일단 텍스트로 받아서 확인
        })
        .then((text) => {
          console.log("서버에서 온 실제 내용:", text); // 여기서 HTML이 찍히면 주소 오류
          const data = JSON.parse(text);

          if (data && data.beans_amount !== undefined) {
            document.getElementById("myBeanBalance").innerText =
              data.beans_amount.toLocaleString();
            subModal.classList.add("active");
          }
        })
        .catch((err) => {
          console.error("에러 발생 지점:", err); // 브라우저 F12 콘솔에 찍히는 내용을 확인하세요!
          alert("정보를 불러오지 못했습니다.");
        });
    });
  }

  // 모달 닫기
  document.getElementById("closeSubModal").addEventListener("click", () => {
    subModal.classList.remove("active");
  });

  // 최종 구매하기 버튼 클릭
  document.getElementById("btnFinalSubscribe").addEventListener("click", () => {
    // 1. 화면에 표시된 잔액과 가격 가져오기
    const balanceText = document
      .getElementById("myBeanBalance")
      .innerText.replace(/,/g, "");
    const priceText = document
      .getElementById("subDisplayPrice")
      .innerText.replace(/,/g, "");

    const balance = parseInt(balanceText);
    const finalPrice = parseInt(priceText); // 변수명 통일 (priceValue 대신 finalPrice)

    // 2. 잔액 검증
    if (balance < finalPrice) {
      if (confirm("커피콩이 부족합니다. 충전 페이지로 이동하시겠습니까?")) {
        location.href = "/coffeebeans";
      }
      return;
    }

    // 3. 구독 요청 전송
    if (confirm("정말로 구독하시겠습니까?")) {
      const subData = {
        contentType: "SUBSCRIBE",
        contentId: blogOwnerNo, // Service 로직의 if문을 통과하기 위해 contentId 사용
        price: finalPrice, // 위에서 선언한 finalPrice 사용
        subscriberId: loginMemberNo,
      };

      console.log("서버로 보내는 데이터:", subData);

      fetch("/payment/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subData),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result > 0) {
            alert("구독이 완료되었습니다!");
            location.reload();
          } else if (result === -2) {
            alert("잔액이 부족합니다.");
          } else {
            alert("구독 처리 중 오류가 발생했습니다.");
          }
        })
        .catch((err) => {
          console.error("구독 요청 에러:", err);
          alert("서버 통신 중 오류가 발생했습니다.");
        });
    }
  });
});
