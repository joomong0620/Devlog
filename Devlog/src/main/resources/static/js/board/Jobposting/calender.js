document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'ko',
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },
    titleFormat: { year: 'numeric', month: 'long' },

    dayMaxEvents: 2, // 하루에 최대 2개만 표시, 나머지는 +n개
    contentHeight: 700, // 전체 달력 높이를 고정

    events: [
      { title: '(주)크래딧 소프트웨어..', start: '2025-12-03', className: 'event-purple' },
      { title: '지에스네오텍(주) IT(A..', start: '2025-12-03', className: 'event-pink' },
      { title: '(주)크래딧 소프트웨어..', start: '2025-12-03', className: 'event-purple' },
      { title: '(주)크래딧 소프트웨어..', start: '2025-12-09', className: 'event-purple' },
      { title: '지에스네오텍(주) IT(A..', start: '2025-12-12', className: 'event-pink' }
    ],

  });

  calendar.render();

  // 팝업 생성 함수
  function showEventPopup(dateStr, events) {
    const oldPopup = document.querySelector('.custom-popup');
    if (oldPopup) oldPopup.remove();

    // 팝업 요소 생성
    const popup = document.createElement('div');
    popup.className = 'custom-popup';
    
    let eventListHtml = events.map(ev => `
      <div class="popup-item ${ev.classNames[0]}">
        ${ev.title}
      </div>
    `).join('');

    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <strong>${dateStr}</strong>
          <span class="close-btn">&times;</span>
        </div>
        <div class="popup-body">
          ${eventListHtml}
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector('.close-btn').onclick = () => popup.remove();
    window.onclick = (e) => { if (e.target == popup) popup.remove(); };
  }
});