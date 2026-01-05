const posts = [
  {
    image: "/images/sample1.png",
    likes: 152,
    writer: "김소연",
    preview: "따뜻한 조명과 함께 작업하기 좋은 공간을 소개합니다.",
  },
  {
    image: "/images/sample2.png",
    likes: 87,
    writer: "홍길동",
    preview: "오늘은 코드를 정리하면서 느낀 점들을 공유해보려 합니다.",
  },
  {
    image: "/images/sample3.png",
    likes: 233,
    writer: "ZeroBoost",
    preview: "개발자 커뮤니티에 새로운 글 작성 기능을 추가했어요!",
  },
  {
    image: "/images/sample4.png",
    likes: 402,
    writer: "요상한고앵이",
    preview: "회사앞에 제발로 찾아온 고양이, 입사시켜도 될까요?",
  },
  {
    image: "/images/sample5.png",
    likes: 593,
    writer: "재택근무워너비",
    preview: "부서 내에 좋아하는 사람이 생겼어요. 어쩌죠?",
  },
  {
    image: "/images/sample6.png",
    likes: 553,
    writer: "김주연",
    preview:
      "왜나한테만그러는데왜나한테만그러는데왜나한테만그러는데왜나한테만그러는데",
  },
];

const postGrid = document.getElementById("postGrid");

posts.forEach((post) => {
  const card = `
  <div class="post-card">
    <div class="post-img">
      <img src="${post.image}" alt="post" />
    </div>
    <div class="post-info">
      <div class="post-top">
        <div class="likes">
          <img src="heart.svg" alt="like" />
          <span>${post.likes}</span>
        </div>
        <span class="writer">Writer. ${post.writer}</span>
      </div>
      <p class="post-preview">${post.preview}</p>
    </div>
  </div>
`;
  postGrid.insertAdjacentHTML("beforeend", card);
});

// 최신 피드용 더미 데이터
// 지금은 더미데이터고, 나중에는 스프링부트 fetch 요청으로 바꿀 예정입니다.
const latestPosts = [
  {
    image: "sample1.jpg",
    likes: 284,
    writer: "소연",
    preview: "회사 앞에 있는 길냥이인데 이 자식 자세가 심상치 않습니다.",
  },
  {
    image: "sample2.jpg",
    likes: 212,
    writer: "스크롤",
    preview: "어쩌다보니 그림 그리는데 이게 또 재밌더라구요.",
  },
  {
    image: "sample3.jpg",
    likes: 195,
    writer: "소요",
    preview: "아직까지 지금 회사 구내식당만큼 맛있는 곳을 찾지 못한 것 같다.",
  },
  {
    image: "sample4.jpg",
    likes: 153,
    writer: "소빵",
    preview: "부서 내에 좋아하는 사람이 생긴 것 같아요. 사내연애는 비추인가요?",
  },
  {
    image: "sample5.jpg",
    likes: 93,
    writer: "소샤",
    preview:
      "오늘은 재택근무 하는 날~ 혹시 저처럼 데스크테리어 좋아하는 분들 계신가요?",
  },
  {
    image: "sample1.jpg",
    likes: 284,
    writer: "소연",
    preview: "회사 앞에 있는 길냥이인데 이 자식 자세가 심상치 않습니다.",
  },
  {
    image: "sample2.jpg",
    likes: 212,
    writer: "스크롤",
    preview: "어쩌다보니 그림 그리는데 이게 또 재밌더라구요.",
  },
  {
    image: "sample3.jpg",
    likes: 195,
    writer: "소요",
    preview: "아직까지 지금 회사 구내식당만큼 맛있는 곳을 찾지 못한 것 같다.",
  },
  {
    image: "sample4.jpg",
    likes: 153,
    writer: "소빵",
    preview: "부서 내에 좋아하는 사람이 생긴 것 같아요. 사내연애는 비추인가요?",
  },
  {
    image: "sample5.jpg",
    likes: 93,
    writer: "소샤",
    preview:
      "오늘은 재택근무 하는 날~ 혹시 저처럼 데스크테리어 좋아하는 분들 계신가요?",
  },
];

const latestFeedGrid = document.getElementById("latestFeedGrid");

latestPosts.forEach((post) => {
  const card = `
  <div class="post-card">
    <div class="post-img">
      <img src="${post.image}" alt="post" />
    </div>
    <div class="post-info">
      <div class="post-top">
        <div class="likes">
          <img src="heart.svg" alt="like" />
          <span>${post.likes}</span>
        </div>
        <span class="writer">Writer. ${post.writer}</span>
      </div>
      <p class="post-preview">${post.preview}</p>
    </div>
  </div>
`;
  latestFeedGrid.insertAdjacentHTML("beforeend", card);
});



const newsList = [
  {
    title: "게임 축제 'AGF 2025', 뜨거운 열기…일산 킨텍스 '인산인해'",
    desc: "(지디넷코리아=정진성 기자)국내 최대 규모의 서브컬쳐 축제 'AGF 2025(Anime X Game Festival)'가 지난 5일 고양시 킨텍스에서 화려한 막을 올렸다. 7일까지 사흘 동안...",
    image: "sample_news1.jpg",
  },
  {
    title: "폴더블 아이폰, 300만원대?…‘돈값’ 할까",
    desc: "(지디넷코리아=이정현 미디어연구소) 최근 원자재 및 부품 가격이 상승하면서 내년에 출시될 것으로 예상되는 아이폰 폴드의 가격에 관심이 높아지고 있다.",
    image: "sample_news2.jpg",
  },
  {
    title: "여친에게 사과 메시지 보냈다가 '식겁'...카톡 대참사 무슨 일?..",
    desc: "“그렇게 느낄 수도 있겠다 미안해. 나도 진짜 같이 준비하는 게 좋고 너랑 이런 얘기 나누는 게 설레는데...” 네티즌들 사이에서 화제인 카톡 대화 사건.",
    image: "sample_news3.jpg",
  },
  {
    title: "크래프톤, 'AI 펠로우십' 4기 모집 '1000만원 장학금'",
    desc: "(주)크래프톤은 AI 인재 양성 프로그램 ‘크래프톤 AI 펠로우십(KRAFTON AI Fellowship Program)’ 4기를 모집한다고 밝혔다.",
    image: "sample_news4.jpg",
  },
];

const newsGrid = document.getElementById("newsGrid");

newsList.forEach((news) => {
  const card = `
    <div class="news-card">
      <div class="news-text">
        <h3 class="news-title">${news.title}</h3>
        <p class="news-desc">${news.desc}</p>
      </div>
      <div class="news-thumb">
        <img src="${news.image}" alt="news thumbnail" />
      </div>
    </div>
  `;
  newsGrid.insertAdjacentHTML("beforeend", card);
});

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


users.filter(user => user.name !== myEmail).forEach((user) => {
  const displayName = user.name.split('@')[0];

  const profileUrl = `/blog/${user.name}`
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





