let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const committeeName = params.get('committee');//committee?committee=위원회 <- 이러면 원하는 위원회로
                                                //발빠르게 이동 가능

  const titleElement = document.getElementById('committee-title');
  const nameElement = document.getElementById('committee-name');
  const container = document.getElementById('card-container');

  /* if (!committeeName) {
    titleElement.textContent = "위원회를 지정해주세요.";
    return;
  } */

  titleElement.textContent = committeeName;

  const apiKey = "4fe9bc19cebe4adcb232914ba158d7e2";
  const encodedCommittee = encodeURIComponent(committeeName);
  const apiUrl = `https://open.assembly.go.kr/portal/openapi/nktulghcadyhmiqxi?KEY=${apiKey}&Type=xml&DEPT_NM=${encodedCommittee}`;

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

      // 역할 우선순위 정렬 (위원장 → 간사 → 위원)
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

      // 정당 요약표 출력
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

      // 차트 출력
      const ctx = document.getElementById('party-chart').getContext('2d');
      if (chartInstance) {
        chartInstance.destroy();
      }
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

      // 위원 카드 출력
      //nameElement.innerHTML = `<h2>위원 (${rows.length}명)</h2>`;
      container.innerHTML = ""; // 기존 내용 초기화
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

				// 클릭 시 팝업 표시
				card.addEventListener("click", () => {
  			document.getElementById("popup-email").textContent = email;
  			document.getElementById("popup-phone").textContent = phone;
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
});