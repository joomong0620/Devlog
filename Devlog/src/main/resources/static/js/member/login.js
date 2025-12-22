console.log("login.js loaded...");



const loginFrm = document.getElementById("loginFrm");
const memberEmail = document.querySelector("input[name='memberEmail']");
const memberPw = document.getElementsByName("memberPw")[0];

if (loginFrm != null) {
    loginFrm.addEventListener("submit", e => {
        // 기본 폼 제출 막기
        e.preventDefault();

        // 이메일 유효성 검사
        if (memberEmail.value.trim().length == 0) {
            alert("이메일을 입력해 주세요");
            memberEmail.focus();
            memberEmail.value = '';
            return;  // 이메일 미 입력시 무조건 return해야 아래 비밀번호 검사 안함
        }

        // 비밀번호 유효성 검사
        if (memberPw.value.trim().length == 0) {
            alert("비밀번호를 입력해 주세요");
            memberPw.focus();
            memberPw.value = '';
            return;
        }

        // 유효성 검사 통과 - 로그인 요청
        const formData = new URLSearchParams({
            memberEmail: memberEmail.value.trim(),
            memberPw: memberPw.value
        });

        fetch('/member/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('로그인 실패');
            }
            return response.json();
        })
        .then(data => {
            console.log('로그인 성공:', data);
            // 메인 페이지로 이동
            window.location.href = '/';
        })
        .catch(error => {
            console.error('로그인 오류:', error);
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
            // 실패 시 비밀번호 초기화
            memberPw.value = '';
            memberPw.focus();
        });
    });
}