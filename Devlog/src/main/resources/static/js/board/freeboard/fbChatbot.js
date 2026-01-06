console.log("fbChatbot.js loaded");

console.log("BeansAmount", window.beansAmount)


// 기본 설정
const chatBox = document.getElementById("chatBox"); // 주요소1
const chatInput = document.getElementById("chatInput"); // 주요소2
const sendBtn = document.getElementById("sendBtn"); // 주요소3

const sessionId = "session2"; // 이거 생성/관리 필요 ( CB_SESSION테이블에 저장)

let totalServerTokens = 0;
let totalClientTokens = 0;
let lastQuestion = "";
let lastAiAnswer = "";

///////////////
// 기본 설정
// 페이지 로드 시 커피콩 체크 및 세션 시작
window.addEventListener('DOMContentLoaded', function() {
    checkBeansAndStartSession(); // 최초 가용 beansAmount 체크
    setupTextareaLimit();  // 입력 글자 수 제한 설정
});

/**
 * 커피콩 체크 후 세션 시작
 */
function checkBeansAndStartSession() {
    const chatbotType = document.getElementById("chatbotType")?.value || "basic";
    
    // 로그인 체크 (커피콩 챗봇의 경우)
    if(chatbotType === "kong" && !window.loginMemberNo) {
        alert("커피콩 충전형 챗봇은 로그인이 필요합니다.");
        window.close();
        return;
    }
    
    // 커피콩 챗봇인 경우 잔액 체크
    if(chatbotType === "kong") {
        const beansAmount = window.beansAmount || 0;
        
        if(beansAmount <= 0) {
            //alert("커피콩 충전 후 이용해 주세요");
            alert( `
                커피콩 잔액이 ${beansAmount}입니다.\n커피콩충전형 챗봇은 커피콩 충전 후 이용해 주세요.
                `.trim());
            
            // 부모 창이 있으면 부모 창을 리다이렉트, 없으면 현재 창
            if(window.opener) {
                window.opener.location.href = "/coffeebeans"; // 커피콩 충전화면으로 이동
                window.close();
            } else {
                window.location.href = "/coffeebeans";
            }
            return;
        }
    }
    
    // 커피콩이 충분하면 세션 시작
    //startChatbotSession();
}

// /////////// 유틸
function tokenCalc(text) {
    return Math.ceil(text.length / 4); // 4ch.-> 1 token, ballpark guessing
}

function updateTokenDisplay(promptTokens, completionTokens, totalTokens, accumulated_usedBeans) {
    const row1 = document.getElementById("beansAmount");
    if(row1) {
        row1.textContent = `콩 잔액: ${window.beansAmount - accumulated_usedBeans} 포인트`; // 테스트용으로 일부러 틀리게
    }

    const row2 = document.querySelector('.tu-row2 .token-info');
    if(row2) {
        row2.textContent = `사용 토큰 수: ${totalTokens} 토큰 (질문: ${promptTokens}, 답변: ${completionTokens}), 사용 콩: ${accumulated_usedBeans}`;
    }
    
    totalServerTokens += totalTokens; // 이게 한번 Q-and-A를 통해 사용한 Tokens 수
}

function updateBeansDisplay() {
    // 서버에서 최신 커피콩 정보 가져오기
    fetch('/api/chatbot/freeboard/usage') // GET 요청
        .then(res => res.json())
        .then(data => {
            
            console.log("가져온 최신 커피콩 정보:")
            console.log(data) // "totalTokens", "totalBeans", "remainingBeans"
            
            const row1 = document.querySelector('.tu-row1');
            if(row1 && data.remainingBeans !== undefined) {
                const beansInfo = row1.querySelector("#beansAmount");
                if(beansInfo) {
                    beansInfo.textContent = `커피콩 잔액: ${data.remainingBeans.toLocaleString()} 포인트`;
                }
            }
        })
        .catch(err => {
            console.warn('커피콩 정보 업데이트 실패:', err);
        });
}


function scrollToBottom() { // 맨밑으로 채팅창 스크롤 내리기
    chatBox.scrollTop = chatBox.scrollHeight;
}

function now() { // timestamp
    return new Date().toLocaleString();
}

