// 1. Toast UI Editor 초기화
const editor = new toastui.Editor({
    el: document.querySelector('#editor'), /* 에디터 적용할 요소 */
    height: '600px', /* 에디터 영역 높이 값 */
    initialEditType: 'markdown', /* 최초로 보여줄 에디터 타입 */
    previewStyle: 'vertical', /* 마크다운 프리뷰 스타일 */
    placeholder: '내용을 입력하세요.',
    hooks: {
        addImageBlobHook: (blob, callback) => {
            console.log('이미지 업로드:', blob);
            // 1. FormData에 이미지 파일 담기
            const formData = new FormData();
            formData.append('image', blob);

            // 2. 서버로 이미지 업로드 요청
            fetch('/api/blog/image-upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text()) // 저장된 이미지의 URL을 응답으로 받음
            .then(url => {
                // 3. 에디터에 이미지 URL 전달 (이미지 태그 삽입됨)
                callback(url, '이미지 설명');
            })
            .catch(error => console.error('이미지 업로드 실패:', error));
        }
    }
});

//2. 태그 입력 시스템
const tagInput = document.getElementById('tagInput');
const tagList = document.getElementById('tagList');
let tags = new Set(); // 중복 방지를 위해 Set 사용

function addTag(text) {
    const cleanText = text.trim().replace(/,/g, ''); // 콤마 제거
    if (cleanText.length > 0 && !tags.has(cleanText)) {
        tags.add(cleanText);
        renderTags();
    }
    tagInput.value = ''; // 입력창 초기화
}

function removeTag(text) {
    tags.delete(text);
    renderTags();
}

function renderTags() {
    tagList.innerHTML = ''; // 기존 렌더링 초기화
    tags.forEach(tag => {
        const tagElem = document.createElement('div');
        tagElem.className = 'tag-item';
        tagElem.innerHTML = `
            ${tag}
            <span class="btn-remove-tag" onclick="removeTag('${tag}')">&times;</span>
        `;
        tagList.appendChild(tagElem);
    });
}

// 태그 입력 이벤트 리스너
tagInput.addEventListener('keydown', (e) => {
    if (e.key === ',') {
        e.preventDefault(); // 기본 동작(폼 제출 등) 방지
        addTag(tagInput.value);
    }

    // 백스페이스로 마지막 태그 삭제
    if (e.key === 'Backspace' && tagInput.value === '' && tags.size > 0) {
        const lastTag = Array.from(tags).pop();
        removeTag(lastTag);
    }
});


// 3. 유료/무료 콘텐츠 설정 및 가격 검증
const radioButtons = document.querySelectorAll('input[name="content-type"]');
const priceWrapper = document.getElementById('priceWrapper');
const priceInput = document.getElementById('priceInput');

radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'paid') {
            priceWrapper.classList.add('active');
            priceInput.disabled = false;
            priceInput.focus();
        } else {
            priceWrapper.classList.remove('active');
            priceInput.disabled = true;
            priceInput.value = '';
        }
    });
});

// [기능 추가] 가격 음수 입력 방지
priceInput.addEventListener('input', function () {
    if (this.value < 0) {
        this.value = 0; // 음수 입력 시 0으로 강제 변경
        // 또는 alert("가격은 음수일 수 없습니다.");
    }
});


// 4. 모달(Modal) 제어
const modal = document.getElementById('guidelineModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.querySelector('.close-modal');

// 모달 열기
btnOpenModal.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('show');
});

// 모달 닫기 (X 버튼)
btnCloseModal.addEventListener('click', () => {
    modal.classList.remove('show');
});

// 모달 닫기 (배경 클릭)
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});


// 5. 버튼 액션 (나가기, 임시저장, 발행)

// 나가기 버튼
document.querySelector('.btn-exit').addEventListener('click', () => {
    if (confirm('작성중인 글이 사라집니다. 정말 나가시겠습니까?')) {
        history.back();
    }
});

/**
 * 게시글 저장 함수
 * @param {boolean} isTemp - true: 임시저장, false: 발행
 */
function savePost(isTemp) {
    const title = document.querySelector('.input-title').value.trim();
    const content = editor.getMarkdown().trim();
    const isPaid = document.querySelector('input[name="content-type"]:checked').value === 'paid';

    // 1. 유효성 검사
    if (!title) {
        alert('제목을 입력해주세요.');
        document.querySelector('.input-title').focus();
        return;
    }

    // 임시저장은 내용이 없어도 되는지 정책에 따라 결정 (여기선 내용 필수 유지)
    if (content.length === 0) {
        alert('내용을 입력해주세요.');
        return;
    }

    if (isPaid && (!priceInput.value || priceInput.value == 0)) {
        alert('유료 콘텐츠의 가격을 설정해주세요.');
        priceInput.focus();
        return;
    }

    // 2. 데이터 구성
    const postData = {
        title: title,
        tags: Array.from(tags),
        content: content,
        isPaid: isPaid,
        price: isPaid ? parseInt(priceInput.value) : 0,
        isTemp: isTemp // [핵심] true면 임시저장, false면 발행
    };

    console.log('전송 데이터:', postData);

    // 3. 백엔드 전송
    fetch('/api/blog/write', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
        .then(response => {
            if (response.ok) {
                // 메시지 구분
                const msg = isTemp ? '게시글이 임시저장 되었습니다.' : '발행이 완료되었습니다!';
                alert(msg);
                location.href = "/blog/list"; // 목록으로 이동
            } else {
                alert('저장 중 오류가 발생했습니다.');
                console.error('Error : ', response);
            }
        })
        .catch(error => {
            console.error('Network Error : ', error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        });
}

// [임시저장 버튼] -> savePost(true) 호출
document.querySelector('.btn-draft').addEventListener('click', () => {
    savePost(true);
});

// [발행하기 버튼] -> savePost(false) 호출
document.querySelector('.btn-publish').addEventListener('click', () => {
    savePost(false);
});
