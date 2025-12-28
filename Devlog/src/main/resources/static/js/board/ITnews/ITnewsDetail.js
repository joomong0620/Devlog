console.log("boardDetail.js loaded");

const boardLike = document.getElementById("boardLike");
// 좋아요 버튼이 클릭 되었을 때
boardLike.addEventListener("click", (e) => {
  // 로그인 X
  if (!loginMemberNo || loginMemberNo === "") {
    alert("로그인 후 이용해주세요.");
    return;
  }


  let check; // 기존에 좋아요 X(빈하트) : 0, 기존에 좋아요 O(꽉찬하트) : 1

  // contains("클래스명") : 클래스가 있으면 true, 없으면 false
  if (e.target.classList.contains("fa-regular")) {
    // 좋아요 X(빈하트)
    check = 0;
  } else {
    // 좋아요 O(꽉찬하트)
    check = 1;
  }


// ajax로 서버에 제출할 파라미터를 모아둔 JS 객체
  const data = { memberNo: loginMemberNo, boardNo: boardNo, check: check };

  // ajax 비동기 통신
  fetch("/ITnews/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((resp) => resp.text()) 
   .then((count) => {
    console.log("서버로부터 받은 최신 좋아요 수 : " + count);

    if (count == -1) {
        alert("좋아요 처리 실패ㅠㅠ");
        return;
    }

    // 1. 하트 아이콘 토글 (빈 하트 <-> 꽉 찬 하트)
    const boardLike = document.getElementById("boardLike");
    boardLike.classList.toggle("fa-regular");
    boardLike.classList.toggle("fa-solid");

    // 2. 숫자 업데이트 (id="likeCount"인 요소를 직접 찾아서 텍스트 변경)
    const likeCountSpan = document.getElementById("likeCount");
    if (likeCountSpan) {
        likeCountSpan.innerText = count; 
        console.log("화면 업데이트 완료!");
    } else {
        console.error("오류: id가 'likeCount'인 span 태그를 찾을 수 없습니다.");
    }

      // if(check == 0){ //기존에 좋아요를 X
        
      //   //게시글 작성자에게 알림 보내기
      //   sendNotification(
      //     "boardLike",
      //     location.pathname,
      //     boardNo, // 전역 변수 boardNo
      //     `<strong>${memberNickname}</strong>님이 <strong>${boardTitle}</strong> 게시글을 좋아합니다.`
      //   );
      // }

    })
    .catch((err) => { console.log(err);
    }); // 예외 발생 시 처리할 코드
});