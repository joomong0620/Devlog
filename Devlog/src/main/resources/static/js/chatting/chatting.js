



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

const roomNameArea = document.querySelector('.roomNameArea');
const roomImageArea = document.querySelector('.roomImageArea');

const imageInput = document.getElementById('roomImageInput');
const imagePreview = document.getElementById('roomImagePreview');


let chatType = 'private'


/* 개인 버튼 클릭 시 */
private.addEventListener('click', e=>{
    if(group.classList.contains('type-select')){
        group.classList.remove('type-select')
    }

    roomNameArea.classList.add('display-none');
    roomImageArea.classList.add('display-none');

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

    roomNameArea.classList.remove('display-none');
    roomImageArea.classList.remove('display-none');
    
    roomNameARea.classList.remove('display-none');

    chatType = 'group';

    userList.innerHTML = '';

    for (let check of radioCheck) {
            check.checked = false;
        }
    


})

// 이미지 미리보기
imageInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    // 확실하지 않음: 파일 용량 제한은 서버 정책에 따라 다름
    const reader = new FileReader();
    reader.onload = () => {
        imagePreview.src = reader.result;
    };
    reader.readAsDataURL(file);
});


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


/* ---------------------------------------- */
/* 검색, 메뉴 슬라이드 효과 */
const searchPanel = document.querySelector('.chat-search-panel');
const searchBtn = document.getElementById('text-search-btn');
const chatMenuBtn = document.getElementById('chat-menu-btn')
const menuPanel = document.querySelector('.chat-menu-panel');

searchBtn.addEventListener('click', e => {
    e.stopPropagation();

    menuPanel?.classList.remove('is-open');
    searchPanel.classList.toggle('is-open')
})



chatMenuBtn.addEventListener('click', e => {
    e.stopPropagation()
    searchPanel?.classList.remove('is-open');
    
    menuPanel.classList.toggle('is-open');
})


/* ----------------------------------- */
/* 채팅방 나가기 버튼 클릭 시 */
const exitBtn = document.getElementById('exit-btn');
const exitArea = document.querySelector('.exit-check')
const chatOverlay = document.getElementById('chat-overlay')

exitBtn?.addEventListener('click', e => {
    exitArea.classList.remove('display-none');
    chatOverlay.classList.add('active')
}) 

document.getElementById('no').addEventListener('click', e => {
    exitArea.classList.add('display-none')
    chatOverlay.classList.remove('active')
})



/* 채팅방 나가기 버튼 클릭 ㅅ ㅣ로직 추가 */
document.getElementById('yes').addEventListener('click', e => {
    exitArea.classList.add('display-none')
    chatOverlay.classList.remove('active')



    /* 비동기 로직 추가 */
})


/* ------------------------------------------- */
/* 수정하기 버튼 클릭 시 입력 폼 변화 */

const sendArea = document.querySelector('.send-area');
const editArea = document.querySelector('.edit-area');

const editCancelBtn = document.getElementById('edit-cancle-btn');

const msgEditBtn = document.querySelectorAll('.msg-edit-btn')

for (let editBtn of msgEditBtn) {

    editBtn.addEventListener('click', e => {

        const messageContainer = editBtn.closest('.message-content');

        const bubble = messageContainer.querySelector('.bubble');
        
        const originText = bubble.innerText;

        console.log("원본 메세지 : ", originText)

        openEditMode(originText);
        
        

        const opt = editBtn.closest('.msg-option')

        opt.classList.add('display-none')


    })
    
}


/* 편입 입력으로 전환 */
function openEditMode(originText) {
    // 기존 입력창 숨김
    sendArea.classList.add('display-none');

    // 수정창 표시
    editArea.classList.remove('display-none');

    // 기존 메시지 내용 세팅
    document.getElementById('edit-message').value = originText
    document.getElementById('edit-message').focus();
}

editCancelBtn.addEventListener('click', () => {
    closeEditMode();
});

/* 다시 본 입력창 전환 */
function closeEditMode() {
    // 수정창 숨김
    editArea.classList.add('display-none');

    // 기존 입력창 표시
    sendArea.classList.remove('display-none');

    // 수정 textArea 초기화
    document.getElementById('edit-message').value = '';
}


/* 수정보튼 클릭 or 엔터 입력 시 서버에 전송 ?  */
/* editBtn?.addEventListener('click', () => {
    const editedText = document.getElementById('edit-message').value;

    if (!editedText.trim()) return;

    

    closeEditMode();
}); */



/* 유저 초대 */
/* 초대 버튼 클릭 시 비동기로 회원 목록 조회후 fragment 써서 렌더링 예정 */
/*  */

const inviteBtn = document.getElementById('invite-btn');
const inviteList = document.getElementsByName('roomInvite')
const selectedArea = document.querySelector('.select-user-area');


inviteBtn?.addEventListener('click', e=> {
    for (let item of inviteList) {
        item.checked = false
        
    }
    selectedArea.innerHTML = ""
    chatOverlay.classList.add('active')
    document.getElementsByClassName('user-invite-box')[0].classList.remove('display-none')

})



/* 유저 리스트 체크박스 하나씩 */
for (let checkbox of inviteList) {
    checkbox.addEventListener('change', e => {

        const listBox = e.target.closest('.user-list');

        const nameEl =
            listBox.querySelector('.user-name') ||
            listBox.querySelector('span');

        const userName = nameEl.innerText;

        if (e.target.checked) {
            if (!inviteExist(userName)) {
                inviteAddUser(userName, e.target);
            }
        } else {
            inviteDeleteUser(userName);
        }
    });
}

