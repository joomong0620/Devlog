console.log("blogDetail.js loaded")

// === 전역 변수 및 초기 데이터 로드 ===
const postId = document.getElementById('postId').value;
const loginUserId = document.getElementById('loginUserId').value;
const postPrice = parseInt(document.getElementById('postPrice').value || 0);
let userBalance = parseInt(document.getElementById('userBalance').value || 0);
const balanceEl = document.getElementById('userBalance');
if(balanceEl) userBalance = parseInt(balanceEl.value || 0);

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

    // 좋아요 API는 아직 구현 안 했으므로 패스하거나 추가 필요
    // 일단 UI만 동작하게 둠 (나중에 구현 시 fetch 추가)
    const isLiked = btnPostLike.classList.contains('active');
    if (isLiked) {
        btnPostLike.classList.remove('active');
        postHeartIcon.classList.replace('fa-solid', 'fa-regular');
    } else {
        btnPostLike.classList.add('active');
        postHeartIcon.classList.replace('fa-regular', 'fa-solid');
    }
}

// 게시글 삭제
function deletePost() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    // 블로그 게시글 삭제 API (BlogController에 추가 필요, 일단 경로 예시)
    // 현재 BlogController에는 delete가 없으므로 추후 구현 필요
    alert("게시글 삭제 기능은 아직 구현되지 않았습니다.");
}

// 팔로우 토글
function toggleFollow(btn) {
    if (!loginUserId) return alert("로그인이 필요합니다.");
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
    fetch(`/api/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => {
            renderComments(data); 
        })
        .catch(err => console.error("Comment Load Error:", err));
}

// 2. 댓글 렌더링
function renderComments(comments) {
    commentListEl.innerHTML = '';
    let totalCount = 0;

    comments.forEach(comment => {
        totalCount++;
        commentListEl.appendChild(createCommentElement(comment));

        // 답글 처리 (ReplyDto의 children 리스트)
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

// 댓글 HTML 생성 (DTO 필드명에 맞게 수정됨)
function createCommentElement(data, isReply = false) {
    const el = document.createElement('div');
    el.className = `comment-item ${isReply ? 'reply' : ''}`;
    el.id = `comment-${data.commentNo}`; // id -> commentNo

    // 로그인한 유저와 댓글 작성자가 같은지 확인 (memberNo 비교)
    const isMine = loginUserId && (String(data.memberNo) === String(loginUserId));
    
    // 프로필 이미지 처리
    const profileSrc = data.profileImg || '/images/default_profile.png';

    el.innerHTML = `
        <a href="#" class="profile-link">
            <img src="${profileSrc}" alt="${data.memberNickname}" class="avatar">
        </a>
        <div class="comment-content">
            <div class="comment-header">
                <div class="comment-meta">
                    <span class="username">${data.memberNickname}</span>
                    <span class="comment-date">${data.cCreateDate || '방금 전'}</span>
                </div>
            </div>
            
            <div class="comment-text" id="text-${data.commentNo}">${data.commentContent}</div>
            
            <div class="comment-actions">
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

// 3. 메인 댓글 작성
function addMainComment() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    const content = mainCommentInput.value.trim();
    if (!content) return alert("내용을 입력해주세요.");

    // [수정] DTO 필드명에 맞춤
    const payload = {
        boardNo: postId,            // postId -> boardNo
        commentContent: content,    // content -> commentContent
        parentCommentNo: null       // parentId -> parentCommentNo
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
                alert('댓글 등록 실패');
            }
        });
}

// 3. 메인 댓글 작성
function addMainComment() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    const content = mainCommentInput.value.trim();
    if (!content) return alert("내용을 입력해주세요.");

    // DTO 필드명에 맞춤
    const payload = {
        boardNo: postId,            // postId -> boardNo
        commentContent: content,    // content -> commentContent
        parentCommentNo: null       // parentId -> parentCommentNo
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
                alert('댓글 등록 실패');
            }
        });
}

// 4. 답글 폼 열기
function openReplyForm(commentNo) {
    if (!loginUserId) return alert("로그인이 필요합니다.");

    document.querySelectorAll('[id^="reply-form-area-"]').forEach(el => el.innerHTML = '');

    const area = document.getElementById(`reply-form-area-${commentNo}`);
    area.innerHTML = `
        <div class="reply-form-container">
            <div class="input-wrapper">
                <textarea id="replyInput-${commentNo}" placeholder="답글을 작성하세요..."></textarea>
                <div class="input-footer">
                    <button class="btn-submit-styled" onclick="addReply(${commentNo})">등록</button>
                </div>
            </div>
        </div>
    `;
}

// 5. 답글 등록
function addReply(parentNo) {
    const input = document.getElementById(`replyInput-${parentNo}`);
    const content = input.value.trim();
    if (!content) return alert("내용을 입력하세요.");

    // DTO 필드명에 맞춤
    const payload = {
        boardNo: postId,
        commentContent: content,
        parentCommentNo: parentNo
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

// 7. 댓글 수정
function enableEditMode(id) {
    const textEl = document.getElementById(`text-${id}`);
    const currentText = textEl.innerText;

    textEl.innerHTML = `
        <textarea id="editInput-${id}" class="edit-textarea">${currentText}</textarea>
        <div style="text-align:right; margin-top:5px;">
            <button class="action-btn" onclick="saveEdit(${id})" style="color:var(--primary-color);">저장</button>
            <button class="action-btn" onclick="loadComments()">취소</button>
        </div>
    `;
}

// 7-1. 댓글 수정 저장
function saveEdit(id) {
    const newContent = document.getElementById(`editInput-${id}`).value;

    // Map<String, String>으로 받으므로 key는 'content'가 맞음 (Controller 확인)
    // ReplyApiController: body.get("content")로 받음 -> OK
    fetch(`/api/comments/${id}`, {
        method: 'PUT',
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

    // PaymentRequestDto 필드명에 맞춤 (postId, amount) -> OK
    fetch('/api/payment/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: postId, amount: postPrice })
    })
    .then(res => res.json()) // JSON 응답 파싱
    .then(data => {
        if (data.success) {
            document.getElementById('modalSuccess').classList.remove('hidden');
            // 성공 모달 확인 누르면 새로고침되도록 모달 HTML에 onclick="location.reload()" 추가 권장
        } else {
            // 잔액 부족 등 에러 메시지가 오면 처리
            if(data.message && data.message.includes("잔액")) {
                document.getElementById('modalNoBalance').classList.remove('hidden');
            } else {
                alert("결제 실패: " + (data.message || "오류 발생"));
            }
        }
    })
    .catch(err => {
        console.error("Payment Error:", err);
        alert("서버 통신 오류");
    });
}

function openReportModal() {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalReport').classList.remove('hidden');
}

function submitReport() {
    alert("신고가 접수되었습니다.");
    closeAllModals();
}

// 실행
init();