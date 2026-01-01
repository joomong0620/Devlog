let selectedPaymentData = { id: null, no: null };

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
  // const amountInput = document.getElementById("charge-amount-input");
  const finalChargeSubmit = document.getElementById("final-charge-submit");

  // 모달 열기 제어
  chargeBtn?.addEventListener(
    "click",
    () => (chargeModal.style.display = "flex")
  );
  exchangeBtn?.addEventListener(
    "click",
    () => (exchangeModal.style.display = "flex")
  );

  // historyRows를 돌면서 클릭 이벤트 설정
  historyRows.forEach((row) => {
    const amountCell = row.querySelector(".plus"); // 충전(+) 내역만 클릭 가능하게

    amountCell?.addEventListener("click", () => {
      // 1. 행에 심어진 데이터 가져오기
      const pId = row.getAttribute("data-id");
      const pNo = row.getAttribute("data-no");
      const pPrice = row.getAttribute("data-price");
      const used = parseInt(row.getAttribute("data-used") || 0);

      // 2. 이미 사용했다면 실패 모달
      if (used > 0) {
        document.getElementById("cancel-fail-modal").style.display = "flex";
        return;
      }

      // 3. 전역 바구니에 저장 (취소 버튼 클릭 시 사용)
      selectedPaymentData.id = pId;
      selectedPaymentData.no = pNo;

      // 4. 취소 모달 내부 텍스트 변경
      const beansVal = document.querySelector("#cancel-modal .val");
      const priceVal = document.querySelector("#cancel-modal .val.minus");
      if (beansVal) beansVal.innerText = Number(pPrice).toLocaleString() + "콩";
      if (priceVal)
        priceVal.innerText = "-" + Number(pPrice).toLocaleString() + "원";

      cancelModal.style.display = "flex";
    });
  });

  // 환전 및 취소 완료 처리
  submitExchangeBtn?.addEventListener("click", () => {
    exchangeModal.style.display = "none";
    completeModal.style.display = "flex";
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
        paymentId: `pay-${crypto.randomUUID().split("-")[0]}`,
        orderName: "커피콩 충전",
        totalAmount: amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
      });
      console.log(response);
      // 결제 실패 시
      if (response.code !== undefined) {
        alert(`결제 실패: ${response.message}`);
        return;
      }

      // 저장
      const serverResponse = await fetch("/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: response.paymentId, // 예시 : 'pay-c6329ad7'
          price: amount,
          payMethod: "CARD", // 일단 상수로 테스트
          usedAmount: 0,
          payStatus: "1", //1:충전
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

  // 결제 취소 실행 버튼
  submitCancelBtn?.addEventListener("click", async () => {
    // 필요한 파라미터 준비 (취소 모달을 열 때 미리 저장해둔 값)
    const paymentId = selectedPaymentData.id; // 예: pay-a08199f6
    const beansPayNo = selectedPaymentData.no; // DB PK

    if (!paymentId || !beansPayNo) {
      alert("취소할 결제 정보를 찾을 수 없습니다.");
      return;
    }

    submitCancelBtn.disabled = true;
    submitCancelBtn.innerText = "취소 요청 중...";

    try {
      const response = await fetch("/payment/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: paymentId, // 포트원 결제 번호
          beansPayNo: beansPayNo, //  DB 결제 번호
          reason: "고객 요청에 의한 환불", // 사유
        }),
      });

      if (response.ok) {
        // 성공 시: 성공 모달 띄우기
        cancelModal.style.display = "none";
        document.getElementById("cancel-success-modal").style.display = "flex";

        // '확인' 누르면 새로고침해서 잔액 갱신
        document.getElementById("cancel-success-confirm").onclick = () => {
          location.reload();
        };
      } else {
        // 실패 시: 서버에서 보낸 에러 메시지 출력
        const errorText = await response.text();
        alert("취소 실패: " + errorText);
        cancelModal.style.display = "none";
      }
    } catch (error) {
      console.error("통신 에러:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      submitCancelBtn.disabled = false;
      submitCancelBtn.innerText = "결제 취소하기";
    }
  });
});