/* 선택 되면 태그 형식으로 추가 */
function inviteAddUser(userName, checkbox) {
    const div = document.createElement('div');
    div.classList.add('user-item');

    const span = document.createElement('span');
    span.innerText = userName;

    const deleteBtn = document.createElement('span');
    deleteBtn.classList.add('list-delete-btn');
    deleteBtn.innerText = ' x';

    deleteBtn.addEventListener('click', () => {
        checkbox.checked = false;
        div.remove();
    });

    div.append(span, deleteBtn);
    selectedArea.appendChild(div);
}

/* 존재하면 false 반환 */
function inviteExist(userName) {
    const items = selectedArea.getElementsByClassName('user-item');
    for (let item of items) {
        if (item.innerText.includes(userName)) {
            return true;
        }
    }
    return false;
}

/* 유저 삭제 */
function inviteDeleteUser(userName) {
    const items = selectedArea.getElementsByClassName('user-item');
    for (let item of items) {
        if (item.innerText.includes(userName)) {
            item.remove();
            return;
        }
    }
}


/* 취소 클릭 시 초대창 닫기 */
document.getElementById('invite-cancel').addEventListener('click', e => {
    document.getElementsByClassName('user-invite-box')[0].classList.add('display-none')  
    chatOverlay.classList.remove('active')
})

/* 초대 버튼 클릭 시  */
document.getElementById('invite-user').addEventListener('click', e => {
    document.getElementsByClassName('user-invite-box')[0].classList.add('display-none');
    chatOverlay.classList.remove('active');

    /* 비동기 요청 ------------------------------------ */

    alert("초대 되었습니다 ! ");
})




/* 방 이름 수정 버튼 클릭 시 */
const editBtn = document.getElementById('team-name-change');
const teamNameSpan = document.querySelector('.team-name');
const panelTitle = document.querySelector('.member-panel-title');

editBtn.addEventListener('click', () => {
    // 이미 input 상태면 중복 생성 방지
    if (panelTitle.querySelector('input')) return;

    const currentName = teamNameSpan.innerText;

    // span 숨김
    teamNameSpan.classList.add('display-none');

    // input 생성
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('team-name-input');
    input.value = currentName;

    /* 
        insertBefore 지정한 요소 앞에 삽입 
        editBtn 요소 앞에 input 삽입
    */
    panelTitle.insertBefore(input, editBtn);
    input.focus();

    // 완료 처리 함수
    const finishEdit = () => {
        const newName = input.value.trim();
        if (newName) {
            teamNameSpan.innerText = newName;
        }
        
        /* 팀 이름 변경 비동기 요청 추가 */


        input.remove();
        teamNameSpan.classList.remove('display-none');

    };

    // Enter로 완료
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            finishEdit();
        }
    });

    // 포커스 잃으면 완료
    input.addEventListener('blur', finishEdit);
});


/* 고정 핀 클릭 시 */
const pinnedBtn = document.getElementById('pinned-btn');
const unpinnedBtn = document.getElementById('unpinned-btn');


/* 각각 db 상태값 변경 후 채팅방 목록 재정렬 해야함*/
pinnedBtn.addEventListener('click', e => {
    pinChange()
})

unpinnedBtn.addEventListener('click', e => {
    pinChange()
})

function pinChange() {
    pinnedBtn.classList.toggle('display-none')
    unpinnedBtn.classList.toggle('display-none')
}




/* ------------------------------------------ */
/* 메세지 삭제 버튼 클릭 시 */

const msgDeleteBtn = document.querySelectorAll('.msg-delete-btn');
const delCheck = document.querySelector('.del-check')

for (let delBtn of msgDeleteBtn) {

    delBtn.addEventListener('click', e => {

        const opt = delBtn.closest('.msg-option');

        opt.classList.add('display-none');

        delCheck.classList.remove('display-none');

        chatOverlay.classList.toggle('active')
    })
    
}


const msgDelYes = document.getElementById("msg-del-yes");
const msgDelNo = document.getElementById("msg-del-no");

msgDelYes.addEventListener('click', e => {
    delCheck.classList.add('display-none');
    chatOverlay.classList.toggle('active');

    /* 비동기로 화면 삭제 로직 처리 */


})

msgDelNo.addEventListener('click', e => {
    delCheck.classList.add('display-none');
    chatOverlay.classList.toggle('active');

})




const profileImgs = document.querySelectorAll('.profile-img');

profileImgs.forEach(img => {
    img.addEventListener('click', e => {
        e.stopPropagation();

        const messageItem = img.closest('.message-item');
        const profileCard = messageItem.querySelector('.profile-card');

        // 다른 카드 전부 닫기
        document.querySelectorAll('.profile-card').forEach(card => {
            if (card !== profileCard) {
                card.classList.add('display-none');
            }
        });

        profileCard.classList.toggle('display-none');
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.profile-card')
        .forEach(card => card.classList.add('display-none'));
});

document.querySelectorAll('.profile-card').forEach(card => {
    card.addEventListener('click', e => e.stopPropagation());
});






const viewer = document.getElementById('imageViewer');
const viewerImg = document.getElementById('imageViewerImg');

document.querySelectorAll('.bubble.image img').forEach(img => {
    img.addEventListener('click', e => {
        e.stopPropagation();

        viewerImg.src = img.src;
        viewer.classList.remove('display-none');
    });
});


viewer.addEventListener('click', () => {
    viewer.classList.add('display-none');
    viewerImg.src = '';
});


document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        viewer.classList.add('display-none');
        viewerImg.src = '';
    }
});