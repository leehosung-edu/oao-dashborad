//새 창을 띄워주는 코드, 언젠가 누가 쓰겠지...
    function click_committe_info(title) {
        const cachelees_url="/static/html/committe_info.html"+"?nocache"+ new Date().getTime()//캐시를 무시하는 코드, 개선 필요
        var newWindow = window.open(cachelees_url,"_blank");
        newWindow.onload = function() {
            newWindow.document.title = title;
        };
    }
    function click_committe_date(title) {
        const cachelees_url="/static/html/committe_info.html"+"?nocache"+ new Date().getTime()//캐시를 무시하는 코드, 개선 필요
        var newWindow = window.open(cachelees_url,"_blank");
        newWindow.onload = function() {
            newWindow.document.title = title;
        };
    }

    // function click_committe_info(title) {
    //     const cacheless_url = "/static/html/committe_info.html" + "?nocache=" + new Date().getTime();
    //     localStorage.setItem("pageTitle", title);
    //     window.location.href = cacheless_url;
    // }   
    //     function click_committe_date(title) {
    //     const cacheless_url = "/static/html/committe_info.html" + "?nocache=" + new Date().getTime();
    //     localStorage.setItem("pageTitle", title);
    //     window.location.href = cacheless_url;
    // }
    // 기존 창에서 열리게 하는 코드, committe_info의 script와와 연동됨



    //위원회 소개 및 일정을 알려주는 버튼 생성기

    const container_button = document.getElementById("main");
    if (!container_button) {
        console.error("❌ 'main' 요소가 존재하지 않습니다!");
    }
    
    let start_top_button = 964, startleft_button = 230;
    const cmts = [
        "국회운영위원회", "법제사법위원회", "정무위원회", "기획재정위원회", "교육위원회",
        "과학기술정보 방송통신위원회", "외교통일위원회", "국방위원회", "행정안전위원회",
        "문화체육관광위원회", "농림축산식품 해양수산위원회", "산업통상자원 중소벤처기업위원회",
        "보건복지위원회", "환경노동위원회", "국토교통위원회", "정보위원회", "여성가족위원회", "예산결산특별위원회"
    ];
    
    let cmts_index = 0;
    for (let i = start_top_button; i <= 3804; i += 355) {
        for (let j = startleft_button; j <= 783; j += 407) {
    
            if (cmts_index >= cmts.length) {
                console.warn("⚠️ 배열 범위를 초과했습니다!");
                break;
            }
    
            console.log(`현재 cmts_index: ${cmts_index}, 배열 값: ${cmts[cmts_index]}`);
    
            let div1 = document.createElement("div");
            div1.innerText = "위원회 소개";
            div1.classList.add("button");
            div1.style.position = "absolute";
            div1.style.top = `${i}px`;
            div1.style.left = `${j}px`;
            let currentIndex1 = cmts_index;
            div1.onclick = function() {
                click_committe_date(cmts[currentIndex1]);//여기다 클릭시 실행할 함수 투입:
            };
            container_button.appendChild(div1);
    
    
            j += 145;
    
            let div2 = document.createElement("div");
            div2.innerText = "일정 보기";
            div2.classList.add("button");
            div2.style.position = "absolute";
            div2.style.top = `${i}px`;
            div2.style.left = `${j}px`;
            
            // 현재 인덱스를 캡처하여 이벤트 핸들러 내에서 사용
            let currentIndex2 = cmts_index;
            div2.onclick = function() {
                click_committe_date(cmts[currentIndex2]);//여기다 클릭시 실행할 함수 투입:
            };
            
            container_button.appendChild(div2);
            cmts_index++;
        }
    }