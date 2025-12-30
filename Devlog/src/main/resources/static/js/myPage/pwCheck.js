document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirmBtn');
    const passwordInput = document.getElementById('passwordInput');
    const errorModal = document.getElementById('errorModal');

    // 가상의 정답 비밀번호 (서버와 연동 필요)
    const CORRECT_PASSWORD = "password123";

    const verifyPassword = () => {
        const inputVal = passwordInput.value;

        if (inputVal === CORRECT_PASSWORD) {
            alert('비밀번호가 확인되었습니다. 설정 페이지로 이동합니다.');
            // window.location.href = "/settings"; // 이동할 경로
        } else {
            errorModal.classList.remove('hidden');
        }
    };

    // 버튼 클릭 이벤트
    confirmBtn.addEventListener('click', verifyPassword);

    // 엔터 키 이벤트
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
});

// 모달 닫기 함수
function closeModal() {
    document.getElementById('errorModal').classList.add('hidden');
    document.getElementById('passwordInput').focus();
}