// Module 06: Local Desktop Semantic Search
async function runSemanticSearch() {
    const queryInput = document.getElementById('search-query');
    const query = queryInput.value.trim();
    const resContainer = document.getElementById('search-results');

    if (!query) {
        alert("請輸入搜尋關鍵字");
        return;
    }

    resContainer.style.display = 'block';
    resContainer.innerHTML = `<div style="padding:10px; font-size:0.85rem; color:var(--text-dim);">🔍 正在桌面進行深度遍歷搜尋中...</div>`;

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (data.status === 'success' && data.results.length > 0) {
            resContainer.innerHTML = data.results.map(f => `
                <div class="result-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-weight:700; color:var(--accent); font-size:1rem;">📄 ${f.filename}</span>
                        <span style="font-size:0.8rem; background:var(--primary); padding:3px 10px; border-radius:6px; color:#fff; font-weight:600;">${f.score}% 一致</span>
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-main); margin-top:8px; line-height:1.4; word-break:break-all; background:var(--glass); padding:8px; border-radius:6px; border:1px solid var(--glass-border);">
                        <strong style="color:var(--accent)">路徑:</strong> ${f.path}
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-main); margin-top:8px; font-weight:500; display:flex; align-items:center; gap:5px; opacity:0.9;">
                        <span>✨ AI 判定:</span> ${f.reason}
                    </div>
                </div>
            `).join('');
        } else if (data.results && data.results.length === 0) {
            resContainer.innerHTML = `<div style="padding:10px; font-size:0.85rem; color:var(--text-dim);">無法在桌面找到與「${query}」相關的檔案。</div>`;
        } else {
            resContainer.innerHTML = `<div style="color:var(--danger); padding:10px;">搜尋失敗：${data.message}</div>`;
        }
    } catch (e) {
        resContainer.innerHTML = `<div style="color:var(--danger); padding:10px;">搜尋出錯，請檢查服務是否正常啟動。</div>`;
    }
}
