console.log("header.js load");

// 채탕
const devtalkBtn = document.getElementById("devtalk");
devtalkBtn?.addEventListener("click", () => {
  location.href = "/devtalk";
});

// 로그인
const signinBtn = document.getElementById("signinBtn");
signinBtn?.addEventListener("click", () => {
  window.location.href = "/member/login";
});

// 로그아웃
const logout = document.getElementById("logout");
logout?.addEventListener("click", () => {
  window.location.href = "/member/logout";
});

// 프로필
const profile = document.getElementById("profile");
profile?.addEventListener("click", () => {
  profile.classList.toggle("active");
});

// 바깥 클릭 시 닫기
window.addEventListener("click", (e) => {
  if (profile && !profile.contains(e.target)) {
    profile.classList.remove("active");
  }
});

// 사이드바
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn?.addEventListener("click", () => {
  sidebar?.classList.toggle("active");
  overlay?.classList.toggle("active");
});

overlay?.addEventListener("click", () => {
  sidebar?.classList.remove("active");
  overlay?.classList.remove("active");
});

/* 다크모드 */
const darkModeBtn = document.getElementById("darkModeBtn");

// class=theme-icon 클래스 지정해둔걸 기준으로 src를 교체하는 방향으로 다크모드를 적용한다.
// 다크모드 버튼을 클릭할 시 theme-icon 클래스가 붙어있는 애들은 _dark.svg 즉, 다크모드 전용으로 만들어둔 아이콘으로 변경한다.
function updateThemeIcons(theme) {
  const icons = document.querySelectorAll("img.theme-icon");

  icons.forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;

    // 이미 _dark가 붙어있는지 확인
    const isDarkIcon = src.includes("_dark");

    if (theme === "dark" && !isDarkIcon) {
      img.setAttribute("src", src.replace(".svg", "_dark.svg"));
    }

    if (theme === "light" && isDarkIcon) {
      img.setAttribute("src", src.replace("_dark.svg", ".svg"));
    }
  });
}

// 초기 테마
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
updateThemeIcons(savedTheme);

// 다크모드 버튼
darkModeBtn?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcons(next);
});




