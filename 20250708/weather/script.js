document.getElementById('searchBtn').onclick = async () => {
    const city = document.getElementById('cityInput').value.trim();
    const API_KEY = '5fd620cd38c1a177907993ad16916df9'; // << 替換為你的 API KEY
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=zh_tw`;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("城市查無資料");

        const data = await response.json();

        // 篩選每天的中午 12:00 的預測資料
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        let html = `<h3>${data.city.name} 的 5 天預報</h3><table>`;

        dailyForecasts.forEach(item => {
            const date = new Date(item.dt_txt).toLocaleDateString("zh-TW", { weekday: "short", month: "short", day: "numeric" });
            const temp = item.main.temp;
            const desc = item.weather[0].description;
            const icon = item.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

            html += `
        <tr>
          <td>${date}</td>
          <td><img src="${iconUrl}" alt="${desc}"></td>
          <td>${desc}</td>
          <td>${temp} °C</td>
        </tr>
      `;
        });

        html += `</table>`;
        resultDiv.innerHTML = html;
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<p class="error">❌ 錯誤：${err.message}</p>`;
    }
};
