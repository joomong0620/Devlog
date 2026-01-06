console.log("fbChatbot.js loaded");


// 기본 설정
const chatBox = document.getElementById("chatBox"); // 주요소1
const chatInput = document.getElementById("chatInput"); // 주요소2
const sendBtn = document.getElementById("sendBtn"); // 주요소3
const tokenInfo = document.getElementById("tokenInfo"); // 주요소4 // id="tokenInfo"인 요소가 없어서 tokenInfo가 null이 되고, 거기에 textContent를 설정하려다 에러가 발생한 거예요.

const sessionId = "session2"; // 이거 생성/관리 필요

let totalServerTokens = 0;
let totalClientTokens = 0;
let lastQuestion = "";
let lastAiAnswer = "";

// /////////// 유틸
function tokenCalc(text) {
    return Math.ceil(text.length / 4); // 4ch.-> 1 token, ballpark guessing
}

function updateTokenInfo() {
    if (!tokenInfo) {
        console.warn("tokenInfo 요소를 찾을 수 없습니다.");
        return; // tokenInfo 없으면 그냥 리턴: 방어 코드- 토큰 정보 표시를 안하기
    }
    tokenInfo.textContent =
        `서버 토큰: ${totalServerTokens} | 클라이언트 토큰: ${totalClientTokens}`;
}

function scrollToBottom() { // 맨밑으로 채팅창 스크롤 내리기
    chatBox.scrollTop = chatBox.scrollHeight;
}

function now() { // timestamp
    return new Date().toLocaleString();
}


// ////////// 메시지 UI
function addUserMessage(text) {
    const row = document.createElement("div");
    row.className = "chat-row right";

    row.innerHTML = `
        <div class="bubble user">
            ${text}
            <div class="time">${now()}</div>
            <div class="name">${memberNickname}</div>
        </div>
        <img src=${profileImg} class="bot-img">
    `;

    chatBox.appendChild(row);
    scrollToBottom();

    totalClientTokens += tokenCalc(text);
    updateTokenInfo();
}

function addBotMessage(text) {
    const row = document.createElement("div");
    row.className = "chat-row left";

    // <img src="/images/board/freeboard/chatbot1.png" class="bot-img">
    row.innerHTML = `
        <img src=${cbtProfileImg} class="bot-img">
        <div>
            <div class="bubble bot">
                ${text.replace(/\n/g, "<br>")}
            </div>
            <div class="time">${now()}</div>
            <div class="name">DevLog 챗봇</div>
        </div>
    `;

    chatBox.appendChild(row);
    scrollToBottom();

    totalClientTokens += tokenCalc(text);
    updateTokenInfo();
}


// OpenAI (Spring AI) 연동
function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    chatInput.value = "";
    lastQuestion = msg; // 마지막 질문 keep하자

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
        .then(res => res.json())
        .then(data => {
            console.log("chatbot answer:");
            console.log(data); // 챗봇으로 부터 온 대답이 뭔지 함 보자.

            lastAiAnswer = data.reply; // 마지막 대답 keep하자

            // 3) 챗봇 대답 화면에 보여주기(Answer)
            addBotMessage(data.reply); 
            //addBotMessage(data.reply ?? data.content);
            // ?? => Nullish Coalescing Operator:
            // 왼쪽 값이 null 또는 undefined일 때만 오른쪽 값을 대신 사용하는 연산자
            // 서버 응답이 상황에 따라 reply로 올 수도 있고 content로 올 수도 있음

            if (data.usage && data.usage.total_tokens) { // openAPI 메타데이터: data.usage,  data.usage.total_tokens
                totalServerTokens += data.usage.total_tokens;
                updateTokenInfo();
            }
        })
        .catch(err => {
            addBotMessage("❗ 서버와 통신 중 오류가 발생했습니다.");
            console.error(err);
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

window.onload = scrollToBottom; // 최초 화면에서 채팅창 맨밑으로 내리기

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
