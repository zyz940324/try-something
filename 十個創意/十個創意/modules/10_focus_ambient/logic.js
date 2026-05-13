// Module 10: FocusAmbient
const ambientAudio = new Audio();
let currentType = ''; // 'rain', 'forest'
let currentTrackIdx = -1; // 0, 1, 2

const proPlaylist = [
    { name: 'Lofi Focus 🎧', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { name: 'Deep Piano 🎹', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { name: 'Creative Flow ✨', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

const ambientMap = {
    'rain': { name: '深山大雨 🌧️', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    'forest': { name: '晨間森林 🌲', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
};

function updateAmbientStatus(msg, isPlaying = true) {
    const status = document.getElementById('ambient-status');
    status.textContent = isPlaying ? `🎶 正在播放：${msg}` : `⏹️ ${msg}`;
    status.style.color = isPlaying ? 'var(--accent)' : 'var(--text-dim)';
}

function playProMusic(idx) {
    if (currentTrackIdx === idx) {
        ambientAudio.pause();
        currentTrackIdx = -1;
        updateAmbientStatus('音樂已暫停', false);
    } else {
        ambientAudio.src = proPlaylist[idx].url;
        ambientAudio.loop = true;
        ambientAudio.play();
        currentTrackIdx = idx;
        currentType = ''; // Reset ambient type
        updateAmbientStatus(proPlaylist[idx].name);
    }
}

function playAmbient(type) {
    if (currentType === type) {
        ambientAudio.pause();
        currentType = '';
        updateAmbientStatus('音效已暫停', false);
    } else {
        ambientAudio.src = ambientMap[type].url;
        ambientAudio.loop = true;
        ambientAudio.play();
        currentType = type;
        currentTrackIdx = -1; // Reset music track
        updateAmbientStatus(ambientMap[type].name);
    }
}

// Startup Initialization Simulation
setTimeout(() => {
    const status = document.getElementById('ambient-status');
    status.textContent = '🔄 正在同步專注音軌資料庫...';
    setTimeout(() => {
        status.textContent = '🎶 系統音樂已就緒 (3首候選)';
    }, 1500);
}, 500);
