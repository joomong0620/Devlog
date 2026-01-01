console.log("freeboardList.js loaded");
// 글쓰기 버튼 클릭 시 


document.getElementById("fbWriteBtn")?.addEventListener("click", ()=>{
    // JS BOM 객체 중 location
    console.log(location.pathname.split("/"));

    // location.href = '주소' : 해당 주소로 요청(GET 방식)
    location.href = `/board/freeboard/7`;
    //location.href = `/board2/freeboard/${location.pathname.split("/")[2]}/insert`;
                    // /board2/freeboard/insert
});