const modal = document.getElementById("reportModal");
const moveButton = document.getElementById("moveButton");
const modalMessageContent = document.getElementById("modalMessageContent");

let currentTargetUrl = null;
let currentTargetType = null;
let currentReportId = null;
let currentMessageNo = null;

// 모달 내부 필요한 요소들
const modalReportNo = document.getElementById("modalReportNo");
const modalReportType = document.getElementById("modalReportType");
const modalReportDate = document.getElementById("modalReportDate");
const modalReason = document.getElementById("modalReason");
const modalTargetName = document.getElementById("modalTargetName");


// 신고 목록 행 클릭 시
function openModal(row) {
  const reportId = row.dataset.reportNo;
  currentReportId = reportId;

  const targetType = row.dataset.targetType;
  const reportType = row.dataset.reportType;
  const reportReason = row.dataset.reportReason;
  const targetName = row.dataset.target;
  const reportDate = row.dataset.reportDate;
  const messageContent = row.dataset.messageContent;

  currentTargetUrl = row.dataset.targetUrl;
  currentTargetType = targetType;
  currentMessageNo = row.dataset.messageNo;

  modalReportNo.value = reportId;
  modalReportType.value = reportType;
  modalReportDate.value = reportDate;
  modalReason.value = reportReason;
  modalTargetName.textContent = targetName;

  if (targetType === "BOARD") {
    moveButton.textContent = "해당 게시글 이동";
    modalMessageContent.classList.remove("open");
    document.getElementById("deleteMessageBtn").style.display = "none";
  } else {
    moveButton.textContent = "신고된 메시지 확인";

    modalMessageContent.textContent =
      messageContent || "신고된 메시지 내용이 없습니다.";

    modalMessageContent.classList.remove("open");
    document.getElementById("deleteMessageBtn").style.display = "inline-block";
  }

  modal.style.display = "flex";
}




// 모달 닫기
function closeModal() {
  modal.style.display = "none";
}

modal.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    closeModal();
  }
});

// // 중요!!!!!!! 해당 게시글로 실제로 이동 채팅이면 메시지 보여주기
// moveButton.addEventListener("click", function () {
//   if (!currentTargetId) return;

//   if (currentTargetType === "BOARD") {
//     location.href = `/board/detail?boardId=${currentTargetId}`;
//   } else {
//     location.href = `/chat/detail?chatId=${currentTargetId}`;
//   }
// });

moveButton.addEventListener("click", function () {
  if (!currentTargetType) return;

  if (currentTargetType === "BOARD") {
    location.href = currentTargetUrl;
    return;
  }

  
  // 채팅 신고
  modalMessageContent.classList.toggle("open");
});

const deleteBtn = document.getElementById("deleteMessageBtn");

deleteBtn.addEventListener("click", async () => {
  if (!currentMessageNo) {
    alert("삭제할 메시지가 없습니다.");
    return;
  }

  if (
    !confirm(
      "정말 이 메시지를 삭제하시겠습니까?\n삭제 시 신고는 자동으로 처리완료됩니다."
    )
  ) {
    return;
  }

  try {

    // 채팅 메세지 삭제
    const res = await fetch(
      `/devtalk/delete-msg?messageNo=${currentMessageNo}`,
      { method: "GET" }
    );

    if (!res.ok) throw new Error("메시지 삭제 실패");

    // 성공하면 신고 완료처리 하는 내 컨트로러로 요청 보냄
    const resolveRes = await fetch("/manager/dashboard/report/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId: currentReportId,
      }),
    });

    if (!resolveRes.ok) throw new Error("신고 처리 실패");

    alert("메시지가 삭제되었고, 신고가 처리완료되었습니다.");

    closeModal();

    location.reload();
  } catch (e) {
    console.error(e);
    alert("처리 중 오류가 발생했습니다.");
  }
});


