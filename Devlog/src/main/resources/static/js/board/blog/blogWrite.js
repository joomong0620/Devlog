console.log('blogWrite.js loaded');

// 1. Toast UI Editor 초기화
const editor = new toastui.Editor({
    el: document.querySelector('#editor'),
    height: '600px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    placeholder: '내용을 입력하세요.',
    hooks: {
        addImageBlobHook: (blob, callback) => {
            // 이미지 업로드 로직 (기존과 동일)
            const formData = new FormData();
            formData.append('image', blob);

            fetch('/api/blog/imageUpload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(url => {
                callback(url, '이미지 설명');
            })
            .catch(error => console.error('이미지 업로드 실패:', error));
        }
    }
});

// 2. 태그 입력 시스템
const tagInput = document.getElementById('tagInput');
const tagList = document.getElementById('tagList');
let tags = new Set();

function addTag(text) {
    const cleanText = text.trim().replace(/,/g, '');
    if (cleanText.length > 0 && !tags.has(cleanText)) {
        tags.add(cleanText);
        renderTags();
    }
    tagInput.value = '';
}

function removeTag(text) {
    tags.delete(text);
    renderTags();
}

function renderTags() {
    tagList.innerHTML = '';
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

tagInput.addEventListener('keydown', (e) => {
    if (e.key === ',' || e.key === 'Enter') {
        e.preventDefault();
        addTag(tagInput.value);
    }
    if (e.key === 'Backspace' && tagInput.value === '' && tags.size > 0) {
        const lastTag = Array.from(tags).pop();
        removeTag(lastTag);
    }
});

// 3. 유료/무료 설정 UI
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

priceInput.addEventListener('input', function () {
    if (this.value < 0) this.value = 0;
});

// 4. 모달 제어 (생략 가능, 기존 유지)
const modal = document.getElementById('guidelineModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.querySelector('.close-modal');

if (btnOpenModal) {
    btnOpenModal.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('show');
    });
    btnCloseModal.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
}

document.querySelector('.btn-exit').addEventListener('click', () => {
    if (confirm('작성중인 글이 사라집니다. 정말 나가시겠습니까?')) history.back();
});

// ============================================================
// [핵심] 게시글 저장 함수 (DTO 필드명 매핑 수정)
// ============================================================
function savePost(isTemp) {
    const title = document.querySelector('.input-title').value.trim();
    const content = editor.getMarkdown().trim();
    const isPaidChecked = document.querySelector('input[name="content-type"]:checked').value === 'paid';

    if (!title) {
        alert('제목을 입력해주세요.');
        return document.querySelector('.input-title').focus();
    }
    if (content.length === 0) {
        return alert('내용을 입력해주세요.');
    }
    if (isPaidChecked && (!priceInput.value || priceInput.value == 0)) {
        alert('유료 콘텐츠의 가격을 설정해주세요.');
        return priceInput.focus();
    }

    // [DTO 매핑] 백엔드 BlogDTO 필드명과 일치시킴
    const postData = {
        boardTitle: title,            // title -> boardTitle
        boardContent: content,        // content -> boardContent
        tagList: Array.from(tags),    // tags -> tagList
        
        // boolean -> String("Y"/"N") 변환
        isPaid: isPaidChecked ? "Y" : "N",
        price: isPaidChecked ? parseInt(priceInput.value) : 0,
        tempFl: isTemp ? "Y" : "N"    // isTemp -> tempFl
    };

    console.log('전송 데이터:', postData);

    fetch('/api/blog/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    })
    .then(response => {
        if (response.ok) {
            alert(isTemp ? '임시저장 되었습니다.' : '발행되었습니다!');
            location.href = "/blog/list";
        } else {
            alert('저장 실패');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("통신 오류 발생");
    });
}

document.querySelector('.btn-draft').addEventListener('click', () => savePost(true));
document.querySelector('.btn-publish').addEventListener('click', () => savePost(false));