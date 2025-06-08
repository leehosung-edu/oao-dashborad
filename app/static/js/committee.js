let chartInstance = null;

// 학교 및 경력 키워드 정의
const SCHOOL_KEYWORDS = [
  "초등학교", "중학교", "고등학교", "대학교", "대학", "대학원",
  "졸업", "입학", "수료", "박사", "석사", "학사",
  "교수", "명예교수", "강사", "교사", "연구교수", "조교수", "부교수"
];
const CAREER_KEYWORDS = [
  "국회의원", "위원장", "위원", "간사", "부의장", "의장", "대표", "고문",
  "사장", "본부장", "실장", "원장", "이사장", "비서관", "행정관", "연구원",
  "센터장", "회장", "부회장", "대통령", "장관", "시장", "구청장"
];

// 키워드 탐지 함수
function containsKeyword(line, keywords) {
  return keywords.some(kw => line.includes(kw));
}

// BRF_HST 필드 학교-민간/국회 경력 정보 파싱
function parseSchoolAndCareer(brfHst) {
  if (!brfHst) return { school: "학교 관련 경력이 없습니다.", career: "민간 및 국회 관련 경력이 없습니다." };

  // 줄바꿈 및 공백 정리
  const lines = brfHst.replace(/\r\n|\r/g, "\n").split("\n").map(l => l.trim()).filter(Boolean);

  const schoolArr = [];
  const careerArr = [];

  for (let line of lines) {
    // 구분 헤더 무시
    if (/^\s*(\[?학력\]?|□\s*학력|■\s*학력|<학력>|-+\s*학력|^\s*학력\s*$)/.test(line)) continue;
    if (/^\s*(\[?경력\]?|□\s*경력|■\s*경력|<경력>|-+\s*경력|^\s*경력\s*$|주요경력|약력|주요 약력)/.test(line)) continue;
    if (!line.replace(/[-–—•·\s]/g, "")) continue; // 구분선 등

    const isSchool = containsKeyword(line, SCHOOL_KEYWORDS);
    const isCareer = containsKeyword(line, CAREER_KEYWORDS);

    // 학교 관련 키워드가 있으면 우선 학교로 분류
    if (isSchool && !isCareer) {
      schoolArr.push(line);
    } else if (isCareer) {
      careerArr.push(line);
    } else if (isSchool) {
      // 학교 키워드가 있으면 학교에 우선
      schoolArr.push(line);
    } else {
      // 키워드 없으면 일단 경력에 포함
      careerArr.push(line);
    }
  }

  return {
    school: schoolArr.length ? schoolArr.join("\n") : "학교 관련 경력이 없습니다.",
    career: careerArr.length ? careerArr.join("\n") : "민간 및 국회 관련 경력이 없습니다."
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const committeeName = params.get('committee');
  const memberName = params.get('member');

  const titleElement = document.getElementById('committee-title');
  const nameElement = document.getElementById('committee-name');
  const container = document.getElementById('card-container');

  titleElement.textContent = committeeName;

  const encodedCommittee = encodeURIComponent(committeeName);
  const encodedMember = encodeURIComponent(memberName);
  const apiUrl = `/api/committee-data?committee=${encodedCommittee}`;
  const apiCareerUrl = `/api/committee-career?memberName=${encodedMember}&committee=${encodedCommittee}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error("API 호출 실패");
      return response.text();
    })
    .then(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      const rows = Array.from(xmlDoc.getElementsByTagName("row"));

      if (rows.length === 0) {
        nameElement.innerHTML = "<p>해당 위원회의 위원 정보를 찾을 수 없습니다.</p>";
        return;
      }

      // 역할 우선순위 정렬
      rows.sort((a, b) => {
        const getPriority = role => {
          if (role.includes("위원장")) return 0;
          if (role.includes("간사")) return 1;
          return 2;
        };
        const roleA = a.getElementsByTagName("JOB_RES_NM")[0]?.textContent || "";
        const roleB = b.getElementsByTagName("JOB_RES_NM")[0]?.textContent || "";
        return getPriority(roleA) - getPriority(roleB);
      });

      // 정당별 인원 집계
      const partyCounts = {};
      rows.forEach(row => {
        const party = row.getElementsByTagName("POLY_NM")[0]?.textContent || "무소속";
        partyCounts[party] = (partyCounts[party] || 0) + 1;
      });

      const total = rows.length;
      const sortedParties = Object.entries(partyCounts)
        .map(([party, count]) => ({ party, count, percent: (count / total * 100).toFixed(1) }))
        .sort((a, b) => b.percent - a.percent);

      // 요약 테이블 출력
      let summaryHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #ccc;">
              <th align="left">정당</th>
              <th align="center">의석수</th>
              <th align="right">비율</th>
            </tr>
          </thead>
          <tbody>
      `;
      for (const { party, count, percent } of sortedParties) {
        summaryHTML += `
          <tr style="border-bottom: 1px solid #eee;">
            <td>${party}</td>
            <td align="center">${count}</td>
            <td align="right">${percent}%</td>
          </tr>`;
      }
      summaryHTML += `</tbody></table>`;
      document.getElementById('party-summary').innerHTML = summaryHTML;

      // 도넛 차트 출력
      const ctx = document.getElementById('party-chart').getContext('2d');
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: sortedParties.map(p => p.party),
          datasets: [{
            data: sortedParties.map(p => p.percent),
            backgroundColor: ['#1e90ff', '#ff6347', '#2ecc71', '#f39c12', '#9b59b6', '#95a5a6'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.raw}%`
              }
            }
          }
        }
      });

      // 카드 출력
      container.innerHTML = "";
      for (const row of rows) {
        const role = row.getElementsByTagName("JOB_RES_NM")[0]?.textContent || "구성 없음";
        const name = row.getElementsByTagName("HG_NM")[0]?.textContent || "이름 없음";
        const party = row.getElementsByTagName("POLY_NM")[0]?.textContent || "정당 없음";
        const district = row.getElementsByTagName("ORIG_NM")[0]?.textContent || "지역구 없음";

        const roleClass = role.includes("위원장") ? "role-chair" :
                          role.includes("간사") ? "role-secretary" : "role-member";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div class="top-row">
            <span class="role ${roleClass}">${role}</span>
            <span class="party">${party}</span>
          </div>
          <h3 class="name">${name}</h3>
          <p class="district">${district}</p>
        `;

        const email = row.getElementsByTagName("ASSEM_EMAIL")[0]?.textContent || "-";
        const phone = row.getElementsByTagName("ASSEM_TEL")[0]?.textContent || "-";
        const gender = row.getElementsByTagName("NAAS_NM")[0]?.textContent || "-";
        const birth = row.getElementsByTagName("BIRTH_DT")[0]?.textContent || "-";
        const aides = row.getElementsByTagName("STAFF")[0]?.textContent || "-";
        const secretaries = row.getElementsByTagName("SECRETARY")[0]?.textContent || "-";
        const secretariesAssistants = row.getElementsByTagName("SECRETARY2")[0]?.textContent || "-";
        const office = row.getElementsByTagName("ROOM_NO")[0]?.textContent || "-";
        
        // 팝업 열기
        card.addEventListener("click", () => {
          document.getElementById("popup-email").textContent = email;
          document.getElementById("popup-phone").textContent = phone;
          document.getElementById("popup-name").textContent = name;
       // document.getElementById("popup-gender").textContent = gender;
       // document.getElementById("popup-birth").textContent = birth;
          document.getElementById("popup-aides").textContent = aides;
          document.getElementById("popup-secretaries").textContent = secretaries;
          document.getElementById("popup-secretaries-assistants").textContent = secretariesAssistants;
          document.getElementById("popup-office").textContent = office;

          // 학교 및 경력 정보 카드에 출력
          fetch(`/api/committee-career?memberName=${encodeURIComponent(name)}&committee=${encodeURIComponent(committeeName)}`)
            .then(response => {
              if (!response.ok) throw new Error("API 호출 실패");
              return response.json();
            })
            .then(data => {
              const row = data.ALLNAMEMBER?.[1]?.row?.[0];
              let school, career;
              if (row && row.BRF_HST) {
                const parsed = parseSchoolAndCareer(row.BRF_HST);
                school = parsed.school;
                career = parsed.career;
              }
              document.getElementById("popup-school").innerHTML = school.replace(/\n/g, "<br>");
              document.getElementById("popup-congress").innerHTML = career.replace(/\n/g, "<br>");
            });

          // 팝업 탭 초기화
          document.querySelectorAll('.popup-tab').forEach(btn => btn.classList.remove('active'));
          document.querySelector('[data-tab="data"]').classList.add('active');
          document.querySelectorAll('.popup-tab-content').forEach(tab => tab.classList.add('hidden'));
          document.getElementById("tab-data").classList.remove("hidden");
          
          document.getElementById("popup-overlay").classList.remove("hidden");
        });

        container.appendChild(card);
      }

      document.getElementById("popup-close").addEventListener("click", () => {
        document.getElementById("popup-overlay").classList.add("hidden");
      });
    })
    .catch(err => {
      nameElement.innerHTML = `<p>오류: ${err.message}</p>`;
    });
  
  // 탭 전환
  document.querySelectorAll('.popup-tab').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;

      document.querySelectorAll('.popup-tab').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      document.querySelectorAll('.popup-tab-content').forEach(tab => tab.classList.add('hidden'));
      document.getElementById(`tab-${target}`).classList.remove('hidden');
    });
  });
});