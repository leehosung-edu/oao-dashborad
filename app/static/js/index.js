
const parentElement = document.querySelectorAll(".committe_baseset") // 부모 요소 선택

parentElement.forEach(element => {
    const koEl = element.querySelector(".committe_name_ko");
    const enEl = element.querySelector(".committe_name_en");
    const koName = koEl.textContent.replace(/\s+/g, ' ').trim();
    const enName = enEl.textContent.replace(/\s+/g, ' ').trim();

    element.innerHTML += `<span class="button_info" onclick="committee_goto_info('${koName}')"><p class="button_text">위원회 소개</p></span>`;
    element.innerHTML += `<span class="button_date" onclick="committee_goto_date('${koName}','${enName}')"><p class="button_text">일정 보기</p></span>`;
});

function committee_goto_info(koName){
    window.location.href=`/committee?committee=${koName}`;
}                                                            

function committee_goto_date(koName, enName){
    window.location.href = `/calendar?committee=${encodeURIComponent(koName)}&committee_en=${encodeURIComponent(enName)}&use_name=true`;
}
console.log("현재 메인 페이지 외에도 위원회 통합 켈린더 네비게이터를 통해 추가 켈린더를 볼 수 있습니다, 두 켈린더의 차이는 없습니다. 둘 중 무슨 기능이 쓸모없을까요?")