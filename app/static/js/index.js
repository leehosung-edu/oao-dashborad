fetch('/static/html/Rec_Comm.html')  // header.html을 불러옴
    .then(response => response.text())  // 응답을 텍스트로 변환
    .then(data => document.getElementById('Rec_Comm').innerHTML = data)  // 내용 삽입
    .catch(error => console.error('Rec_Comm 로딩 실패:', error));  // 오류 처리

fetch('/static/html/Rec_Comm_Upper.html')  // header.html을 불러옴
    .then(response => response.text())  // 응답을 텍스트로 변환
    .then(data => document.getElementById('Rec_Comm_Upper').innerHTML = data)  // 내용 삽입
    .catch(error => console.error('Rec_Comm_Upper 로딩 실패:', error));  // 오류 처리

fetch('/static/html/Comm.html')  // header.html을 불러옴
    .then(response => response.text())  // 응답을 텍스트로 변환
    .then(data => document.getElementById('Comm').innerHTML = data)  // 내용 삽입
    .catch(error => console.error('Comm로딩 실패:', error));  // 오류 처리 
fetch('/static/html/committe_info.html')  // header.html을 불러옴
    .then(response => response.text())  // 응답을 텍스트로 변환
    .then(data => document.getElementById('committe_info').innerHTML = data)  // 내용 삽입
    .catch(error => console.error('committe_info로딩 실패:', error));  // 오류 처리
    function showPopup() {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
        console.log('popup');
    }
    function closePopup() {
        document.getElementById('popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }