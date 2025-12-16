
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


/*채팅방 추가 버튼 클릭 시 */

const chatAddBtn = document.getElementById('chat-add-btn');
const createRoom = document.querySelector('.create-room');

chatAddBtn.addEventListener('click', () => {
    createRoom.classList.toggle('hide');
    userList.innerHTML = '';

    for (let check of radioCheck) {
            check.checked = false;
        }
    
    
});


/* 유저 선택 시 */
const radioCheck = document.getElementsByName('invite')
const userList = document.getElementsByClassName('select-user-list')[0]

/* 개인 그룹 선택 */
const private = document.querySelector('.private');
const group = document.querySelector('.group');
const roomNameARea = document.querySelector('.roomNameArea')


let chatType = 'private'


private.addEventListener('click', e=>{
    if(group.classList.contains('type-select')){
        group.classList.remove('type-select')
    }

    private.classList.add('type-select')
    roomNameARea.classList.add('display-none')

    chatType = 'private'
    userList.innerHTML = '';

    for (let check of radioCheck) {
            check.checked = false;
        }
})


group.addEventListener('click', e=>{
    if(private.classList.contains('type-select')){
        private.classList.remove('type-select')
    }

    group.classList.add('type-select');
    
    roomNameARea.classList.remove('display-none');

    chatType = 'group';

    


})


for (let item of radioCheck) {
    
    
    item.addEventListener("change", e => {

        

        const followItem =  e.target.closest('.follow-item');
        const userName = followItem.querySelector('.name').innerText;

        if(chatType == 'private') {
            for (let check of radioCheck) {
            check.checked = false;
            }

            item.checked = true
            userList.innerHTML = '';

            addUser(userName, item);
        }


        if(chatType == 'group') {
            
            if(item.checked) {

                if(!exist(userName)) {
                    addUser(userName, item);
                }
            } else {

                deleteUser(userName);
            }


        }
        
        
        
        
        
        
        


        


        deleteBtn.addEventListener('click', e => {
            item.checked = false;
            userList.innerHTML = "";
        })
    })

}    


/* 유저 추가 함수 */
function addUser(userName, checkbox) {

    const div = document.createElement('div');
    div.classList.add('user-item');

    const span = document.createElement('span');
    span.innerHTML = userName;

    const deleteBtn = document.createElement('span');
    deleteBtn.classList.add('list-delete-btn');
    deleteBtn.innerText = ' x';

    deleteBtn.addEventListener('click', () => {
    checkbox.checked = false;
    div.remove();
    });

    div.append(span, deleteBtn);
    userList.appendChild(div);
}



/* 유저 존재 하는지 */
function exist(userName) {
    const items = userList.getElementsByClassName('user-item');

    for (let item of items) {
        if (item.innerText.includes(userName)) {
            return true;
        }
    }
    return false;
}


/* 삭제 */
function deleteUser(userName) {
    const items = userList.getElementsByClassName('user-item');

    for (let item of items) {
        if(item.innerText.includes(userName)) {
            item.remove();
            return;
        }
    }
}


document.getElementById('room-cancle-btn')?.addEventListener('click', e => {
    
    document.querySelector('.create-room').classList.add('hide')
})