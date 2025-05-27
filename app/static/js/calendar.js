const params = new URLSearchParams(window.location.search);
const committeeKo = params.get("committee");      // 한글명
const committeeEn = params.get("committee_en");   // 영문명
const useName = params.get("use_name") === "true";

window.addEventListener('DOMContentLoaded', () => {
  if (committeeKo) {
    document.getElementById('committeeKo').textContent = committeeKo;
  }
  if (committeeEn) {
    document.getElementById('committeeEn').textContent = committeeEn;
  }
});

async function fetchSchedules(committee, year, month, useName) {
  let url = `/api/schedules/?committee=${encodeURIComponent(committee)}&year=${year}&month=${month}`;
  if (useName) url += "&use_name=true";
  const res = await fetch(url);
  return await res.json();
}

  const calendarGrid = document.getElementById("calendarGrid");
  const monthYear = document.getElementById("monthYear");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  
  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  
  async function renderCalendar(month, year) {
  
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  

    monthYear.textContent = `${year}년 ${month + 1}월`; // 연도와 월 텍스트

    const schedules = await fetchSchedules(committeeKo, year, month + 1, useName);

    calendarGrid.innerHTML = "";  // 그리드 초기화

    // 날짜별로 그룹핑
    const scheduleMap = {};
    schedules.forEach(item => {
      const day = Number(item.date.split('-')[2]);
      if (!scheduleMap[day]) scheduleMap[day] = [];
      scheduleMap[day].push(item);
    });
    
    // 요일 헤더 추가
    weekDays.forEach(day => {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = day;
      dayDiv.style.fontWeight = "bold";
      dayDiv.style.backgroundColor = "#e0e0e0";
      calendarGrid.appendChild(dayDiv);
    });
  
    // 첫 번째 날짜가 시작되는 위치를 맞추기 위해 빈 칸 추가
    for (let i = 0; i < firstDay; i++) {
      const emptyDiv = document.createElement("div");
      calendarGrid.appendChild(emptyDiv);
    }
  
    // 달력에 날짜를 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("day-cell");
  
      const dateText = document.createElement("div");
      dateText.textContent = day;
      dayDiv.appendChild(dateText);
        // 점 표시용 래퍼 생성
      const dotWrapper = document.createElement("div");
      dotWrapper.classList.add("calendar-dots");
      dayDiv.appendChild(dotWrapper);

  
      // 점 표시 함수
      function updateDots() {
        dotWrapper.innerHTML = ""; // 기존 점 제거
        if (dummySchedules[day]) {
          const types = [...new Set(dummySchedules[day].map(e => e.type))];
          document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {//체크박스마다
            if (checkbox.checked && types.includes(checkbox.id)) {//체크되어있고 타입이 지정되어 있다면
              const dot = document.createElement("div");
              dot.classList.add("calendar-dot", checkbox.id);
              dotWrapper.appendChild(dot);//calendar-dot 클래스를 가진 div 생성
            }
          });
        }
      }
  
      // 체크박스 변경 이벤트 등록 (최초 한 번만)
      if (day === 1) {//달력에 날짜를 추가할 때 첫 번째만

        document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
          checkbox.addEventListener("change", () => {//아예 checkbox에 이런 기능을 부여함,그래서 add구나!
            // 모든 날짜 셀의 점을 갱신
            document.querySelectorAll(".day-cell").forEach(cell => {
              const dayNum = cell.querySelector("div").textContent;
              const dots = cell.querySelector(".calendar-dots");
              if (dots && !isNaN(dayNum)) {
                // 각 날짜 셀의 updateDots를 호출
                // dayNum은 문자열이므로 정수로 변환
                const update = cell.updateDots;//저 밑에 dayDiv.updateDots = updateDots; 이걸 넣었기 따문에 지연스레 함수가 호출된다
                if (typeof update === "function") update();
              }
            });
          });
        });
      }
  
      // 각 셀에 updateDots 함수 연결
      dayDiv.updateDots = updateDots;//js에 이런 문법이 있구나;;;
      updateDots();
  
      // 날짜 클릭 시 일정 표시 및 배경색 변화 (기존 코드 유지)
      dayDiv.addEventListener("click", () => {
        const dateString = `${year}년 ${month + 1}월 ${day}일`;
        document.getElementById("selectedDate").textContent = dateString;
  
        const scheduleList = document.getElementById("scheduleList");
        scheduleList.innerHTML = "";
  
        const agendaDetail = document.getElementById("agendaDetail");
        agendaDetail.textContent = "일정을 선택하면 이곳에 상세 내용이 표시됩니다.";
  
        // 이전에 선택된 날짜 셀에서 선택된 클래스 제거
        const previouslySelected = document.querySelector(".selected");
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }
  
        // 선택된 날짜 셀에 클래스 추가
        dayDiv.classList.add("selected");
  
        if (scheduleMap[day]) {
          scheduleMap[day].forEach(item => {
            const card = document.createElement("div");
            card.classList.add("schedule-card", item.type); // 색상에 따라 클래스 추가
  
            // 일정 카드 내용 추가
            card.innerHTML = `
              <h3>${item.title}</h3>
              <div class="time">${item.time || '시간 미정'}</div>
            `;
            // 일정 클릭 시 안건 상세 내용 표시
            card.addEventListener("click", () => {
              agendaDetail.innerHTML = `${item.agenda}`;
            });
  
            scheduleList.appendChild(card);
          });
        } else {
          const noScheduleCard = document.createElement("div");
          noScheduleCard.classList.add("no-schedule-card");
          noScheduleCard.textContent = "해당 날짜에는 일정이 없습니다"; // 일정이 없을 때 메시지
          scheduleList.appendChild(noScheduleCard);
        }
      });
  
      calendarGrid.appendChild(dayDiv);
    }
  }
  
  // 이전 월, 다음 월 버튼 클릭 시 달력 이동
  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });
  
  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });
  
  // 페이지 로드 시 초기 달력 렌더링
  renderCalendar(currentMonth, currentYear);
