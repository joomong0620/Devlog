console.log("ITnews.js loaded");

// HTML 요소 선택
const filterButtons = document.querySelectorAll(".filter-btn");
const newsItems = document.querySelectorAll(".news-item"); // historyRows 대신 news-item

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        location.href = "/ITnews?boardCode=" + type;
    });
});


// 버튼 활성화 표시
filterButtons.forEach(b => b.classList.remove("active"));
btn.classList.add("active");

// 필터링 로직
newsItems.forEach(item => {
    // "all" 버튼이 있거나, 데이터 타입이 일치하면 보여줌
    if (type === "all" || item.dataset.type === type) {
        item.style.display = "";
    } else {
        item.style.display = "none";
    }
});