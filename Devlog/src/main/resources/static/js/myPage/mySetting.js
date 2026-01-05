console.log("mySetting.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------
    // 1. 탭 전환 로직 (기존 UI 유지)
    // -------------------------------------------------------
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.profile-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            // 메뉴 활성화
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // 섹션 활성화
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === target) sec.classList.add('active');
            });
        });
    });

    // -------------------------------------------------------
    // 2. [기능] 프로필 이미지 변경 (서버 업로드)
    // -------------------------------------------------------
    const fileInput = document.getElementById('fileInput');
    const profileDisplay = document.getElementById('profileDisplay');
    const deleteImgBtn = document.getElementById('deleteImgBtn');

    // (1) 파일 선택 시 -> 즉시 서버로 업로드 -> 이미지 변경
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            try {
                // 아까 만든 이미지 업로드 API 호출
                const response = await fetch('/api/myPage/update/image', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const newUrl = await response.text(); // 서버가 돌려준 새 이미지 주소
                    profileDisplay.src = newUrl;
                    alert("프로필 이미지가 변경되었습니다.");
                    
                    // (선택사항) 헤더에 있는 작은 프사도 같이 바꾸고 싶다면 아래 주석 해제
                    // const headerProfile = document.querySelector('.profile img');
                    // if(headerProfile) headerProfile.src = newUrl;
                } else {
                    alert("이미지 업로드에 실패했습니다.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("서버 오류가 발생했습니다.");
            }
        });
    }

    // (2) 이미지 삭제 버튼 (UI만 초기화 - DB 반영은 별도 API 필요하나 일단 기본 이미지로 보여줌)
    if (deleteImgBtn) {
        deleteImgBtn.addEventListener('click', () => {
            if (confirm("이미지를 기본 이미지로 변경하시겠습니까? (저장은 아직 안 됩니다)")) {
                profileDisplay.src = '/images/member/user.png'; 
                fileInput.value = "";
            }
        });
    }
});

// -------------------------------------------------------
// 3. [기능] 내 정보 변경 (버튼 클릭 시 호출)
// -------------------------------------------------------
async function handleUpdate(type) {
    
    // (1) 정보 수정
    if (type === 'info') {
        // 입력된 값 가져오기
        const data = {
            memberNickname: document.getElementById('memberNickname').value,
            memberCareer: document.getElementById('memberCareer').value,
            myInfoIntro: document.getElementById('myInfoIntro').value,
            memberTel: document.getElementById('memberTel').value,
            myInfoGit: document.getElementById('myInfoGit').value,
            myInfoHomepage: document.getElementById('myInfoHomepage').value
        };

        try {
            // 정보 수정 API 호출
            const response = await fetch('/api/myPage/update/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                alert(result.message); // "수정되었습니다."
                location.reload();     // 헤더 닉네임 갱신을 위해 새로고침
            } else {
                alert(result.message); // "중복된 닉네임입니다." 등
            }
        } catch (error) {
            console.error("Update failed:", error);
            alert("수정 중 오류가 발생했습니다.");
        }
    } 
    // (2) 비밀번호 변경 (추후 구현)
    else if (type === 'pw') {
        alert("비밀번호 변경 기능은 준비 중입니다!");
    }
    // (3) 구독 설정 (추후 구현)
    else if (type === 'sub') {
        const subPrice = document.getElementById("subscriptionPrice").value;

        if(subPrice < 5000){
            alert("구독료는 최소 5000입니다.");
            return;
        }

        console.log(subPrice, "구독료 확인");
        
        fetch("/api/myPage/subscribe", {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({
                price : subPrice
            })
        })
        .then(resp => {
            if(resp.ok) {
                alert("구독 설정 완료");
            }
        })
        .catch(e => console.log("구독 설정 실패", e));

    }
}

// -------------------------------------------------------
// 4. 회원 탈퇴 (추후 구현)
// -------------------------------------------------------
function handleWithdraw() {
    const agree = document.getElementById('agreeTerm');
    if (agree && !agree.checked) {
        alert("약관 동의가 필요합니다.");
        return;
    }
    if (confirm("정말 탈퇴하시겠습니까? (복구 불가)")) {
        alert("탈퇴 기능은 준비 중입니다.");
    }
}