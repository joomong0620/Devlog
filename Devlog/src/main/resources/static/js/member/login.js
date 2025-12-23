console.log("login.js loaded...");



const loginFrm = document.getElementById("loginFrm");
const memberEmail = document.querySelector("input[name='memberEmail']");
const memberPw = document.getElementsByName("memberPw")[0];
const saveId = document.getElementById("saveId");

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

        const formData = new URLSearchParams();
        formData.append("memberEmail", memberEmail.value.trim());
        formData.append("memberPw", memberPw.value);

        // 체크되어 있으면 saveId 전송
        if (saveId.checked) {
            formData.append("saveId", "on"); // 값은 아무 문자열이나 OK(null 만아니면됨)
        }

        // 디버깅
        console.log("saveId checked:", saveId.checked);
        console.log(formData.toString());

        fetch('/member/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        })
        .then(async response => {
            if (!response.ok) {
                // 실패 시 Body에서 메시지 추출
                const data = await response.json();
                throw new Error(data.message || '로그인 실패');
            }
            return response.json();
        })
        .then(data => {
            console.log('로그인 성공:', data);
            // 메인 페이지로 이동
            window.location.href = '/'; //  브라우저가 해당 URL로 새로 요청 -> 현재 페이지에서 / 경로로 브라우저가 이동 (redirect)
            // 클라이언트 측에서 페이지 이동이 일어나므로 redirect 동작
        })
        .catch(error => {
            console.error('로그인 오류:', error);
            alert(error.message); // 로그인 실패(401 Unauthorized) 또는 기타 서버 오류(500 INTERNAL_SERVER_ERROR)
            // 실패 시 비밀번호 초기화
            memberPw.value = '';
            memberPw.focus();
        });
    });
}