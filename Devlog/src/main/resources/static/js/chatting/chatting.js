

let followList = false;

document.addEventListener('DOMContentLoaded', e => {

    selectChatList();

})

async function selectChatList(query = null){

    try {
        const resp = await fetch('/devtalk/chatList?query='+query);
        const html = await resp.text();

        document.getElementById('roomList').outerHTML = html;

    } catch(e) {
        console.log('채팅방 목록 조회 실패', e)
    } 

}


// roomList 컨테이너에 한 번만 이벤트 걸기
document.addEventListener('click', (e) => {
    const item = e.target.closest('.room-item');
    if (!item) return; // room-item이 아닌 곳 클릭이면 무시

    const roomNo = Number(item.dataset.roomNo);
    // 현재 room-list 안의 room-item만 대상으로 선택 해제
   /*  const container = document.getElementById('roomList');
    container.querySelectorAll('.room-item').forEach(el => el.classList.remove('is-selected'));

    item.classList.add('is-selected');
    showChatRoomUI();
    loadChatRoom(roomNo); */

    enterChatRoom(roomNo);
});


window.addEventListener('load', () => {
    
    connectSocket();
});



/* 메세지 하단 고정 함수 */
/* 채팅 영역 함수 */
function scrollToBottom() {
    const messageArea = document.getElementsByClassName('message-list')[0]
    if (!messageArea) return;
    messageArea.scrollTop = messageArea.scrollHeight
}

/* ============================================================================ */
/* 채팅방 추가 부분 */

/*채팅방 추가 버튼 클릭 시 */

const chatAddBtn = document.getElementById('chat-add-btn');
const createRoom = document.querySelector('.create-room');

chatAddBtn.addEventListener('click', () => {
    createRoom.classList.toggle('hide');
    userList.innerHTML = '';

    for (let check of radioCheck) {
            check.checked = false;
        }
    
    if(followList) return ;

    fetch('/devtalk/followSelect')
    .then(resp => resp.text())
    .then(html => {
        followList = true;

        document.getElementById('chatFollowList').outerHTML = html;

        followCheckbox()

    })
    .catch(e => console.log('팔로우 조회 실패', e))
    
});


/* 유저 선택 시 */

const userList = document.getElementsByClassName('select-user-list')[0]
const radioCheck = document.getElementsByName('invite')
/* 개인 그룹 선택 */
const private = document.querySelector('.private');
const group = document.querySelector('.group');
const roomNameARea = document.querySelector('.roomNameArea')

const roomNameArea = document.querySelector('.roomNameArea');
const roomImageArea = document.querySelector('.roomImageArea');

const imageInput = document.getElementById('roomImageInput');
const imagePreview = document.getElementById('roomImagePreview');


let chatType = 'private'

const followListContainer = document.getElementById('chatFollowList');

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




function followCheckbox() {
    
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


/* 생성버튼 클릭 시 */
document.getElementById('room-create-btn').addEventListener('click', async e => {

    if (chatType === 'private') {
        const result = await createPrivate();

        
        console.log(result); // 서버 응답 확인
        createRoom.classList.add('hide');

        await selectChatList();

        enterChatRoom(result);

        showChatRoomUI();

        await loadChatRoom(result)
        
    }

    if(chatType === 'group') {

        const result = await createGroup();

        console.log(result);

        createRoom.classList.add('hide');

        await selectChatList();

        enterChatRoom(result);

        showChatRoomUI();

        await loadChatRoom(result)
    }
    
});


/* 개인 채팅방 추가 함수 */
async function createPrivate(){
    
    try {

    
        const checked = document.querySelector('input[name="invite"]:checked');
        if (!checked) return alert('대화할 사용자를 선택하세요.');

        const targetMemberNo = Number(checked.dataset.memberNo);
        console.log(targetMemberNo)

        const resp =  await fetch("/devtalk/create/private",{
        method : "POST",
        headers: {'Content-Type' : 'application/json'},
        body : JSON.stringify(
            targetMemberNo)
        })

        const result = await resp.text();

        return result;

    } catch(e) {
        console.error(e);
        alert('채팅방 생성 실패');
    }
    
}

const deleteBtn = document.getElementById('image-delete-btn');
const defaultImage = imagePreview.src;

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

deleteBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();   // label 클릭 방지

    imagePreview.src = defaultImage;   // 기본 이미지 복원
    imageInput.value = "";             
});


