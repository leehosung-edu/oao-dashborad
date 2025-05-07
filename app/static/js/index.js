
    function showPopup() {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
        console.log('popup');
    }
    function closePopup() {
        document.getElementById('popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }
    
    function click_committe_info(title) {
        const cachelees_url="/static/html/committe_info.html"+"?nocache"+ new Date().getTime()//캐시를 무시하는 코드, 개선 필요
        var newWindow = window.open(cachelees_url,"_blank");
        newWindow.onload = function() {
            newWindow.document.title = title;
        };
    }
