// 댓글 목록 조회 부분 수정
function selectCommentList() {
    fetch("/ITnews/comment?boardNo=" + boardNo)
        .then((resp) => resp.json())
        .then((cList) => {
            const commentList = document.getElementById("commentList");
            commentList.innerHTML = "";

            for (let comment of cList) {
                const commentRow = document.createElement("li");
                commentRow.classList.add("comment-row");
                
                // 대댓글일 경우 'reply' 클래스 추가
                if(comment.parentNo != 0) {
                    commentRow.classList.add("reply");
                }
                
                commentRow.setAttribute("data-comment-id", comment.commentNo);

                // --- 작성자 정보---
                const commentWriter = document.createElement("p");
                commentWriter.classList.add("comment-writer");
                const profileImage = document.createElement("img");
                profileImage.classList.add("comment-profile");
                profileImage.setAttribute("src", comment.profileImage || "/images/common/user.png");
                const memberNickname = document.createElement("span");
                memberNickname.classList.add("comment-nickname");
                memberNickname.innerText = comment.memberNickname;
                const commentDate = document.createElement("span");
                commentDate.classList.add("comment-date");
                commentDate.innerText = "(" + comment.commentCreateDate + ")";
                commentWriter.append(profileImage, memberNickname, commentDate);

                // 댓글 내용
                const commentContent = document.createElement("p");
                commentContent.classList.add("comment-content");
                commentContent.innerHTML = comment.commentContent;

                // --- 추가: 반응 영역 (좋아요/싫어요) ---
                const commentActions = document.createElement("div");
                commentActions.classList.add("comment-actions");
                
                commentActions.innerHTML = `
                    <span class="reaction-area">
                        <i class="fa-heart comment-like-btn ${comment.likeCheck == 1 ? 'fa-solid' : 'fa-regular'}"></i>
                        <span class="count">${comment.likeCount}</span>
                    </span>
                    <span class="reaction-area">
                        <img src="/images/board/ITnews/comment_bad.svg" class="comment-bad-btn" 
                             style="filter: ${comment.badCheck == 1 ? 'grayscale(0%)' : 'grayscale(100%)'}">
                        <span class="count">${comment.badCount}</span>
                    </span>
                `;

                commentRow.append(commentWriter, commentContent, commentActions);

                // 수정/삭제 버튼 (내 댓글일 때)
                if (loginMemberNo && loginMemberNo == comment.memberNo) {
                    const btnArea = document.createElement("div");
                    btnArea.classList.add("comment-btn-area");
                    
                    const updateBtn = document.createElement("button");
                    updateBtn.innerText = "수정";
                    updateBtn.onclick = () => showUpdateComment(comment.commentNo, updateBtn);
                    
                    const deleteBtn = document.createElement("button");
                    deleteBtn.innerText = "삭제";
                    deleteBtn.onclick = () => deleteComment(comment.commentNo);
                    
                    btnArea.append(updateBtn, deleteBtn);
                    commentRow.append(btnArea);
                }

                // 답글 버튼 (부모 댓글일 때만)
                if(comment.parentNo == 0) {
                    const replyBtn = document.createElement("button");
                    replyBtn.innerText = "답글";
                    replyBtn.classList.add("reply-btn");
                    // replyBtn.onclick = ... (답글 작성창 토글 함수 연결)
                    commentRow.append(replyBtn);
                }

                commentList.append(commentRow);
            }
        })
}




// 댓글 등록
const addComment = document.getElementById("addComment");
const commentContent = document.getElementById("commentContent");

addComment.addEventListener("click", (e) => {
  console.log("댓글 등록 버튼 클릭");
  console.log("현재 loginMemberNo:", loginMemberNo);
  console.log("loginMemberNo 타입:", typeof loginMemberNo);

  // 로그인 체크
  if (!loginMemberNo || loginMemberNo == 0) {
    alert("로그인 후 이용해주세요.");
    return;
  }

  // 댓글 내용 체크
  if (commentContent.value.trim().length == 0) {
    alert("댓글을 작성한 후 버튼을 클릭해주세요.");
    commentContent.value = "";
    commentContent.focus();
    return;
  }

  const data = {
      "commentContent": commentContent.value, 
      "memberNo": loginMemberNo,
      "boardNo": boardNo,
      "parentCommentNo": 0
  }

  fetch("/ITnews/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((resp) => resp.text())
    .then((commentNo) => {
      if (commentNo > 0) {
        alert("댓글이 등록되었습니다.");
        console.log(commentNo);
        
        commentContent.value = "";

        // selectCommentList(); // 알림 요청
        // sendNotification(
        //     "insertComment",
        //     location.pathname + "?cn=" + commentNo, 
        //     boardNo,
        //      `<strong>${memberNickname}</strong>님이 <strong>${boardTitle}</strong> 게시글에 댓글을 작성했습니다.`

        // );
      } else {
        alert("댓글 등록에 실패했습니다...");
      }
    })
    .catch((err) => console.log(err));
});
