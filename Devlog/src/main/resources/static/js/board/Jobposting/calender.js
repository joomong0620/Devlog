document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const rawData = window.jobPostingData || [];

  const events = rawData.map((job) => {
    // 시작일(applyStart)을 우선적으로 사용
    let dateStr =
      job.applyStart && job.applyStart.includes(".")
        ? job.applyStart
        : job.applyEnd;

    // 만약 시작일도 없고 마감일도 이상하면 오늘 날짜
    if (!dateStr || !dateStr.includes(".")) {
      dateStr = new Date().toISOString().slice(0, 10);
    }

    // 점(.)을 하이픈(-)으로 변경
    const finalDate = dateStr.replace(/\./g, "-");

    return {
      title: job.postingTitle,
      start: finalDate,

      extendedProps: {
        jobId: job.postingNo,
      },

      // 마감일이 있으면 보라색, 없으면 핑크색
      className:
        job.applyEnd && job.applyEnd.includes("채용시")
          ? "event-pink"
          : "event-purple",
    };
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ko",
    // initialDate: '2025-12-01',
    headerToolbar: {
      left: "title",
      center: "",
      right: "prev,next today",
    },
    dayMaxEvents: 3,
    contentHeight: 750,
    events: events,

    eventClick: function (info) {
      const jobId = info.event.extendedProps.jobId;

      if (!jobId) {
        alert("jobId 없음");
        return;
      }

      window.location.href = `/jobposting/${jobId}`;
    },
  });

  calendar.render();

  function showEventPopup(dateStr, events) {
    const old = document.querySelector(".custom-popup");
    if (old) old.remove();
    const popup = document.createElement("div");
    popup.className = "custom-popup";
    popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <strong>${dateStr} 공고</strong>
                    <span class="close-btn" style="cursor:pointer;">&times;</span>
                </div>
                <div class="popup-body">
                    ${events
                      .map(
                        (ev) => `
                        <div class="popup-item ${
                          ev.classNames[0] || "event-purple"
                        }" style="margin-bottom:5px; padding:5px; border-radius:4px; color:white;">
                            ${ev.title}
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>`;
    document.body.appendChild(popup);
    popup.querySelector(".close-btn").onclick = () => popup.remove();
  }
});
