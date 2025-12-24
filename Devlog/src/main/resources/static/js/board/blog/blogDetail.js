/* * [Backend Integration Clean Version]
 * Mock Data 제거, API 연동 준비 완료
 */

// === 전역 변수 및 초기 데이터 로드 ===
const postId = document.getElementById('postId').value;
const loginUserId = document.getElementById('loginUserId').value;
const postPrice = parseInt(document.getElementById('postPrice').value || 0);
let userBalance = parseInt(document.getElementById('userBalance').value || 0);

// DOM 요소 참조
const commentListEl = document.getElementById('commentList');
const commentTotalCountEl = document.getElementById('commentTotalCount');
const mainCommentInput = document.getElementById('mainCommentInput');
const postLikeCountSpan = document.getElementById('postLikeCount');
const btnPostLike = document.getElementById('btnPostLike');
const postHeartIcon = document.getElementById('postHeartIcon');

// 초기화
function init() {
    loadComments(); // 댓글 목록 서버에서 불러오기
    // checkIsLiked(); // (선택) 내가 이 글을 좋아요 했는지 체크하는 API 호출
}

// === 게시글 기능 ===

// 좋아요 토글
function togglePostLike() {
    if (!loginUserId) return alert("로그인이 필요합니다.");

    // TODO: 서버로 좋아요 요청 전송
    fetch(`/api/posts/${postId}/like`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            // data.liked 여부에 따라 아이콘 및 숫자 갱신
            if (data.liked) {
                btnPostLike.classList.add('active');
                postHeartIcon.classList.replace('fa-regular', 'fa-solid');
            } else {
                btnPostLike.classList.remove('active');
                postHeartIcon.classList.replace('fa-solid', 'fa-regular');
            }
            postLikeCountSpan.innerText = data.count;
        })
        .catch(err => console.error("Like Error:", err));
}

// 게시글 삭제
function deletePost() {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch(`/api/posts/${postId}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) {
                alert('삭제되었습니다.');
                location.href = '/blog/list'; // 목록 페이지로 이동
            } else {
                alert('삭제 실패');
            }
        });
}

// 팔로우 토글 (UI 로직만 유지, 실제 연동 시 API 필요)
function toggleFollow(btn) {
    if (!loginUserId) return alert("로그인이 필요합니다.");

    // TODO: 팔로우 API 호출
    // fetch(...)

    const isFollowing = btn.classList.contains("following");
    if (isFollowing) {
        btn.innerText = "+ 팔로우";
        btn.classList.remove("following");
    } else {
        btn.innerText = "✓ 팔로잉";
        btn.classList.add("following");
    }
}

// === 댓글 기능 (API 연동) ===

// 1. 댓글 목록 불러오기
function loadComments() {
    // TODO: API 엔드포인트에 맞게 수정
    fetch(`/api/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => {
            renderComments(data); // 데이터를 받아서 그리는 함수
        })
        .catch(err => console.error("Comment Load Error:", err));
}

// 2. 댓글 렌더링
function renderComments(comments) {
    commentListEl.innerHTML = '';
    let totalCount = 0;

    // 댓글 구조에 맞게 순회 (계층형인지 평문형인지에 따라 로직 조정 필요)
    // 여기서는 평탄화된 리스트라고 가정하거나, 백엔드에서 계층형으로 준다고 가정
    comments.forEach(comment => {
        totalCount++;
        commentListEl.appendChild(createCommentElement(comment));

        // 대댓글이 children 필드에 있다면 재귀적으로 처리 필요
        if (comment.children && comment.children.length > 0) {
            comment.children.forEach(reply => {
                totalCount++;
                commentListEl.appendChild(createCommentElement(reply, true));
            });
        }
    });

    commentTotalCountEl.innerText = totalCount;
    document.getElementById('commentCount').innerText = totalCount;
}

