const modal = document.getElementById("reportModal");
const moveButton = document.getElementById("moveButton");
const modalMessageContent = document.getElementById("modalMessageContent");

let currentTargetUrl = null;
let currentTargetType = null;
let currentReportId = null;

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

  modalReportNo.value = reportId;
  modalReportType.value = reportType;
  modalReportDate.value = reportDate;
  modalReason.value = reportReason;
  modalTargetName.textContent = targetName;

  if (targetType === "BOARD") {
    moveButton.textContent = "해당 게시글 이동";
    modalMessageContent.classList.remove("open");
  } else {
    moveButton.textContent = "신고된 메시지 확인";

    modalMessageContent.textContent =
      messageContent || "신고된 메시지 내용이 없습니다.";

    modalMessageContent.classList.remove("open");
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