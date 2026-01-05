console.log("blogDetail.js loaded")

// === 전역 변수 및 초기 데이터 로드 ===
const postId = document.getElementById('postId').value;
const loginUserId = document.getElementById('loginUserId').value;
const postPrice = parseInt(document.getElementById('postPrice').value || 0);
let userBalance = 0;
const balanceEl = document.getElementById('userBalance');
if(balanceEl) userBalance = parseInt(balanceEl.value || 0);

// DOM 요소 참조
const commentListEl = document.getElementById('commentList');
const commentTotalCountEl = document.getElementById('commentTotalCount');
const mainCommentInput = document.getElementById('mainCommentInput');
const btnPostLike = document.getElementById('btnPostLike');
const postHeartIcon = document.getElementById('postHeartIcon');

// 초기화
function init() {
    loadComments(); 
}

// === 게시글 기능 ===

function togglePostLike() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    fetch(`/api/blog/like/${postId}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.isLiked) {
                    btnPostLike.classList.add('active');
                    postHeartIcon.classList.replace('fa-regular', 'fa-solid');
                } else {
                    btnPostLike.classList.remove('active');
                    postHeartIcon.classList.replace('fa-solid', 'fa-regular');
                }
                document.getElementById('postLikeCount').innerText = data.count;
            }
        });
}

function deletePost() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    fetch(`/api/blog/delete/${postId}`, { method: 'DELETE' })
    .then(res => {
        if(res.ok) { alert("삭제되었습니다."); location.href = '/blog/list'; }
    });
}

// === 댓글 기능 ===

function loadComments() {
    fetch(`/api/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => { renderComments(data); })
        .catch(err => console.error("댓글 불러오기 오류 :", err));
}

function renderComments(comments) {
    commentListEl.innerHTML = '';
    let totalCount = 0;
    comments.forEach(comment => {
        totalCount++;
        commentListEl.appendChild(createCommentElement(comment));
        if (comment.children && comment.children.length > 0) {
            comment.children.forEach(reply => {
                totalCount++;
                commentListEl.appendChild(createCommentElement(reply, true));
            });
        }
    });
    if(commentTotalCountEl) commentTotalCountEl.innerText = totalCount;
    const countEl = document.getElementById('commentCount');
    if(countEl) countEl.innerText = totalCount;
}

function createCommentElement(data, isReply = false) {
    const el = document.createElement('div');
    el.className = `comment-item ${isReply ? 'reply' : ''}`;
    el.id = `comment-${data.commentNo}`;
    const isMine = loginUserId && (String(data.memberNo) === String(loginUserId));
    const profileSrc = data.profileImg || '/images/user.png';
    const likeClass = data.isLiked ? 'active' : '';
    const heartIcon = data.isLiked ? 'fa-solid' : 'fa-regular';

    el.innerHTML = `
        <div class="comment-content">
            <div class="comment-header">
                <img src="${profileSrc}" class="avatar">
                <div class="comment-meta">
                    <span class="username">${data.memberNickname}</span>
                    <span class="comment-date">${data.cCreateDate || '방금 전'}</span>
                </div>
            </div>
            <div class="comment-text" id="text-${data.commentNo}">${data.commentContent}</div>
            <div class="comment-actions">
                <button class="action-btn like-comment-btn ${likeClass}" onclick="toggleCommentLike(${data.commentNo}, this)">
                    <i class="${heartIcon} fa-heart"></i>
                    <span class="like-count">${data.likeCount}</span>
                </button>
                ${!isReply ? `<button class="action-btn" onclick="openReplyForm(${data.commentNo})">답글</button>` : ''}
                ${isMine ? `
                    <button class="action-btn" onclick="enableEditMode(${data.commentNo})">수정</button>
                    <button class="action-btn delete-btn" onclick="deleteComment(${data.commentNo})">삭제</button>
                ` : ''}
            </div>
            <div id="reply-form-area-${data.commentNo}"></div>
        </div>
    `;
    return el;
}

// 댓글 등록 함수 수정
function addMainComment() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    const content = mainCommentInput.value.trim();
    if (!content) return alert("내용을 입력해주세요.");

    const payload = {
        boardNo: parseInt(postId),        // ReplyDto의 @JsonProperty("boardNo")
        commentContent: content,          // ReplyDto의 @JsonProperty("commentContent")
        parentCommentNo: null             // 새 댓글은 부모 없음
    };

    fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (res.ok) {
            mainCommentInput.value = '';
            loadComments(); 
        } else {
            return res.text().then(text => { alert("등록 실패: " + text) });
        }
    })
    .catch(err => console.error("에러 발생:", err));
}

