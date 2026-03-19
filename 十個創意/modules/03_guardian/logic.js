// Module 03: PC Health Guardian & Advanced Analytics
function formatSpeed(bytes) {
    if (bytes < 1024) return bytes + " B/s";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB/s";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB/s";
}

function updateGauge(id, val) {
    const fill = document.getElementById(id + '-fill');
    const display = document.getElementById(id + '-val');
    if (!fill || !display) return;

    fill.style.width = val + "%";
    display.textContent = val + "%";

    // Threshold logic
    fill.classList.remove('warning', 'danger');
    if (val > 90) fill.classList.add('danger');
    else if (val > 70) fill.classList.add('warning');
}

async function updateRealSystemMetrics() {
    try {
        const res = await fetch('/api/system_info');
        const data = await res.json();

        updateGauge('cpu', data.cpu);
        updateGauge('ram', data.ram);
        updateGauge('disk', data.disk);

        // Network Activity
        document.getElementById('net-up').textContent = formatSpeed(data.net_up);
        document.getElementById('net-down').textContent = formatSpeed(data.net_down);

        const procList = document.getElementById('process-list');
        if (procList && data.top_processes) {
            procList.innerHTML = data.top_processes.map(p => `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:4px 0; border-bottom:1px solid var(--glass-border);">
                    <span style="font-weight:600; font-size:0.85rem; color:var(--text-main);">${p.name.substring(0, 18)}</span>
                    <div style="display:flex; gap:10px; font-size:0.75rem;">
                        <span style="color:${p.cpu > 20 ? 'var(--danger)' : 'var(--primary-light)'}">${p.cpu}% CPU</span>
                        <span style="color:${p.mem > 5 ? 'var(--danger)' : 'var(--accent)'}">${p.mem}% MEM</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.log("無法獲取系統數據，監控連結中...");
    }
}
setInterval(updateRealSystemMetrics, 2000); // Faster update for network responsiveness
updateRealSystemMetrics();