/* 그룹 채팅방 추가 함수 */
async function createGroup(){
    
    try{

        const checkedUsers = document.querySelectorAll('input[name="invite"]:checked');
    
        if (checkedUsers.length < 2) {
            alert('그룹 채팅은 최소 2명 이상 선택해야 합니다.');
            return;
        }
    
        const memberNos = [];
        for (let user of checkedUsers) {
    
            memberNos.push(Number(user.dataset.memberNo));
        }
    
        console.log(memberNos);
    
    
        const roomName = document.getElementById('roomName').value.trim();
        if (!roomName) {
            alert('채팅방 이름을 입력하세요.');
            return;
        }
    
        console.log(roomName);
    
        const img = imageInput.files[0];
    
        console.log(img);
    
        const formData = new FormData();
        formData.append('roomName', roomName);
    
        for (let memberNo of memberNos) {
            formData.append('memberNo', memberNo);
        }
    
        if(img){
            
            formData.append('roomImg', img);
        }
    
        const resp = await fetch('/devtalk/create/group', {
            method : "POST",
            body : formData
        });
    
        const roomNo = await resp.text();
    
        return roomNo;
    } catch(e) {
        console.error(e);
        alert('채팅방 생성 실패');
    }

}

/* 
    FormData
    - JavaScript의 내장 객체 웹폼의 데이터와 동일한 형식으로 key value 쌍을 쉽게 캡슐화하기 위해 설계
    - 파일 데이터를 포함하여 텍스트 데이터와 함께 서버로 전송할 수 있도록 데이터 표준화

    -FormData 객체는 append(키, 값) 메서드를 사용하여 필요한 모든 데이터를 추가
    - 같은 key 값으로 여러개 append 하면 배열처럼 쌓임 
    - 비동기 요청 보낼때 headers 따로 작성 x 자동으로 설정해줘서 
    - key 값하고 서버에서 받을 변수명 일치 시키면 편함
*/


// 해당 채팅방 이동 효과
function enterChatRoom(roomNo) {
    // 1. UI 선택 효과
    document
        .querySelectorAll('.room-item.is-selected')
        .forEach(el => el.classList.remove('is-selected'));

    const target = document.querySelector(`[data-room-no="${roomNo}"]`);
    if (!target) return;

    target.classList.add('is-selected');

    const unreadCountEl = document.querySelector('.unread-count');
    if(unreadCountEl) unreadCountEl.remove();

    // 2. 채팅 UI 생성
    showChatRoomUI();

    // 3. 채팅 정보 로딩
    loadChatRoom(roomNo);

    // 5. 채팅방 입장 시 마지막 읽은 메세지 업데이트
    sendReadSignal(roomNo);
    // 4. STOMP 구독
    subscribeRoom(roomNo);


}




document.getElementById('room-cancle-btn')?.addEventListener('click', e => {
    
    document.querySelector('.create-room').classList.add('hide')
})


/* ======================================================================================================== */



/* 메세지 수정 공감 삭제 드롭다운 */
/* 채팅 영역 함수 */
let openBox = null;