/////////////////////////////////////////////////////////////
// ////////// 메시지 UI
function addUserMessage(text) {
    const row = document.createElement("div");
    row.className = "chat-row right";

    const nickname = window.memberNickname || "유저";

    row.innerHTML = `
        <div class="bubble user onclick="showCopyMenu(event, this)">
            ${text}
            <div class="time">${now()}</div>
            <div class="name">${nickname}</div>
        </div>
        <img src=${profileImg} class="bot-img">
    `;

    chatBox.appendChild(row);
    scrollToBottom();

}

function addBotMessage(text) {
    const row = document.createElement("div");
    row.className = "chat-row left";

    // <img src="/images/board/freeboard/chatbot1.png" class="bot-img">
    const botImg = window.cbtProfileImg || "/images/board/freeboard/chatbot1.png";
    //const botName = window.chatbotId || "DevLog 챗봇";
    // chatbotId = "BASIC" 또는 "KONG"

    row.innerHTML = `
        <img src=${botImg} class="bot-img">
        <div>
            <div class="bubble bot" onclick="showCopyMenu(event, this)">
                ${text.replace(/\n/g, "<br>")}
            </div>
            <div class="time">${now()}</div>
            <div class="name">DevLog 챗봇</div>
        </div>
    `;

    chatBox.appendChild(row);
    scrollToBottom();

}

