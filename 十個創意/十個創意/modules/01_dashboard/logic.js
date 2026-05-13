// Module 01: Dashboard & System Logic
async function fetchProWeather() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.03&longitude=121.56&current_weather=true');
        const data = await res.json();
        document.getElementById('weather-info').innerHTML = `台北氣溫：${data.current_weather.temperature}°C | 系統：高度運作`;
    } catch (e) { }
}
fetchProWeather();

async function checkBackendStatus() {
    const statusDot = document.getElementById('backend-status-dot');
    const statusText = document.getElementById('backend-status-text');
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.status === 'online') {
            statusDot.style.background = 'var(--accent)';
            statusText.textContent = '系統分析引擎：運作中 (v4.0)';
        }
    } catch (e) {
        statusDot.style.background = 'var(--danger)';
        statusText.textContent = '系統分析引擎：離線 (請啟動 app.py)';
    }
}
setInterval(checkBackendStatus, 10000);
checkBackendStatus();

async function fetchChangelog() {
    try {
        const res = await fetch('/api/changelog');
        const logs = await res.json();
        const container = document.getElementById('changelog-list');
        if (logs.length > 0) {
            const displayLogs = logs.slice(0, 5);
            container.innerHTML = displayLogs.map(log => `
                <div style="margin-bottom: 5px;">
                    <span style="color: var(--accent); font-weight: 600;">[${log.date}]</span> 
                    <span style="color: var(--text-main);">${log.msg}</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div style="color: var(--text-dim);">暫無變更記錄</div>';
        }
    } catch (e) { }
}
fetchChangelog();

async function startWorkMode() {
    const btn = document.getElementById('work-btn');
    const originalText = btn.textContent;

    // 獲取勾選的網址
    const checkboxes = document.querySelectorAll('input[name="work-target"]:checked');
    const selectedUrls = Array.from(checkboxes).map(cb => cb.value);

    if (selectedUrls.length === 0) {
        alert("請至少選擇一個啟動項目");
        return;
    }

    btn.disabled = true;
    btn.textContent = '🔄 正在啟動工作中...';

    try {
        const res = await fetch('/api/start_work', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: selectedUrls })
        });
        const data = await res.json();
        if (data.status === 'success') {
            btn.textContent = '✅ 工作環境已就緒';
            btn.style.background = 'var(--accent)';
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                btn.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
                fetchChangelog();
            }, 3000);
        }
    } catch (e) {
        btn.textContent = '❌ 啟動失敗';
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = originalText;
        }, 3000);
    }
}

function handleThemeSwitch(hour) {
    const body = document.body;
    const symbol = document.getElementById('time-symbol');
    let themeClass = 'theme-night';
    let themeSymbol = '🌙';

    if (hour >= 6 && hour < 12) {
        themeClass = 'theme-morning';
        themeSymbol = '☀️';
    } else if (hour >= 12 && hour < 18) {
        themeClass = 'theme-afternoon';
        themeSymbol = '⛅';
    } else {
        themeClass = 'theme-night';
        themeSymbol = '🌙';
    }

    if (!body.classList.contains(themeClass)) {
        body.classList.remove('theme-morning', 'theme-afternoon', 'theme-night');
        body.classList.add(themeClass);
        symbol.textContent = themeSymbol;
    }
}

function updateClock() {
    const now = new Date();
    const hour = now.getHours();
    handleThemeSwitch(hour);

    document.getElementById('time').innerHTML = `<span id="time-symbol" style="margin-right:10px; opacity:0.8;">${document.getElementById('time-symbol').textContent}</span>${now.toLocaleTimeString('zh-TW', { hour12: false })}`;
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('date').textContent = now.toLocaleDateString('zh-TW', options);
}
setInterval(updateClock, 1000);
updateClock();