function bindMessageContextMenu() {

    const chatArea = document.getElementById('chattingArea');
    if (!chatArea) return;

    chatArea.addEventListener('contextmenu', e => {

        const box = e.target.closest('.bubble');
        if (!box) return;

        e.preventDefault();
        e.stopPropagation();

        const container = box.closest('.message-content');
        if (!container) return;

        const option = container.querySelector('.msg-option');
        const emojiArea = container.querySelector('.emoji-area');
        if (!option || !emojiArea) return;

        if (openBox === option) {
            option.classList.add('display-none');
            openBox = null;
            return;
        }

        if (openBox) {
            openBox.classList.add('display-none');
        }

        option.classList.toggle('display-none');
        openBox = option;

        const reactionBtn = option.querySelector('.msg-reaction-btn');
        if (reactionBtn) {
            reactionBtn.onclick = ev => {
                ev.stopPropagation();

                option.classList.add('display-none');
                openBox = null;

                emojiArea.classList.remove('display-none');
                emojiAreaClose(emojiArea);
                emojiClickClose(emojiArea);
            };
        }
    });
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




/* ===========================================
    채팅 UI 이벤트 바인딩
    fragment 로딩 후 반드시 호출
=========================================== */
function bindChatUIEvents() {

    /* ---------- 검색 / 메뉴 슬라이드 ---------- */

    const searchPanel  = document.querySelector('.chat-search-panel');
    const menuPanel    = document.querySelector('.chat-menu-panel');
    const searchBtn    = document.getElementById('text-search-btn');
    const chatMenuBtn  = document.getElementById('chat-menu-btn');

    if (searchBtn && searchPanel && menuPanel) {
        searchBtn.addEventListener('click', e => {
            e.stopPropagation();

            menuPanel.classList.remove('is-open');
            searchPanel.classList.toggle('is-open');
        });
    }

    if (chatMenuBtn && searchPanel && menuPanel) {
        chatMenuBtn.addEventListener('click', e => {
            e.stopPropagation();

            searchPanel.classList.remove('is-open');
            menuPanel.classList.toggle('is-open');
        });
    }

    /* ---------- 채팅방 나가기 ---------- */

    const exitBtn     = document.getElementById('exit-btn');
    const exitArea    = document.querySelector('.exit-check');
    const chatOverlay = document.getElementById('chat-overlay');
    const noBtn       = document.getElementById('no');
    const yesBtn      = document.getElementById('yes');

    if (exitBtn && exitArea && chatOverlay) {
        exitBtn.addEventListener('click', () => {
            exitArea.classList.remove('display-none');
            chatOverlay.classList.add('active');
        });
    }

    if (noBtn && exitArea && chatOverlay) {
        noBtn.addEventListener('click', () => {
            exitArea.classList.add('display-none');
            chatOverlay.classList.remove('active');
        });
    }

    if (yesBtn && exitArea && chatOverlay) {
        yesBtn.addEventListener('click', () => {
            exitArea.classList.add('display-none');
            chatOverlay.classList.remove('active');

            // TODO: 채팅방 나가기 비동기 요청
            // leaveChatRoom();
        });
    }
}


/* ------------------------------------------- */
/* 수정하기 버튼 클릭 시 입력 폼 변화 */

// const sendArea = document.querySelector('.send-area');
// const editArea = document.querySelector('.edit-area');
// 
// const editCancelBtn = document.getElementById('edit-cancle-btn');
// 
// const msgEditBtn = document.querySelectorAll('.msg-edit-btn')
// 
// for (let editBtn of msgEditBtn) {
// 
//     editBtn.addEventListener('click', e => {
// 
//         const messageContainer = editBtn.closest('.message-content');
// 
//         const bubble = messageContainer.querySelector('.bubble');
//         
//         const originText = bubble.innerText;
// 
//         console.log("원본 메세지 : ", originText)
// 
//         openEditMode(originText);
//         
//         
// 
//         const opt = editBtn.closest('.msg-option')
// 
//         opt.classList.add('display-none')
// 
// 
//     })
//     
// }
// 
// 
// /* 편입 입력으로 전환 */
// function openEditMode(originText) {
//     // 기존 입력창 숨김
//     sendArea.classList.add('display-none');
// 
//     // 수정창 표시
//     editArea.classList.remove('display-none');
// 
//     // 기존 메시지 내용 세팅
//     document.getElementById('edit-message').value = originText
//     document.getElementById('edit-message').focus();
// }
// 
// editCancelBtn.addEventListener('click', () => {
//     closeEditMode();
// });
// 
// /* 다시 본 입력창 전환 */
// function closeEditMode() {
//     // 수정창 숨김
//     editArea.classList.add('display-none');
// 
//     // 기존 입력창 표시
//     sendArea.classList.remove('display-none');
// 
//     // 수정 textArea 초기화
//     document.getElementById('edit-message').value = '';
// }


/* 수정보튼 클릭 or 엔터 입력 시 서버에 전송 ?  */
/* editBtn?.addEventListener('click', () => {
    const editedText = document.getElementById('edit-message').value;

    if (!editedText.trim()) return;

    

    closeEditMode();
}); */

/* 메세지 수정 함수 */
function bindMessageEditEvents() {

    const sendArea = document.querySelector('.send-area');
    const editArea = document.querySelector('.edit-area');
    const editCancelBtn = document.getElementById('edit-cancle-btn');
    const chatArea = document.getElementById('chattingArea');

    if (!sendArea || !editArea || !chatArea) return;

    chatArea.addEventListener('click', e => {

        const editBtn = e.target.closest('.msg-edit-btn');
        if (!editBtn) return;

        const messageContainer = editBtn.closest('.message-content');
        if (!messageContainer) return;

        const bubble = messageContainer.querySelector('.bubble');
        if (!bubble) return;

        const originText = bubble.innerText;

        openEditMode(originText, sendArea, editArea);

        const opt = editBtn.closest('.msg-option');
        if (opt) opt.classList.add('display-none');
    });

    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', () => {
            closeEditMode(sendArea, editArea);
        });
    }
}


