// Module 02: Meeting Note Transcriber
let recognition;
let isTranscribing = false;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-TW';

    recognition.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
        }
        document.getElementById('trans-status').textContent = "正在聽取：" + text;
        window.currentTranscript = text;
    };
}

function handleTranscription() {
    const btn = document.getElementById('trans-btn');
    if (isTranscribing) {
        recognition.stop();
        btn.textContent = "開始語音錄製";
        saveTranscriptDirectly(window.currentTranscript);
    } else {
        recognition.start();
        btn.textContent = "停止並存檔";
        document.getElementById('trans-status').textContent = "系統已就緒，請說話...";
    }
    isTranscribing = !isTranscribing;
}

async function saveTranscriptDirectly(text) {
    if (!text) return;
    try {
        await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: text,
                type: 'transcript',
                filename: `Trans_${Date.now()}.txt`
            })
        });
        alert("逐字稿已直接存入 /Transcripts");
        renderTransHistory();
    } catch (e) {
        alert("儲存失敗");
    }
}

function renderTransHistory() {
    const box = document.getElementById('trans-history-box');
    const history = JSON.parse(localStorage.getItem('pro_trans_history') || '[]');
    box.innerHTML = history.map(h => `
        <div class="history-item"><time>${h.time}</time><p>${h.text}</p></div>
    `).join('');
}
renderTransHistory();
