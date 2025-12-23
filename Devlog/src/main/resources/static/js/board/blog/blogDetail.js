// 상태 변수
let userCoffeeBeans = 12450;
const contentPrice = 3000;
let isFollowing = false; // 팔로우 상태

// === 6. 작성자 권한 관련 변수 (서버에서 받아온 값이라 가정) ===
let isAuthor = true;      // 현재 로그인한 사람이 작성자인가?
let isPaidContent = true; // 유료 글인가?
let viewCount = 999;      // 조회수 (1 이상이면 삭제 불가)

// DOM 요소 참조
const modalOverlay = document.getElementById('modalOverlay');
const modalPurchase = document.getElementById('modalPurchase');
const modalNoBalance = document.getElementById('modalNoBalance');
const modalSuccess = document.getElementById('modalSuccess');
const modalReport = document.getElementById('modalReport'); // 신고 모달
const articleContent = document.getElementById('articleContent');
const userBalanceDisplay = document.getElementById('userBalance');

const authorActionArea = document.getElementById('authorActionArea');
const btnEdit = document.getElementById('btnEdit');
const btnDelete = document.getElementById('btnDelete');

// 초기화
function init() {
    updateBalanceDisplay();
    checkAuthorPermissions(); // 6번 요구사항 체크
}

function updateBalanceDisplay() {
    userBalanceDisplay.innerText = userCoffeeBeans.toLocaleString() + '콩';
}

// === 모달 공통 함수 ===
function closeAllModals() {
    modalOverlay.classList.add('hidden');
    modalPurchase.classList.add('hidden');
    modalNoBalance.classList.add('hidden');
    modalSuccess.classList.add('hidden');
    modalReport.classList.add('hidden');
}

// === 구매 로직 (기존과 동일) ===
function openPurchaseModal() {
    modalOverlay.classList.remove('hidden');
    modalPurchase.classList.remove('hidden');
}

function processPayment() {
    modalPurchase.classList.add('hidden');
    if (userCoffeeBeans >= contentPrice) {
        modalSuccess.classList.remove('hidden');
    } else {
        modalNoBalance.classList.remove('hidden');
    }
}

function completePurchase() {
    closeAllModals();
    userCoffeeBeans -= contentPrice;
    updateBalanceDisplay();
    articleContent.classList.remove('locked');
}

// === 2. 팔로우 버튼 토글 ===
function toggleFollow(btn) {
    isFollowing = !isFollowing;
    if (isFollowing) {
        btn.innerText = "✓ 팔로잉";
        btn.classList.add("following");
    } else {
        btn.innerText = "+ 팔로우";
        btn.classList.remove("following");
    }
}

// === 5. 신고 모달 로직 ===
function openReportModal() {
    modalOverlay.classList.remove('hidden');
    modalReport.classList.remove('hidden');
}

function submitReport() {
    const reason = document.querySelector('input[name="reportReason"]:checked').value;
    const detail = document.querySelector('.report-text').value;

    // 여기서 서버로 전송 로직 수행
    console.log(`신고 접수: ${reason}, 내용: ${detail}`);

    alert("신고가 정상적으로 접수되었습니다.");
    closeAllModals();
}

// === 6. 수정/삭제 버튼 권한 제어 (핵심 로직) ===
function checkAuthorPermissions() {
    // 1. 작성자가 아니면 버튼 영역 자체를 숨김
    if (!isAuthor) {
        authorActionArea.classList.add('hidden');
        return;
    }

    // 작성자라면 영역 표시
    authorActionArea.classList.remove('hidden');

    // 조건 A: 유료글은 업로드 후 수정 불가
    if (isPaidContent) {
        btnEdit.disabled = true;
        btnEdit.title = "유료 게시글은 수정할 수 없습니다.";
    } else {
        btnEdit.disabled = false;
        btnEdit.title = "";
    }

    // 조건 B: 조회수가 1명이라도 있으면 삭제 불가
    if (viewCount > 0) {
        btnDelete.disabled = true;
        btnDelete.title = "조회수가 발생한 게시글은 삭제할 수 없습니다.";
    } else {
        btnDelete.disabled = false;
        btnDelete.onclick = function () {
            if (confirm("정말 삭제하시겠습니까?")) {
                alert("삭제되었습니다.");
            }
        };
    }
}


// === 테스트용 함수 (우측 상단 컨트롤 패널 연결) ===
function setBalance(amount) {
    userCoffeeBeans = amount;
    updateBalanceDisplay();
}

function toggleAuthorMode() {
    const isAuthorCheck = document.getElementById('checkAuthor').checked;
    const isPaidCheck = document.getElementById('checkPaid').checked;

    isAuthor = isAuthorCheck;
    isPaidContent = isPaidCheck;

    // 조회수 테스트를 위해 임의로 설정 (필요시 변경)
    viewCount = 999;

    checkAuthorPermissions();
}

// 실행
init();