function openEditMode(originText, sendArea, editArea) {
    sendArea.classList.add('display-none');
    editArea.classList.remove('display-none');

    const input = document.getElementById('edit-message');
    if (!input) return;

    input.value = originText;
    input.focus();
}

function closeEditMode(sendArea, editArea) {
    editArea.classList.add('display-none');
    sendArea.classList.remove('display-none');

    const input = document.getElementById('edit-message');
    if (input) input.value = '';
}



/* 유저 초대 */
/* 초대 버튼 클릭 시 비동기로 회원 목록 조회후 fragment 써서 렌더링 예정 */
/*  */

// const inviteBtn = document.getElementById('invite-btn');
// const inviteList = document.getElementsByName('roomInvite')
// const selectedArea = document.querySelector('.select-user-area');
// 
// 
// inviteBtn?.addEventListener('click', e=> {
//     for (let item of inviteList) {
//         item.checked = false
//         
//     }
//     selectedArea.innerHTML = ""
//     chatOverlay.classList.add('active')
//     document.getElementsByClassName('user-invite-box')[0].classList.remove('display-none')
// 
// })
// 
// 
// 
// /* 유저 리스트 체크박스 하나씩 */
// for (let checkbox of inviteList) {
//     checkbox.addEventListener('change', e => {
// 
//         const listBox = e.target.closest('.user-list');
// 
//         const nameEl =
//             listBox.querySelector('.user-name') ||
//             listBox.querySelector('span');
// 
//         const userName = nameEl.innerText;
// 
//         if (e.target.checked) {
//             if (!inviteExist(userName)) {
//                 inviteAddUser(userName, e.target);
//             }
//         } else {
//             inviteDeleteUser(userName);
//         }
//     });
// }

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
// document.getElementById('invite-cancel')?.addEventListener('click', e => {
//     document.getElementsByClassName('user-invite-box')[0].classList.add('display-none')  
//     chatOverlay.classList.remove('active')
// })


function bindInviteEvents() {

    const inviteBtn = document.getElementById('invite-btn');
    const inviteList = document.getElementsByName('roomInvite');
    const selectedArea = document.querySelector('.select-user-area');
    const chatOverlay = document.getElementById('chat-overlay');

    inviteBtn?.addEventListener('click', () => {
        for (let item of inviteList) item.checked = false;
        selectedArea.innerHTML = '';
        chatOverlay.classList.add('active');
        document.querySelector('.user-invite-box')
            ?.classList.remove('display-none');
    });

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

    document.getElementById('invite-cancel')
        ?.addEventListener('click', () => {
            document.querySelector('.user-invite-box')
                ?.classList.add('display-none');
            chatOverlay.classList.remove('active');
        });

        /* 초대 버튼 클릭 시  */
        document.getElementById('invite-user')?.addEventListener('click', e => {
            document.getElementsByClassName('user-invite-box')[0].classList.add('display-none');
            chatOverlay.classList.remove('active');
        
            /* 비동기 요청 ------------------------------------ */
        
            alert("초대 되었습니다 ! ");
        })
}





