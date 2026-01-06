/* 오늘의 인기글 */
const postGrid = document.getElementById("postGrid");

fetch("/api/blog/list?page=0&size=6&sort=like")
  .then((res) => res.json())
  .then((data) => renderPopularPosts(data.content));

function renderPopularPosts(posts) {
  postGrid.innerHTML = "";

  posts.forEach((post) => {
    const card = `
      <div class="post-card"
           onclick="location.href='/blog/detail/${post.board_no}'"
           style="cursor:pointer">
        <div class="post-img">
          <img src="${
            post.thumbnail_url ?? "/images/logo.png"
          }">
        </div>
        <div class="post-info">
          <div class="post-top">
            <div class="likes">
              <img src="/images/common/like.png">
              <span>${post.like_count ?? 0}</span>
            </div>
            <span class="writer">Writer. ${
              post.member_nickname ?? "익명"
            }</span>
          </div>
          <p class="post-preview">${post.board_title}</p>
        </div>
      </div>
    `;
    postGrid.insertAdjacentHTML("beforeend", card);
  });
}

/* 최신 피드  */
const latestFeedGrid = document.getElementById("latestFeedGrid");

fetch("/api/blog/list?page=0&size=6")
  .then((res) => res.json())
  .then((data) => renderLatestFeed(data.content))
  .catch(console.error);

function renderLatestFeed(posts) {
  latestFeedGrid.innerHTML = "";

  posts.forEach((post) => {
    const preview = post.board_content
      ? post.board_content.replace(/<[^>]*>/g, "").slice(0, 60)
      : "";

    const card = `
      <div class="post-card"
           onclick="location.href='/blog/detail/${post.board_no}'"
           style="cursor:pointer">
        <div class="post-img">
          <img src="${
            post.thumbnail_url ?? "/images/logo.png"
          }">
        </div>
        <div class="post-info">
          <div class="post-top">
            <div class="likes">
              <img src="/images/common/heart.svg">
              <span>${post.like_count ?? 0}</span>
            </div>
            <span class="writer">Writer. ${
              post.member_nickname ?? "익명"
            }</span>
          </div>
          <p class="post-preview">${preview}</p>
        </div>
      </div>
    `;
    latestFeedGrid.insertAdjacentHTML("beforeend", card);
  });
}

/* 지식 뉴스는 컨트롤러 통해서 메인에서 타임리프로 불러옴 */


const cafes = [
  {
    name: "콘티뉴이티",
    address: "서울 중구 수표로 30 OK빌딩 3층",
    phone: "0507-1359-5675",
    hours: "영업시간 11:30 - 22:00",
    image: "cafe1.jpeg",
  },
  {
    name: "리프카페",
    address: "서울 종로구 대학로 8길 3",
    phone: "02-333-4444",
    hours: "영업시간 11:00 - 21:30",
    image: "cafe1.jpeg",
  },
  {
    name: "브루잉랩",
    address: "서울 서대문구 연희로 7길 10",
    phone: "02-555-9999",
    hours: "영업시간 09:00 - 22:30",
    image: "cafe1.jpeg",
  },
  {
    name: "카페 테라스",
    address: "서울 마포구 양화로 162",
    phone: "02-123-4567",
    hours: "영업시간 10:00 - 21:00",
    image: "cafe1.jpeg",
  },
  {
    name: "커피앤코드",
    address: "서울 성수동 12-3",
    phone: "02-222-1234",
    hours: "영업시간 11:00 - 23:00",
    image: "cafe1.jpeg",
  },
  {
    name: "하루디저트",
    address: "서울 강남구 논현로 55길 12",
    phone: "0507-1122-3344",
    hours: "영업시간 09:30 - 22:00",
    image: "cafe6.jpg",
  },
];

const cafeList = document.getElementById("cafeList");

cafes.forEach((cafe) => {
  const item = `
    <div class="cafe-item">
      <div class="cafe-thumb">
        <img src="${cafe.image}" alt="${cafe.name}" />
      </div>
      <div class="cafe-info">
        <h3 class="cafe-name">${cafe.name}</h3>
        <p class="cafe-address">${cafe.address}</p>
        <p class="cafe-phone">전화번호 ${cafe.phone}</p>
        <p class="cafe-hours">${cafe.hours}</p>
        <button class="cafe-btn">
          <img src="map-icon.svg" alt="길찾기 아이콘" /> 길찾기
        </button>
      </div>
    </div>
  `;
  cafeList.insertAdjacentHTML("beforeend", item);
});

//########################## 현재 활동 ###########################

let stompClient = null;

function connectOnlineStatus() {
  const socket = new SockJS("/ws-chat");
  stompClient = Stomp.over(socket);

  stompClient.connect(
    {},
    function (frame) {
      console.log("활동 상태 모니터링 시작");

      // 서버가 유저 목록을 뿌려주는 채널(/topic/friends) 구독
      stompClient.subscribe("/topic/friends", function (response) {
        const onlineUserList = JSON.parse(response.body); // 이름 리스트 ["소연", "철수"]
        updateFriendsUI(onlineUserList);
      });
    },
    function (error) {
      console.log("연결 실패, 5초 후 재시도");
      setTimeout(connectOnlineStatus, 5000);
    }
  );
}

// // 활동중인 친구 목록 나중에 요청으로 바꿀거임 지금은 그냥 더미
// const activeFriends = [
//   { img: "/images/common/profile2.jpeg", name: "유저일" },
//   { img: "/images/common/profile4.jpg", name: "유저이" },
//   { img: "/images/common/profile1.png", name: "유저삼" },
//   { img: "/images/common/profile5.png", name: "유저사" },
//   { img: "/images/common/profile6.png", name: "유저일오" },
//   { img: "/images/common/profile3.jpg", name: "유저이이" },
// ];

// const friendsList = document.getElementById("friendsList");

// activeFriends.forEach((friend) => {
//   const el = `
//   <div class="friend">
//     <img src="${friend.img}" alt="${friend.name}" title="${friend.name}" />
//   </div>
// `;
//   friendsList.insertAdjacentHTML("beforeend", el);
// });

// 화면에 친구 목록
function updateFriendsUI(users) {
  const friendsList = document.getElementById("friendsList");
  if (!friendsList) return;

  friendsList.innerHTML = "";

  const myEmail = document.getElementById("loginUserEmail")?.value || "";

  if (users.length === 0) {
    friendsList.innerHTML =
      "<p style='font-size:12px; color:#999;'>현재 활동중인 친구가 없어요.</p>";
    return;
  }

  users
    .filter((user) => user.name !== myEmail)
    .forEach((user) => {
      const displayName = user.name.split("@")[0];

      const profileUrl = `/blog/${user.name}`;
      const friendHtml = `
        <div class="friend active" title="${user.name}"
        onclick ="location.href='${profileUrl}'"
        style = "cursor: pointer;">
          <img src="${user.profile_img}" alt="${user.name}">
          <span class="friend-name" style="font-size:11px; display:block; text-align:center; margin-top:4px;">
            ${displayName}
          </span>
        </div>
      `;
      friendsList.insertAdjacentHTML("beforeend", friendHtml);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  connectOnlineStatus();
});
