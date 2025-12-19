document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.profile-section');
    const defaultImg = "https://via.placeholder.com/150"; // 기본 이미지 경로

    // 1. 비동기식 메뉴 전환 (Tab Logic)
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');

            // 메뉴 활성화 상태 변경
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // 섹션 전환
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === target) {
                    sec.classList.add('active');
                }
            });
        });
    });

    // 2. 프로필 이미지 미리보기 및 삭제
    const fileInput = document.getElementById('fileInput');
    const profileDisplay = document.getElementById('profileDisplay');
    const deleteImgBtn = document.getElementById('deleteImgBtn');

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

    deleteImgBtn.addEventListener('click', () => {
        if(confirm("프로필 이미지를 삭제하고 기본 이미지로 변경하시겠습니까?")) {
            profileDisplay.src = defaultImg;
            fileInput.value = "";
        }
    });
});

// 3. 공통 수정 알림 함수
function handleUpdate(type) {
    const isConfirmed = confirm(`${type}하시겠습니까?`);
    if (isConfirmed) {
        alert(`${type}이 완료되었습니다.`);
    }
}

// 4. 회원 탈퇴 전용 로직
function handleWithdraw() {
    const agree = document.getElementById('agreeTerm').checked;
    if (!agree) {
        alert("약관 동의가 필요합니다.");
        return;
    }

    const isConfirmed = confirm("정말 탈퇴하시겠습니까?\n* 보유하신 포인트는 모두 소멸됩니다.\n* 소멸된 포인트는 다시 복구할 수 없습니다.");
    if (isConfirmed) {
        alert("탈퇴 처리되었습니다. 그동안 이용해주셔서 감사합니다.");
        // window.location.href = 'main.html'; // 실제로는 메인으로 이동
    }
}