/* 방 이름 수정 버튼 클릭 시 */
function bindTeamNameEditEvent() {

    /* 방 이름 수정 버튼 */
    const editBtn = document.getElementById('team-name-change');
    const teamNameSpan = document.querySelector('.team-name');
    const panelTitle = document.querySelector('.member-panel-title');

    if (!editBtn || !teamNameSpan || !panelTitle) return;

    editBtn.addEventListener('click', () => {

        /* 이미 input 상태면 중복 생성 방지 */
        if (panelTitle.querySelector('input')) return;

        const currentName = teamNameSpan.innerText;

        /* 기존 span 숨김 */
        teamNameSpan.classList.add('display-none');

        /* input 생성 */
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('team-name-input');
        input.value = currentName;

        /*
            insertBefore(새요소, 기준요소)
            → editBtn 앞에 input 삽입
        */
        panelTitle.insertBefore(input, editBtn);
        input.focus();

        /* 편집 완료 처리 함수 */
        const finishEdit = () => {

            const newName = input.value.trim();

            if (newName) {
                teamNameSpan.innerText = newName;
            }

            /* 
                TODO: 
                팀 이름 변경 비동기 요청 (서버 업데이트)
            */

            input.remove();
            teamNameSpan.classList.remove('display-none');
        };

        /* Enter 키 입력 시 완료 */
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });

        /* 포커스 해제 시 완료 */
        input.addEventListener('blur', finishEdit);
    });
}


// /* 고정 핀 클릭 시 */
// const pinnedBtn = document.getElementById('pinned-btn');
// const unpinnedBtn = document.getElementById('unpinned-btn');
// 
// 
// /* 각각 db 상태값 변경 후 채팅방 목록 재정렬 해야함*/
// pinnedBtn.addEventListener('click', e => {
//     pinChange()
// })
// 
// unpinnedBtn.addEventListener('click', e => {
//     pinChange()
// })
// 
// function pinChange() {
//     pinnedBtn.classList.toggle('display-none')
//     unpinnedBtn.classList.toggle('display-none')
// }




/* ------------------------------------------ */
/* 메세지 삭제 버튼 클릭 시 */

// const msgDeleteBtn = document.querySelectorAll('.msg-delete-btn');
// const delCheck = document.querySelector('.del-check')
// 
// for (let delBtn of msgDeleteBtn) {
// 
//     delBtn.addEventListener('click', e => {
// 
//         const opt = delBtn.closest('.msg-option');
// 
//         opt.classList.add('display-none');
// 
//         delCheck.classList.remove('display-none');
// 
//         chatOverlay.classList.toggle('active')
//     })
//     
// }
// 
// 
// const msgDelYes = document.getElementById("msg-del-yes");
// const msgDelNo = document.getElementById("msg-del-no");
// 
// msgDelYes.addEventListener('click', e => {
//     delCheck.classList.add('display-none');
//     chatOverlay.classList.toggle('active');
// 
//     /* 비동기로 화면 삭제 로직 처리 */
// 
// 
// })
// 
// msgDelNo.addEventListener('click', e => {
//     delCheck.classList.add('display-none');
//     chatOverlay.classList.toggle('active');
// 
// })

