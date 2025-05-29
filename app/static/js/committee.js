let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const committeeName = params.get('committee');

  const titleElement = document.getElementById('committee-title');
  const nameElement = document.getElementById('committee-name');
  const container = document.getElementById('card-container');

  titleElement.textContent = committeeName;

  const encodedCommittee = encodeURIComponent(committeeName);
  const apiUrl = `/api/committee-data?committee=${encodedCommittee}`;

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
          document.getElementById("popup-gender").textContent = gender;
          document.getElementById("popup-birth").textContent = birth;
          document.getElementById("popup-aides").textContent = aides;
          document.getElementById("popup-secretaries").textContent = secretaries;
          document.getElementById("popup-secretaries-assistants").textContent = secretariesAssistants;
          document.getElementById("popup-office").textContent = office;

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
