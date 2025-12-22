document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.profile-section');

    // 주요 요소 선택
    const fileInput = document.getElementById('fileInput');
    const profileDisplay = document.getElementById('profileDisplay');
    const deleteImgBtn = document.getElementById('deleteImgBtn');

    const defaultImgPath = profileDisplay.src;

    // --- 1. 비동기식 메뉴 전환 (Tab Logic) ---
    // (이 부분은 변경 사항 없습니다)
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');

            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === target) {
                    sec.classList.add('active');
                }
            });
        });
    });

    // --- 2. 프로필 이미지 미리보기 및 삭제 ---

    // 파일 선택 시 미리보기 변경
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileDisplay.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 삭제 버튼 클릭 시 이벤트
    deleteImgBtn.addEventListener('click', () => {
        // 현재 이미지가 기본 이미지랑 같으면 굳이 삭제 물어볼 필요 없음 (선택사항)
        if (profileDisplay.src === defaultImgPath) {
            return;
        }

        if (confirm("프로필 이미지를 삭제하고 기본 이미지로 변경하시겠습니까?")) {
            // [핵심 변경 포인트]
            // 2. 저장해두었던 초기 경로(defaultImgPath)로 되돌립니다.
            profileDisplay.src = defaultImgPath;
            // 파일 인풋 초기화 (같은 파일을 다시 선택할 수 있게)
            fileInput.value = "";
        }
    });
});

// --- 3. 공통 수정 알림 함수 ---
function handleUpdate(type) {
    const isConfirmed = confirm(`${type}하시겠습니까?`);
    if (isConfirmed) {
        alert(`${type}이 완료되었습니다.`);
        // 실제로는 여기서 서버로 데이터를 전송하는 fetch/ajax 로직이 필요합니다.
    }
}

// --- 4. 회원 탈퇴 전용 로직 ---
function handleWithdraw() {
    const agree = document.getElementById('agreeTerm').checked;
    if (!agree) {
        alert("약관 동의가 필요합니다.");
        return;
    }

    const isConfirmed = confirm("정말 탈퇴하시겠습니까?\n* 보유하신 포인트는 모두 소멸됩니다.\n* 소멸된 포인트는 다시 복구할 수 없습니다.");
    if (isConfirmed) {
        alert("탈퇴 처리되었습니다. 그동안 이용해주셔서 감사합니다.");
        // window.location.href = '/'; // 메인 페이지로 이동
    }
}