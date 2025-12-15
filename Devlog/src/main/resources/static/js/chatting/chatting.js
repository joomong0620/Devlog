/* 선택 효과 주기 */
const listItem = document.getElementsByClassName('room-item')

for (let item of listItem) {

    item.addEventListener('click', e => {

        for (let el of listItem) {
            el.classList.remove('is-selected')
            
        }
        
        item.classList.add('is-selected')
    })
    
}

document.addEventListener('DOMContentLoaded', e => {
    scrollToBottom()
})



/* 메세지 하단 고정 함수 */
const messageArea = document.getElementsByClassName('message-list')[0]

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}




