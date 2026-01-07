document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // 타임리프에서 전달받은 데이터 확인 (없으면 빈 배열)
  const rawData = window.jobPostingData || [];

  // 1. 데이터 가공 (전처리)
  const events = rawData.map((job) => {
    // [날짜 처리] applyStart를 우선하되, 없으면 applyEnd 사용
    let dateRaw = job.applyStart || job.applyEnd;
    let finalDate = "";

    if (dateRaw && typeof dateRaw === "string") {
      // 마침표(.)를 하이픈(-)으로 통일하고 공백 제거
      finalDate = dateRaw.replace(/\./g, "-").trim();

      // "2026-01-07 채용시 마감" 처럼 뒤에 텍스트가 붙어있는 경우 날짜만 추출
      if (finalDate.includes(" ")) {
        finalDate = finalDate.split(" ")[0];
      }
    }

    // [유효성 검사] YYYY-MM-DD 형식이 아니면 오늘 날짜로 방어 처리
    const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(finalDate);
    if (!isDateValid) {
      finalDate = new Date().toISOString().slice(0, 10);
    }

    // [색상 기준 결정]
    // 마감일에 '채용시'가 포함되면 분홍색(상시), 날짜가 명시되어 있으면 보라색(기간제)
    const isAlwaysHiring = job.applyEnd && job.applyEnd.includes("채용시");
    const eventClass = isAlwaysHiring ? "event-pink" : "event-purple";

    return {
      title: job.postingTitle,
      start: finalDate,
      className: eventClass,
      extendedProps: {
        jobId: job.postingNo,
        applyStart: job.applyStart,
        applyEnd: job.applyEnd,
      },
    };
  });

  // 2. FullCalendar 초기화
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ko",
    headerToolbar: {
      left: "title",
      center: "",
      right: "prev,next today",
    },
    dayMaxEvents: 3, // 한 칸에 이벤트 3개까지만 표시 (나머지는 +더보기)
    contentHeight: 750,
    events: events, // 가공된 데이터 삽입

    // 공고 클릭 시 상세 페이지 이동
    eventClick: function (info) {
      const jobId = info.event.extendedProps.jobId;
      if (jobId) {
        window.location.href = `/jobposting/${jobId}`;
      } else {
        alert("해당 공고의 상세 정보를 찾을 수 없습니다.");
      }
    },

    // 날짜 칸의 번호(숫자) 클릭 시 해당 날짜의 공고를 팝업으로 보여주고 싶을 때 사용
    navLinks: true,
    navLinkDayClick: function (date, jsEvent) {
      // 기본 팝업 기능이 필요 없다면 생략 가능합니다.
    },
  });

  calendar.render();
});
