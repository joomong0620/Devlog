document.addEventListener("DOMContentLoaded", () => {
    // 요소 선택
    const chargeBtn = document.getElementById("charge-btn");
    const exchangeBtn = document.getElementById("exchange-btn");
    const chargeModal = document.getElementById("charge-modal");
    const exchangeModal = document.getElementById("exchange-modal");
    const completeModal = document.getElementById("exchange-complete-modal");
    const submitExchangeBtn = document.querySelector(".exchange-submit-btn");
    const completeConfirmBtn = document.getElementById("complete-confirm-btn");

    const cancelModal = document.getElementById("cancel-modal");
    const cancelSuccessModal = document.getElementById("cancel-success-modal");
    const cancelFailModal = document.getElementById("cancel-fail-modal");
    const submitCancelBtn = document.querySelector(".cancel-submit-btn");
    const successConfirmBtn = document.getElementById("cancel-success-confirm");
    const failBackBtn = document.getElementById("cancel-fail-back");

    const amountButtons = document.querySelectorAll(".amount-options button");
    const amountInput = document.querySelector(".input-wrapper input");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const historyRows = document.querySelectorAll("#history-tbody tr");

    // 모달 열기 제어
    chargeBtn?.addEventListener("click", () => chargeModal.style.display = "flex");
    exchangeBtn?.addEventListener("click", () => exchangeModal.style.display = "flex");

    // 내역 금액 클릭 시 취소 모달 열기
    historyRows.forEach(row => {
        const amountCell = row.querySelector(".plus"); 
        amountCell?.addEventListener("click", () => {
            cancelModal.style.display = "flex";
        });
    });

    // 환전 및 취소 완료 처리
    submitExchangeBtn?.addEventListener("click", () => {
        exchangeModal.style.display = "none";
        completeModal.style.display = "flex";
    });

    submitCancelBtn?.addEventListener("click", () => {
        cancelModal.style.display = "none";
        cancelSuccessModal.style.display = "flex";
    });

    // 모달 닫기 제어
    [completeConfirmBtn, successConfirmBtn, failBackBtn].forEach(btn => {
        btn?.addEventListener("click", () => {
            [completeModal, cancelSuccessModal, cancelFailModal].forEach(m => m.style.display = "none");
        });
    });

    window.addEventListener("click", (e) => {
        const allModals = [chargeModal, exchangeModal, completeModal, cancelModal, cancelSuccessModal, cancelFailModal];
        allModals.forEach(m => {
            if (e.target === m) m.style.display = "none";
        });
    });

    // 충전 금액 선택
    amountButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            amountButtons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            if (amountInput) amountInput.value = btn.textContent.trim();
        });
    });

    // 내역 필터링
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            historyRows.forEach(row => {
                row.style.display = (type === "all" || row.dataset.type === type) ? "" : "none";
            });
        });
    });
});