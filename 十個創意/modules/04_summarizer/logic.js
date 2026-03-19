// Module 04: Self-Study Summarizer
async function startAIAnalysis() {
    const urlInput = document.getElementById('sum-url');
    const url = urlInput.value.trim();
    const resContainer = document.getElementById('sum-results');

    if (!url) {
        alert("請輸入要分析的網址");
        return;
    }

    resContainer.style.display = 'block';
    resContainer.innerHTML = `
        <div style="padding:15px; background:rgba(255,255,255,0.05); border-radius:10px; border:1px dashed var(--accent);">
            <div class="loading-spinner" style="display:inline-block; width:15px; height:15px; border:2px solid var(--accent); border-top-color:transparent; border-radius:50%; animation: spin 1s linear infinite; margin-right:10px;"></div>
            AI 正在深度解析網頁內容，請稍候...
        </div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;

    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.status === 'success') {
            resContainer.innerHTML = `
                <div class="result-card" style="animation: fadeIn 0.5s ease-out;">
                    <h4 style="color:var(--accent); margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; font-size:1.1rem;">深度分析報告</h4>
                    
                    <div style="margin-bottom:18px;">
                        <div style="font-weight:700; color:var(--text-main); font-size:1rem; margin-bottom:5px;">📌 標題概覽</div>
                        <div style="font-size:0.95rem; color:var(--text-main); line-height:1.5; opacity:0.9;">${data.title}</div>
                    </div>

                    <div style="margin-bottom:18px;">
                        <div style="font-weight:700; color:var(--text-main); font-size:1rem; margin-bottom:8px;">🏷️ 核心關鍵字</div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            ${data.keywords.map(k => `<span style="background:var(--primary); color:#fff; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:600;">#${k}</span>`).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 5px;">
                        <div style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom:8px;">💡 核心重點</div>
                        <ul style="font-size: 0.95rem; color: var(--text-main); line-height: 1.7; padding-left: 20px; opacity:0.95;">
                            ${data.key_points.map(p => `<li style="margin-bottom:10px; text-align:justify;">${p}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <style>@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }</style>
            `;
        } else {
            resContainer.innerHTML = `<div style="color:var(--danger); padding:10px;">分析失敗：${data.message}</div>`;
        }
    } catch (e) {
        resContainer.innerHTML = `<div style="color:var(--danger); padding:10px;">連線失敗：請確保後端服務已啟動</div>`;
    }
}