function bindMessageDeleteEvents() {

    const chatArea = document.getElementById('chattingArea');
    const delCheck = document.querySelector('.del-check');
    const msgDelYes = document.getElementById("msg-del-yes");
    const msgDelNo = document.getElementById("msg-del-no");

    if (!chatArea || !delCheck || !msgDelYes || !msgDelNo) return;

    let targetMessageNo = null;

    // 삭제 버튼 클릭 (이벤트 위임)
    chatArea.addEventListener('click', e => {

        const delBtn = e.target.closest('.msg-delete-btn');
        if (!delBtn) return;

        const opt = delBtn.closest('.msg-option');
        opt?.classList.add('display-none');

        const msgItem = delBtn.closest('.message-item');
        targetMessageNo = msgItem?.dataset.messageNo;

        delCheck.classList.remove('display-none');
        chatOverlay?.classList.add('active');
    });

    // 삭제 확인 - 예
    msgDelYes.onclick = () => {

        if (!targetMessageNo) return;

        delCheck.classList.add('display-none');
        chatOverlay?.classList.remove('active');

        /*
            TODO:
            서버에 삭제 요청 보내기
            성공하면:
            document.querySelector(`[data-message-no="${targetMessageNo}"]`) 제거
        */

        targetMessageNo = null;
    };

    // 삭제 확인 - 아니오
    msgDelNo.onclick = () => {
        delCheck.classList.add('display-none');
        chatOverlay?.classList.remove('active');
        targetMessageNo = null;
    };
}





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



/* =========================================================== */
/* 채팅방 정보 조회 이름 메세지 목록 회원 등등  */

async function loadChatRoom(roomNo) {

    const resp = await fetch('/devtalk/roomInfoLoad?roomNo='+ roomNo)

    if (!resp.ok) {
        console.error('채팅방 로드 실패');
        return;
    }

    const html = await resp.text(); 

    const chattingArea = document.querySelector('#chatting-space');
    chattingArea.outerHTML  = html;

    afterFuncLoad();
    console.log("roomNo : ",roomNo)

    bindChatSendInputEvents(roomNo)

    


}

// 함수 재바인딩
function afterFuncLoad(){
    bindMessageEditEvents();
    bindMessageContextMenu();
    bindTeamNameEditEvent();
    bindMessageDeleteEvents();
    bindChatUIEvents();
    bindInviteEvents();
    scrollToBottom();
};

function showChatRoomUI() {
    document.querySelector('.room-empty')?.classList.add('display-none');
    document.querySelector('.room-exist')?.classList.remove('display-none');
}


let stompClient = null;


// 웹소켓 + STOMP 연결
function connectSocket(){

    // 서버 WebSocket 엔드포인트(/ws-chat)로 연결 생성
    const socket = new SockJS('/ws-chat');

    // webSocket 위에 STOMP 프로토콜을 올려서 메세지 통신 구조 생성
    // websocket위에 STOMP  규칙을 얹어서 메세지 교환 규칙을 만듦
    stompClient= Stomp.over(socket);


    // STOMP 연셜 요청
    // 연결 성공 시 console창
    stompClient.connect({}, () => {
        console.log('STOMP connected');


        stompClient.subscribe(
            '/topic/chat-list/' + myNo,
            onChatListUpdate
        );
    })



}



// 현재 구독중인 채팅방 관리 변수
let currentSubscription = null;
let currentRoomNo = null;

// 채팅방 입장시 해당 채팅방 구독
function subscribeRoom(roomNo) {

    // 이전방 퇴장
    if(currentRoomNo !== null) {
        const data = {
            room_no : currentRoomNo,
            member_no : myNo

        }
        stompClient.send(
            '/devtalk/chat.leave',
            {},
            JSON.stringify(data)
        );
    }

    // 이미 다른 채팅방을 보고 있다면
    // 이전 채팅방 구독 해제
    if (currentSubscription) {

        currentSubscription.unsubscribe();
    }

    // 선택한 채팅방의 topic을 구독
    // topic 이란 ? -> 여러 클라이언트가 동시에 구독할 수 있는 메세지 채널
    // topic -> 브로드캐스트 채널 1:n
    // queue -> 1:1
    // 이 순간부터 해당 채팅방의 메세지만 수신
    currentSubscription = stompClient.subscribe(
        '/topic/room/' + roomNo, // 채팅방 고유 주소
        onMessageReceived // 이 채팅방으로 들어오는 모든 메세지 수신 처리기
    );

    enterRoomCount(roomNo);



    currentRoomNo = roomNo;
    

    console.log('subscribed to room:', roomNo);
    console.log('subscription object:', currentSubscription);
}