// 댓글 HTML 생성
function createCommentElement(data, isReply = false) {
    const el = document.createElement('div');
    el.className = `comment-item ${isReply ? 'reply' : ''}`;
    el.id = `comment-${data.id}`;

    const isMine = String(data.userId) === String(loginUserId);
    const heartClass = data.isLiked ? 'fa-solid' : 'fa-regular';
    const activeClass = data.isLiked ? 'active' : '';

    el.innerHTML = `
        <a href="/blog/${data.nickname}" class="profile-link">
            <img src="${data.profileUrl || '/images/default_profile.png'}" alt="${data.nickname}" class="avatar">
        </a>
        <div class="comment-content">
            <div class="comment-header">
                <div class="comment-meta">
                    <a href="/blog/${data.nickname}" class="profile-link">
                        <span class="username">${data.nickname}</span>
                    </a>
                    <span class="comment-date">${data.createdDate}</span>
                </div>
            </div>
            
            <div class="comment-text" id="text-${data.id}">${data.content}</div>
            
            <div class="comment-actions">
                <button class="action-btn like-comment-btn ${activeClass}" onclick="toggleCommentLike(${data.id})">
                    <i class="${heartClass} fa-heart"></i> ${data.likeCount || 0}
                </button>
                ${!isReply ? `<button class="action-btn" onclick="openReplyForm(${data.id})">답글 달기</button>` : ''}
                ${isMine ? `
                    <button class="action-btn" onclick="enableEditMode(${data.id})">수정</button>
                    <button class="action-btn delete-btn" onclick="deleteComment(${data.id})">삭제</button>
                ` : ''}
            </div>
            <div id="reply-form-area-${data.id}"></div>
        </div>
    `;
    return el;
}

// 3. 메인 댓글 작성
function addMainComment() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    const content = mainCommentInput.value.trim();
    if (!content) return alert("내용을 입력해주세요.");

    const payload = {
        postId: postId,
        content: content,
        parentId: null // 최상위 댓글
    };

    fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (res.ok) {
                mainCommentInput.value = '';
                loadComments(); // 목록 새로고침
            } else {
                alert('댓글 등록 실패');
            }
        });
}

// 4. 답글 폼 열기 (HTML 생성)
function openReplyForm(commentId) {
    if (!loginUserId) return alert("로그인이 필요합니다.");

    // 기존 열린 폼 초기화
    document.querySelectorAll('[id^="reply-form-area-"]').forEach(el => el.innerHTML = '');

    const area = document.getElementById(`reply-form-area-${commentId}`);
    area.innerHTML = `
        <div class="reply-form-container">
            <div class="input-wrapper">
                <textarea id="replyInput-${commentId}" placeholder="답글을 작성하세요..."></textarea>
                <div class="input-footer">
                    <button class="btn-submit-styled" onclick="addReply(${commentId})">등록</button>
                </div>
            </div>
        </div>
    `;
}

// 5. 답글 등록
function addReply(parentId) {
    const input = document.getElementById(`replyInput-${parentId}`);
    const content = input.value.trim();
    if (!content) return alert("내용을 입력하세요.");

    const payload = {
        postId: postId,
        content: content,
        parentId: parentId
    };

    fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) loadComments();
        else alert('답글 등록 실패');
    });
}

// 6. 댓글 삭제
function deleteComment(commentId) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) loadComments();
            else alert('삭제 실패');
        });
}

// 7. 댓글 수정 (UI 모드 전환)
function enableEditMode(id) {
    const textEl = document.getElementById(`text-${id}`);
    const currentText = textEl.innerText;

    textEl.innerHTML = `
        <textarea id="editInput-${id}" class="edit-textarea">${currentText}</textarea>
        <div style="text-align:right;">
            <button class="action-btn" onclick="saveEdit(${id})" style="color:var(--primary-color);">저장</button>
            <button class="action-btn" onclick="loadComments()">취소</button>
        </div>
    `;
}

function saveEdit(id) {
    const newContent = document.getElementById(`editInput-${id}`).value;

    fetch(`/api/comments/${id}`, {
        method: 'PUT', // or PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
    }).then(res => {
        if (res.ok) loadComments();
        else alert('수정 실패');
    });
}

// === 유료 결제 및 모달 관련 ===

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

    // 서버로 결제 요청
    fetch('/api/payment/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: postId, amount: postPrice })
    })
        .then(res => {
            if (res.ok) {
                document.getElementById('modalSuccess').classList.remove('hidden');
            } else {
                alert("결제 처리 중 오류가 발생했습니다.");
            }
        });
}

function openReportModal() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalReport').classList.remove('hidden');
}

function submitReport() {
    // TODO: 신고 API 호출
    alert("신고가 접수되었습니다.");
    closeAllModals();
}

// 실행
init();