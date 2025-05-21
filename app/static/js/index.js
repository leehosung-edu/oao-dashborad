function committee_goto_info(committee){
    window.location.href=`/committee?committee=${committee}`;//매게변수로 입력받은 위원회의 정보를 출력해줌
                                                             //한글 이름을 매개변수로 할 것
}                                                            //정보창 잘 만드셨더라구요. 놀랐습니다. 이리 간단히 되다니...


function committee_goto_date(){
    window.location.href=`/calendar?`;
}
const parentElement = document.querySelectorAll(".committe_baseset") // 부모 요소 선택
// console.log(parentElement);
//  console.log(childElement)       //테스트의 흔적
parentElement.forEach(element =>{
    const childElement = element.querySelector(".committe_name_ko")
    const text = childElement.textContent; // 텍스트 가져오기
    element.innerHTML+=`<span class="button_info" onclick="committee_goto_info('${text}')"><p>위원회 소개</p></span>`
    //정보 찾아오는 함수는 매개변수가 필요합니다. 마침 매개변수가 하나의 클래스를 공유하는군요!
    element.innerHTML+=`<span class="button_date" onclick="committee_goto_date()"><p>일정 보기</p></span>`}
)
//나중에 할 일 : 캘린더 연결하는 함수 변화에 맟춰 반영하기