////////////////////////////////////////////////////////////
// OpenAI (Spring AI) 연동:==> 실제 질문보내고, 돌아온 응답 (한 라운드) 받아처리
function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    // 로그인 체크 (커피콩 챗봇의 경우) -> 과금위해 필수
    const chatbotType = document.getElementById("chatbotType")?.value;
    if(chatbotType === "kong" && !window.loginMemberNo) {
        alert("커피콩 충전형 챗봇은 로그인이 필요합니다.");
        return;
    }


    chatInput.value = "";
    lastQuestion = msg; // 마지막 질문 keep할지말지

    // 1) 유저 질문 화면에 보여주기(Question)
    addUserMessage(msg);

    // 2) 유저 질문을 실제 openAI에 보내기
    fetch(`/api/chatbot/freeboard/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: msg
        //headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ message: msg })
        })
        .then(res => {
            if(!res.ok) {
                throw new Error(`서버 응답 오류: ${res.status}`);
            }
            return res.json();
        }) 
        .then(data => {
            //console.log("서버 응답:", data);
            console.log("chatbot answer:");
            console.log(data); // 챗봇으로 부터 온 대답이 뭔지 확인

            lastAiAnswer = data.reply; // 마지막 대답 keep할지말지

            // 3) 챗봇 대답 화면에 보여주기(Answer)
            addBotMessage(data.reply); 
            //addBotMessage(data.reply ?? data.content);

            // 토큰 사용량 표시: 실제 질문보내고, 돌아온 응답 (한 라운드) 받아처리
            // ==> 이게 백엔드에서 CB_TOKEN_USAGE, CB_SESSION, COFFEE_BEANS_TRADE 테이블에, Member에 삽입된 내용이다.
            if (data.usage) {
                // const { prompt_tokens, completion_tokens, total_tokens } = data.usage;
                const { prompt_tokens, 
                        completion_tokens, 
                        total_tokens, 
                        accumulated_tokens = undefined, 
                        accumulated_usedBeans =  undefined 
                    } = data.usage ?? {};


                updateTokenDisplay(prompt_tokens, completion_tokens, total_tokens, accumulated_usedBeans);
                
                // // 커피콩 정보 업데이트
                // const chatbotType = document.getElementById("chatbotType")?.value;
                // if(window.loginMemberNo && chatbotType === "kong") {
                //     updateBeansDisplay();
                // }


            }
        })
        .catch(err => {
            addBotMessage("❗ 서버와 통신 중 오류가 발생했습니다.");
            console.error(err);
            //console.error("챗봇 오류:", err);
            console.error("에러 메시지:", err.message);
        });
}


// 이벤트
sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// window.onload = scrollToBottom; // 최초 화면에서 채팅창 맨밑으로 내리기

// 페이지 로드 시 초기화
window.onload = function() {
    scrollToBottom();
    
    // 로그인한 경우 커피콩 정보 업데이트
    if(window.loginMemberNo) {
        updateBeansDisplay();
    }
};


// basic vs. kong chatbot popup window
function openChatbotType() {
    const select = document.getElementById("chatbotType");
    const selectedValue = select.value;

    let url = "";
    let pWinName = "";

    if (selectedValue === "basic") {
        url = "/api/chatbot/freeboard/popupBasicChatbot";
        // pWinName = "chatbotBasic";
        pWinName = "chatbot";
    } else if (selectedValue === "kong") {
        url = "/api/chatbot/freeboard/popupKongChatbot";
        // pWinName ="chatbotKong";
        pWinName ="chatbot";
    }

    if (!url) return;

    window.open(
        url,
        //"helper", // 창이름 (같은이름의 창존재-> 기존 창 재사용, 없으면 새 창 생성)
        pWinName,
        "width=520,height=760"
    );
}


/**
 * 입력 글자 수 제한 설정 (BASIC 타입만)
 */
function setupTextareaLimit() {
    const chatbotType = document.getElementById("chatbotType")?.value || "basic";
    const textarea = document.getElementById("chatInput");
    
    if(!textarea) return;
    
    if(chatbotType === "basic") {  // html의 select태그에서
        // // BASIC 타입: 500자 제한
        // textarea.maxLength = 500;
        // BASIC 타입: 20자 제한 (테스트용)
        textarea.maxLength = 20;
        
        // 글자 수 표시 추가
        const charCounter = document.createElement('div');
        charCounter.id = 'charCounter';
        charCounter.style.cssText = 'text-align: right; font-size: 12px; color: #777; padding: 5px 10px;';
        // charCounter.textContent = '0 / 500자';
        charCounter.textContent = '0 / 20자';
        
        const inputArea = document.querySelector('.input-area');
        if(inputArea && !document.getElementById('charCounter')) {
            inputArea.insertBefore(charCounter, textarea);
        }
        
        // 입력 시 글자 수 업데이트
        textarea.addEventListener('input', function() {
            let value = this.value;

            if (value.length > 20) {
                this.value = value.slice(0, 20) + '...';
            }

            const length = this.value.length;
            // charCounter.textContent = `${length} / 500자`;
            charCounter.textContent = `${length} / 20자`; // 테스트용
            
            // if(length >= 500) {
            //     charCounter.style.color = 'red';
            // } else if(length >= 450) {
            //     charCounter.style.color = 'orange';
            // } else {
            //     charCounter.style.color = '#777';
            // }
            if(length >= 20) {
                charCounter.style.color = 'red';
            } else if(length >= 15) {
                charCounter.style.color = 'orange';
            } else {
                charCounter.style.color = '#777';
            }
        });
    } else { 
        // KONG 타입: 4000자 제한 (기존 maxlength)
        textarea.maxLength = 4000;
        
        // 기존 글자 수 표시 제거
        const existingCounter = document.getElementById('charCounter');
        if(existingCounter) {
            existingCounter.remove();
        }
    }
}

/**
 * 말풍선 복사 메뉴 표시
 */
function showCopyMenu(event, bubbleElement) {
    event.stopPropagation();
    
    // 기존 메뉴 제거
    const existingMenu = document.querySelector('.copy-menu');
    if(existingMenu) {
        existingMenu.remove();
    }
    
    // 복사 메뉴 생성
    const menu = document.createElement('div');
    menu.className = 'copy-menu';
    menu.innerHTML = '<button onclick="copyBubbleText(event)">📋 복사</button>';
    
    // 메뉴 위치 설정
    menu.style.position = 'absolute';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    menu.style.zIndex = '1000';
    
    // 복사할 텍스트를 data 속성에 저장
    const textContent = bubbleElement.innerText
        .replace(bubbleElement.querySelector('.time')?.innerText || '', '')
        .replace(bubbleElement.querySelector('.name')?.innerText || '', '')
        .trim();
    menu.dataset.copyText = textContent;
    
    document.body.appendChild(menu);
    
    // 다른 곳 클릭하면 메뉴 닫기
    setTimeout(() => {
        document.addEventListener('click', closeCopyMenu);
    }, 100);
}

/**
 * 말풍선 텍스트 복사
 */
function copyBubbleText(event) {
    event.stopPropagation();
    
    const menu = event.target.closest('.copy-menu');
    const textToCopy = menu.dataset.copyText;
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('복사되었습니다!');
            menu.remove();
        })
        .catch(err => {
            console.error('복사 실패:', err);
            // 폴백: textarea 사용
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('복사되었습니다!');
            menu.remove();
        });
}

/**
 * 복사 메뉴 닫기
 */
function closeCopyMenu() {
    const menu = document.querySelector('.copy-menu');
    if(menu) {
        menu.remove();
    }
    document.removeEventListener('click', closeCopyMenu);
}