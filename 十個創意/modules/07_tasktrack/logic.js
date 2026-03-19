// Module 07: TaskTrack Pro
function addNewTask() {
    const input = document.getElementById('task-in');
    if (!input.value) return;
    const tasks = JSON.parse(localStorage.getItem('pro_tasks') || '[]');
    tasks.push({ text: input.value, done: false });
    localStorage.setItem('pro_tasks', JSON.stringify(tasks));
    input.value = '';
    renderProTasks();
}

function renderProTasks() {
    const box = document.getElementById('task-list-box');
    const tasks = JSON.parse(localStorage.getItem('pro_tasks') || '[]');
    box.innerHTML = tasks.map((t, idx) => `
        <div class="task-item" style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:8px;">
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <input type="checkbox" ${t.done ? 'checked' : ''} onclick="toggleProTask(${idx})" style="cursor:pointer;">
                <span style="${t.done ? 'text-decoration:line-through; color:var(--text-dim);' : 'color:var(--text-main);'} font-size:0.9rem;">${t.text}</span>
            </div>
            <button onclick="deleteProTask(${idx})" style="background:none; border:none; color:var(--danger); cursor:pointer; opacity:0.6; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">🗑️</button>
        </div>
    `).join('');
}

function toggleProTask(idx) {
    const tasks = JSON.parse(localStorage.getItem('pro_tasks') || '[]');
    tasks[idx].done = !tasks[idx].done;
    localStorage.setItem('pro_tasks', JSON.stringify(tasks));
    renderProTasks();
}

function deleteProTask(idx) {
    const tasks = JSON.parse(localStorage.getItem('pro_tasks') || '[]');
    tasks.splice(idx, 1);
    localStorage.setItem('pro_tasks', JSON.stringify(tasks));
    renderProTasks();
}
renderProTasks();
