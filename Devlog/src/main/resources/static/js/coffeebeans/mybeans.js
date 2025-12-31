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
  chargeBtn?.addEventListener(
    "click",
    () => (chargeModal.style.display = "flex")
  );
  exchangeBtn?.addEventListener(
    "click",
    () => (exchangeModal.style.display = "flex")
  );

  // 내역 금액 클릭 시 취소 모달 열기
  historyRows.forEach((row) => {
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
  [completeConfirmBtn, successConfirmBtn, failBackBtn].forEach((btn) => {
    btn?.addEventListener("click", () => {
      [completeModal, cancelSuccessModal, cancelFailModal].forEach(
        (m) => (m.style.display = "none")
      );
    });
  });

  window.addEventListener("click", (e) => {
    const allModals = [
      chargeModal,
      exchangeModal,
      completeModal,
      cancelModal,
      cancelSuccessModal,
      cancelFailModal,
    ];
    allModals.forEach((m) => {
      if (e.target === m) m.style.display = "none";
    });
  });

  // 내역 필터링
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      historyRows.forEach((row) => {
        row.style.display =
          type === "all" || row.dataset.type === type ? "" : "none";
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const amountInput = document.getElementById("charge-amount-input");
  const amountButtons = document.querySelectorAll(".amount-options button");
  const finalChargeSubmit = document.getElementById("final-charge-submit");

  //  금액 옵션 버튼 클릭 시 input 값 변경
  amountButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      amountButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");

      // 금액 쉼표 제거 후 input에 대입
      const val = btn.textContent.replace(/,/g, "");
      amountInput.value = val;
    });
  });

  // 포트원 결제 실행
  finalChargeSubmit?.addEventListener("click", async () => {
    const amount = parseInt(amountInput.value.replace(/[^0-9]/g, ""));


    if (isNaN(amount) || amount < 100) {
      alert("최소 충전 금액은 100원입니다.");
      return;
    }

    try {
      const response = await PortOne.requestPayment({
        storeId: portoneConfig.storeId,
        channelKey: portoneConfig.channelKey,
        paymentId: `payment-${crypto.randomUUID()}`,
        orderName: "커피콩 충전",
        totalAmount: amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
      });

      // 결제 실패 시
      if (response.code !== undefined) {
        alert(`결제 실패: ${response.message}`);
        return;
      }

      // 저장 요청
      const serverResponse = await fetch("/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: response.paymentId,
          price: amount,
          payMethod: "CARD",
          usedAmount: 0
        }),
      });

      if (serverResponse.ok) {
        alert("충전이 완료되었습니다!");
        location.reload();
      } else {
        alert("DB 저장 중 오류가 발생했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("결제 요청 중 알 수 없는 오류가 발생했습니다.");
    }
  });
});