function enterRoomCount(roomNo) {

    

    const data = {
        room_no : roomNo,
        member_no : myNo

    }
    stompClient.send(
        '/devtalk/chat.enter',{},
        JSON.stringify(data)
    )
}


// 채팅방 리스트 정보 최신화
function onChatListUpdate(payload) {
    
    const updateInfo = JSON.parse(payload.body);
    console.log("채팅방 리스트 업데이트용 : " + payload.body);

        
    const listItem = document.querySelector(`[data-room-no="${updateInfo.room_no}"]`)



    if(!listItem) return;
    
    // 마지막 보낸 메세지, 시간 업데이트
    listItem.querySelector('.last-message').innerText = updateInfo.last_message;
    listItem.querySelector('.chat-time').innerText = formatTime(updateInfo.sendtime);

    moveTop(updateInfo.room_info);

    // 현재 보고 있는 방과 같으면 함수 종료
    if(currentRoomNo === updateInfo.room_no) return;

    // 안 읽은 메세지 개수 
    const countPin = listItem.querySelector('.count-pin')
    const unreadCount = listItem.querySelector('.unread-count');

    if(unreadCount) {
        unreadCount.innerText = updateInfo.unread_count;
    } else {

        const span = document.createElement('span');
        span.className = 'unread-count fw-600 fs-14';
        span.innerText = updateInfo.unread_count;

        countPin.append(span);
        
    }





}

// 채팅방 상단 이동 함수
function moveTop(roomNo) {

    const list = document.querySelector('.room-list');
    const item = list.querySelector(`[data-room-no="${roomNo}"]`);


    if(!item) return;


    list.prepend(item);

}



function sendMessage(chatRoomNo, content) {
    const totalMember = document.querySelector('.member-counting').innerText;
    const msg = {
        chatRoomNo : chatRoomNo,
        sender : myNo,
        content : content,
        total_count : Number(totalMember)
    };

    console.log("msg : ", msg);

    stompClient.send('/devtalk/chat.send', {}, JSON.stringify(msg));
}


// 채팅 전송 함수

function bindChatSendInputEvents(chatRoomNo) {
    const textArea = document.getElementById("send-message");
    const sendBtn = document.getElementById("send-btn");

    if(!textArea || !sendBtn) return;

    sendBtn.addEventListener('click', e => {
        const content = textArea.value.trim();
        if(!content) return;

        sendMessage(chatRoomNo, content);
        textArea.value = '';
    })

    
    textArea.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
            if(!e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
                textArea.value = '';
            }
        }
    })
}



// 메세지 수신기
function onMessageReceived(payload) {
    const msg = JSON.parse(payload.body);
    console.log('RECEIVED:', msg);
    appendMessage(msg);

    sendReadSignal(msg.room_no);
}



function appendMessage(msg) {
    const isMine = msg.sender_no === myNo;
    const el = isMine ? createMyMessage(msg) : createOtherMessage(msg);

    const area = document.querySelector('.message-list');
    area.appendChild(el);
    area.scrollTop = area.scrollHeight;
}


function createLiBase(className, msg) {
    const li = document.createElement('li');
    li.className = `message-item flex gap-12 ${className}`;
    li.dataset.memberNo = msg.sender_no;
    li.dataset.messageNo = msg.message_no;
    return li;
}

