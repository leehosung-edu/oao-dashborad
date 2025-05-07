
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
        var newWindow = window.open("/static/html/committe_info.html", "_blank");
        newWindow.onload = function() {
            newWindow.document.title = title;
        };
    }
