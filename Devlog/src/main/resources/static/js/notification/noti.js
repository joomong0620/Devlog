
const notiBtn = document.getElementById('noti-btn')
const alarmArea = document.querySelector('.alarm-panel')
const notiMenuBtn = document.querySelector('.noti-menu-btn')
const notiMenuArea = document.querySelector('.noti-menu-dropdown')


/* 알림창 */
notiBtn.addEventListener('click', e => {
    alarmArea.classList.toggle('display-none')
})


/* 전체 읽음 삭제 메뉴 드롭다운 */
notiMenuBtn.addEventListener('click', e=>{
    notiMenuArea.classList.toggle('display-none')
})



/* 알림 필터 선택 */

const alarmFilters = document.querySelectorAll('.filter');


for (let filter of alarmFilters) {

    filter.addEventListener('click', e => {

        for(let item of alarmFilters) {
            item.classList.remove('is-active');
        }

        filter.classList.add('is-active')

    })
    
}


/* 해당 알림 클릭 시 읽은 느낌  */
const alarmItems = document.querySelectorAll('.alarm-item')



for (let alarmItem of alarmItems) {
    alarmItem.addEventListener('click', e => {

        alarmItem.classList.add('read-noti')
    })
    
}

