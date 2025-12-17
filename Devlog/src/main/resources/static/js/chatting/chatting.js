
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
})

window.addEventListener('load', () => {
    scrollToBottom();
});



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


/* 개인 버튼 클릭 시 */
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


/* 그룹 버튼 클릭 시 */
group.addEventListener('click', e=>{
    if(private.classList.contains('type-select')){
        private.classList.remove('type-select')
    }

    group.classList.add('type-select');
    
    roomNameARea.classList.remove('display-none');

    chatType = 'group';

    userList.innerHTML = '';

    for (let check of radioCheck) {
            check.checked = false;
        }
    


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






/* 메세지 수정 공감 삭제 드롭다운 */
const messageOption = document.querySelectorAll('.message-option');
const messageBox = document.querySelectorAll('.bubble')

let openBox = null;

for (let box  of messageBox) {

    box.addEventListener('contextmenu', e => {

        
        e.preventDefault();   
        e.stopPropagation(); 

        const option = box.nextElementSibling;
        const emojiArea = option.nextElementSibling;

        /* 같은 요소 우클릭 시 제거 후 함수 종료 */
        if (openBox === option) {
            option.classList.add('display-none');
            openBox = null;
            return;
        }

        /* 다른 요소 클릭 시 기존에 열려있는 옵션창 제거 */
        if (openBox) {
        openBox.classList.add('display-none');
        }


        option.classList.toggle('display-none')

        openBox = option
        
        /* 이모지 공감 버튼 클릭 시 */
        const reactionBtn = option.querySelector('.msg-reaction-btn');
        reactionBtn.onclick = e => {

            e.stopPropagation();

            option.classList.add('display-none');
            openBox = null;

            emojiArea.classList.remove('display-none');

            

            emojiAreaClose(emojiArea)

            emojiClickClose(emojiArea)
        };

        

    })
    
}


/* 이모지 영역 바깥을 클릭 했을 떄 닫히게 하는 함수 */
function emojiAreaClose(emojiArea) {

    if (emojiArea._outsideHandler) {
        document.removeEventListener('click', emojiArea._outsideHandler);
    }

    /* 문서 전체 클릭 감지해서 이모지 영역 밖을 클릭하면 이모지 영역 닫음 */
    function outsideClick(e) {

        /* 이모지 영역 본인 클릭 시 함수 종료 */
        if (emojiArea.contains(e.target)) return;

        emojiArea.classList.add('display-none');
        document.removeEventListener('click', outsideClick);
    }

    setTimeout(() => {
        document.addEventListener('click', outsideClick);
    });
}

/* 이모지 클릭 시 닫히게 하는 함수 */
function emojiClickClose(emojiArea) {

    const emojis = emojiArea.querySelectorAll('span');

    for (let emoji of emojis) {
        emoji.onclick = e => {

            e.stopPropagation();


            emojiArea.classList.add('display-none');
        };
    }
}

