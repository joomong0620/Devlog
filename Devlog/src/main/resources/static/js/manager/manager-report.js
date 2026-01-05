const modal = document.getElementById("reportModal");
const moveButton = document.getElementById("moveButton");

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

  currentTargetUrl = row.dataset.targetUrl;
  currentTargetType = targetType;

  modalReportNo.value = reportId;
  modalReportType.value = reportType;
  modalReportDate.value = reportDate;
  modalReason.value = reportReason;
  modalTargetName.textContent = targetName;

  moveButton.textContent =
    targetType === "BOARD" ? "해당 게시글 이동" : "신고된 메시지 보기";

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
  } else {
    // 메시지는 이동 안 하고 모달/별도 UI
    alert("신고된 메시지를 표시합니다.");
  }
});