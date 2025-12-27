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
            // 여기에 백엔드 이미지 업로드 로직 추가 필요
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

// [기능 추가] 나가기 버튼
document.querySelector('.btn-exit').addEventListener('click', () => {
    if (confirm('작성중인 글이 사라집니다. 정말 나가시겠습니까?')) {
        history.back(); // 뒤로 가기
    }
});

// [기능 추가] 임시저장 버튼
document.querySelector('.btn-draft').addEventListener('click', () => {
    // 실제 저장 로직 필요 (localStorage 또는 서버 전송)
    alert('게시글이 임시저장 되었습니다.');
});

// 발행하기 버튼
document.querySelector('.btn-publish').addEventListener('click', () => {
    const title = document.querySelector('.input-title').value.trim();
    const content = editor.getMarkdown().trim(); // 마크다운 내용
    const isPaid = document.querySelector('input[name="content-type"]:checked').value === 'paid';

    // [기능 추가] 필수 입력값 검증
    if (!title) {
        alert('제목을 입력해주세요.');
        document.querySelector('.input-title').focus();
        return;
    }

    if (content.length === 0) {
        alert('내용을 입력해주세요.');
        return;
    }

    if (isPaid && (!priceInput.value || priceInput.value == 0)) {
        alert('유료 콘텐츠의 가격을 설정해주세요.');
        priceInput.focus();
        return;
    }

    // 데이터 구성
    const postData = {
        title: title,
        tags: Array.from(tags), 
        content: content,
        isPaid: isPaid,
        price: isPaid ? parseInt(priceInput.value) : 0 // 숫자로 변환
    };

    console.log('발행 데이터:', postData);

    // 백엔드 전송 로직 (fetch)
    fetch('/api/blog/write',{
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
        },
        body : JSON.stringify(postData),
    })
    .then(response => {
        if(response.ok){
            alert('발행이 완료되었습니다!');
            location.href = "/blog/list"; // 목록 페이지로 이동
        } else {
            alert('발행 중 오류가 발생했습니다.');
            console.error('Error : ', response);
        }
    })
    .catch(error => {
        console.error('Network Error : ', error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    })
});