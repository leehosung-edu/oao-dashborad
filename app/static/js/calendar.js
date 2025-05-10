const dummySchedules = {
    5: [
      { time: "10:00", title: "전체회의", type: "General", agenda: "형사소송법 일부개정법률안" },
      { time: "12:30", title: "법안심사제1소위원회", type: "Small", agenda: "검사징계법 일부개정법률안" }
    ],
    15: [
      { time: "17:00", title: "전체회의", type: "General", agenda: "도시 및 주거환경정비법 일부개정법률안" }
    ],
    25: [
      { time: "12:00", title: "청문회", type: "Hearing", agenda: "국무위원후보자 인사청문요청안" }
    ]
  };
  
  const calendarGrid = document.getElementById("calendarGrid");
  const monthYear = document.getElementById("monthYear");
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  
  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  
  function renderCalendar(month, year) {
    calendarGrid.innerHTML = "";  // 그리드 초기화
  
    const firstDay = new Date(year, month, 1).getDay();  // 해당 월의 첫 번째 날짜의 요일
    const daysInMonth = new Date(year, month + 1, 0).getDate();  // 해당 월의 일수
  
    monthYear.textContent = `${year}년 ${month + 1}월`; // 연도와 월 텍스트
  
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
  
      // 일정이 있을 경우 점 표시
      if (dummySchedules[day]) {
        const types = [...new Set(dummySchedules[day].map(e => e.type))];
        const dotWrapper = document.createElement("div");
        dotWrapper.classList.add("calendar-dots");
  
        types.forEach(type => {
          const dot = document.createElement("div");
          dot.classList.add("calendar-dot", type);  // 색상 추가
          dotWrapper.appendChild(dot);
        });
  
        dayDiv.appendChild(dotWrapper);
      }
  
      // 날짜 클릭 시 일정 표시 및 배경색 변화
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
  
        if (dummySchedules[day]) {
          dummySchedules[day].forEach(item => {
            const card = document.createElement("div");
            card.classList.add("schedule-card", item.type); // 색상에 따라 클래스 추가
  
            // 일정 카드 내용 추가
            card.innerHTML = `
              <h3>${item.title}</h3>
              <div class="time">${item.time || '시간 미정'}</div>
            `;
            // 일정 클릭 시 안건 상세 내용 표시
            card.addEventListener("click", () => {
              agendaDetail.textContent = `✔ ${item.agenda}`;
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
  