function toggleCommentLike(commentId, btn) {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    fetch(`/api/comments/${commentId}/like`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            const icon = btn.querySelector('i');
            const countSpan = btn.querySelector('.like-count');
            let count = parseInt(countSpan.innerText);
            if (data.liked) {
                btn.classList.add('active');
                icon.classList.replace('fa-regular', 'fa-solid');
                countSpan.innerText = count + 1;
            } else {
                btn.classList.remove('active');
                icon.classList.replace('fa-solid', 'fa-regular');
                countSpan.innerText = Math.max(0, count - 1);
            }
        }
    });
}

// 답글창 열기
function openReplyForm(commentNo) {
    // 이미 열린 다른 답글 폼 닫기
    document.querySelectorAll('[id^="reply-form-area-"]').forEach(el => el.innerHTML = '');
    
    const area = document.getElementById(`reply-form-area-${commentNo}`);
    area.innerHTML = `
        <div class="reply-form-container">
            <textarea id="replyInput-${commentNo}" placeholder="답글을 작성하세요..."></textarea>
            <div class="reply-actions">
                <button class="btn-reply-cancel" onclick="this.closest('.reply-form-container').remove()">취소</button>
                <button class="btn-reply-submit" onclick="addReply(${commentNo})">등록</button>
            </div>
        </div>`;
}

// 답글 등록
function addReply(parentNo) {
    const input = document.getElementById(`replyInput-${parentNo}`);
    const content = input.value.trim();
    if (!content) return alert("내용을 입력하세요.");

    fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            boardNo: parseInt(postId), 
            commentContent: content, 
            parentCommentNo: parentNo 
        })
    }).then(res => { 
        if (res.ok) loadComments(); 
        else alert("답글 등록 실패");
    });
}
// 댓글 삭제
function deleteComment(commentId) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    fetch(`/api/comments/${commentId}`, { method: 'DELETE' }).then(res => { if (res.ok) loadComments(); });
}

// 게시글 수정
function enableEditMode(id) {
    const textEl = document.getElementById(`text-${id}`);
    const currentText = textEl.innerText;
    
    // 수정 중에는 액션 버튼들(수정, 삭제, 답글)을 잠시 숨기면 더 깔끔합니다.
    const actionArea = textEl.parentElement.querySelector('.comment-actions');
    if(actionArea) actionArea.style.display = 'none';

    textEl.innerHTML = `
        <div class="edit-form-wrapper">
            <textarea id="editInput-${id}" class="edit-textarea">${currentText}</textarea>
            <div class="comment-edit-actions">
                <button class="btn-cancel-edit" onclick="loadComments()">취소</button>
                <button class="btn-save-edit" onclick="saveEdit(${id})">저장</button>
            </div>
        </div>`;
    
    // 포커스 자동 이동
    document.getElementById(`editInput-${id}`).focus();
}
// 게시글 수정 저장 api
function saveEdit(id) {
    const newContent = document.getElementById(`editInput-${id}`).value;
    if(!newContent.trim()) return alert("내용을 입력해주세요.");

    fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // 필드명을 DTO의 @JsonProperty와 일치시킴
        body: JSON.stringify({ commentContent: newContent }) 
    }).then(res => { 
        if (res.ok) {
            alert("수정되었습니다.");
            loadComments(); 
        } else {
            alert("수정 실패");
        }
    }).catch(err => console.error("수정 오류:", err));
}

// 결제 관련
function openPurchaseModal() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalPurchase').classList.remove('hidden');
}

function closeAllModals() {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.querySelectorAll('.modal-box').forEach(box => box.classList.add('hidden'));
}

function processPayment() {
    document.getElementById('modalPurchase').classList.add('hidden');
    if (userBalance < postPrice) {
        document.getElementById('modalNoBalance').classList.remove('hidden');
        return;
    }
    fetch('/api/payment/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: postId, amount: postPrice })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) document.getElementById('modalSuccess').classList.remove('hidden');
        else alert("결제 실패: " + data.message);
    });
}

init();