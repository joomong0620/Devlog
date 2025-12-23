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

// 로그인
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