/* 내 메세지 */
function createMyMessage(msg) {

    const li = document.createElement('li');
    li.className = 'message-item flex gap-12 my';
    li.dataset.messageNo = msg.message_no;

    const content = document.createElement('div');
    content.className = 'message-content flex-col gap-12';

    // bubble
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = msg.content;

    // reaction badge
    const reaction = document.createElement('div');
    reaction.className = 'reaction-badge';

    // options
    const option = document.createElement('ul');
    option.className = 'list-none msg-option display-none';

    option.innerHTML = `
        <li class="msg-edit-btn">수정하기</li>
        <li class="msg-delete-btn">삭제하기</li>
        <li class="msg-reaction-btn">공감하기</li>
    `;

    // emoji area
    const emoji = document.createElement('div');
    emoji.className = 'emoji-area flex display-none';
    emoji.innerHTML = `<span>❤️</span><span>👍</span><span>😀</span><span>😂</span><span>😮</span><span>😡</span>`;

    // 안 읽은 사람 수
    
    let unreadCount = null;
    if(msg.unread_count > 0) {

        unreadCount = document.createElement('span');
        unreadCount.className = 'unread-people fs-12'
        unreadCount.innerText = msg.unread_count;

    }


    // time 
    const time = document.createElement('span');
    time.className = 'fs-12 send-time';
    time.innerText = formatTime(msg.sendtime);


    if (unreadCount) {
    content.append(bubble, reaction, option, emoji, unreadCount, time);
    } else {
        content.append(bubble, reaction, option, emoji, time);
    }
    li.appendChild(content);

    return li;
}


/* 쟤 메세지 */
function createOtherMessage(msg) {

    const li = createLiBase('other', msg);

    // 프로필 이미지
    const img = document.createElement('img');
    img.className = 'profile-img';
    img.src = msg.profile_img ?? '/images/logo.png';
    li.appendChild(img);

    const content = document.createElement('div');
    content.className = 'message-content flex-col gap-12';

    // 이름
    const name = document.createElement('span');
    name.className = 'fw-600';
    name.innerText = msg.sender_name;

    // bubble
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = msg.content;

    // reaction badge
    const reaction = document.createElement('div');
    reaction.className = 'reaction-badge';

    // options
    const option = document.createElement('ul');
    option.className = 'list-none msg-option display-none';
    option.innerHTML = `
        <li class="msg-reaction-btn">공감하기</li>
        <li class="msg-report-btn">신고하기</li>
    `;

    // emoji area
    const emoji = document.createElement('div');
    emoji.className = 'emoji-area flex display-none';
    emoji.innerHTML = `
        <span>❤️</span><span>👍</span><span>😀</span>
        <span>😂</span><span>😮</span><span>😡</span>
    `;

    let unreadCount = null;
    if(msg.unread_count > 0) {

        unreadCount = document.createElement('span');
        unreadCount.className = 'unread-people fs-12'
        unreadCount.innerText = msg.unread_count;

    }

    // time (⚠️ bubble 밖)
    const time = document.createElement('span');
    time.className = 'fs-12 send-time';
    time.innerText = formatTime(msg.sendtime);

    if (unreadCount) {
    content.append(name, bubble, reaction, option, emoji, unreadCount, time);
    } else {
        content.append(name, bubble, reaction, option, emoji, time);
    }
    li.appendChild(content);

    return li;
}






// 시간 변환 함수
function formatTime(timeStr) {
    if (!timeStr) return '';

    // 소수점 3자리까지만 남기기 → JS Date 안정화
    const safe = timeStr.replace(/\.(\d{3})\d*/, '.$1');

    const d = new Date(safe);

    if (isNaN(d)) {
        console.error('Invalid Date:', timeStr);
        return '';
    }

    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');

    return `${hh}:${mm}`;
}



/* 채팅방 입장 or 채팅방 참여 시 마지막 읽은 메세지 업데이트 */
function sendReadSignal(roomNo) {

    if (!stompClient || !stompClient.connected) {
        console.warn('stomp 연결 x');
        return;
    }

    const payload = {
        room_no: roomNo,
        member_no : myNo
    };

    console.log(payload.room_no);
    console.log(payload.member_no);

    stompClient.send(
        '/devtalk/chat.read',
        {},
        JSON.stringify(payload)
        
    );

}


/* ------------------------------------------- */
/* 채팅방 검색 */
const searchChat = document.getElementById("chatting-search-area");
    

searchChat.addEventListener("keydown", e => {

    if (e.key === 'Enter') {
        const keyword = searchChat.value.trim();

        if (!keyword) return;   // 비어있으면 종료

        console.log("검색어:", keyword);
        selectChatList(keyword);
    }

}); 


