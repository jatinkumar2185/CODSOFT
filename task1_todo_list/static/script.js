const API = '/api/tasks';
let tasks = [];

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

async function loadTasks() {
  try {
    tasks = await fetchJson(API);
    setConnStatus(true);
    render();
  } catch (err) {
    setConnStatus(false, err.message);
  }
}

function setConnStatus(ok, message) {
  const el = document.getElementById('connStatus');
  if (ok) {
    el.textContent = '● connected to Flask API';
    el.className = 'conn ok';
  } else {
    el.textContent = `● could not reach API (${message || 'is app.py running?'})`;
    el.className = 'conn err';
  }
}

async function addTask() {
  const title = document.getElementById('title').value.trim();
  if (!title) {
    document.getElementById('title').focus();
    return;
  }
  const payload = {
    title,
    description: document.getElementById('desc').value.trim(),
    priority: document.getElementById('priority').value,
    due: document.getElementById('due').value,
  };

  try {
    await fetchJson(API, { method: 'POST', body: JSON.stringify(payload) });
    document.getElementById('title').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('due').value = '';
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  try {
    await fetchJson(`${API}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done: !task.done }),
    });
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteTask(id) {
  try {
    await fetchJson(`${API}/${id}`, { method: 'DELETE' });
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function clearCompleted() {
  try {
    await fetchJson(`${API}/clear-completed`, { method: 'POST' });
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

function isOverdue(t) {
  if (t.done || !t.due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(t.due) < today;
}

function priorityRank(p) {
  return { High: 0, Medium: 1, Low: 2 }[p] ?? 3;
}

function render() {
  const search = document.getElementById('search').value.trim().toLowerCase();
  const statusFilter = document.getElementById('filterStatus').value;
  const sortBy = document.getElementById('sortBy').value;

  let visible = tasks.filter(t => {
    const matchesSearch = !search
      || t.title.toLowerCase().includes(search)
      || (t.description || '').toLowerCase().includes(search);
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = !t.done;
    else if (statusFilter === 'done') matchesStatus = t.done;
    else if (statusFilter === 'overdue') matchesStatus = isOverdue(t);
    return matchesSearch && matchesStatus;
  });

  visible = visible.slice().sort((a, b) => {
    if (sortBy === 'due') return (a.due || '9999') > (b.due || '9999') ? 1 : -1;
    if (sortBy === 'priority') return priorityRank(a.priority) - priorityRank(b.priority);
    return (b.id) - (a.id);
  });

  const list = document.getElementById('taskList');
  list.innerHTML = '';
  document.getElementById('emptyState').style.display = visible.length ? 'none' : 'block';

  visible.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task' + (t.done ? ' done' : '') + (isOverdue(t) ? ' overdue' : '');
    li.innerHTML = `
      <div class="check ${t.done ? 'checked' : ''}" onclick="toggleDone(${t.id})">${t.done ? '✓' : ''}</div>
      <div class="task-main">
        <div class="task-title">${escapeHtml(t.title)}</div>
        ${t.description ? `<div class="task-desc">${escapeHtml(t.description)}</div>` : ''}
        <div class="meta">
          <span class="badge ${t.priority.toLowerCase()}">${t.priority}</span>
          ${t.due ? `<span class="badge${isOverdue(t) ? ' overdue' : ''}">${isOverdue(t) ? 'Overdue · ' : 'Due '}${t.due}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" title="Delete" onclick="deleteTask(${t.id})">✕</button>
      </div>
    `;
    list.appendChild(li);
  });

  renderStats();
}

function renderStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const overdue = tasks.filter(isOverdue).length;
  const pending = total - done;
  document.getElementById('stats').innerHTML = total ? `
    <div class="stat"><div class="n">${total}</div><div class="l">TOTAL</div></div>
    <div class="stat"><div class="n">${pending}</div><div class="l">PENDING</div></div>
    <div class="stat done"><div class="n">${done}</div><div class="l">DONE</div></div>
    <div class="stat overdue"><div class="n">${overdue}</div><div class="l">OVERDUE</div></div>
  ` : '';
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function buildGutter() {
  const gutter = document.getElementById('gutter');
  for (let i = 1; i <= 28; i++) {
    const d = document.createElement('div');
    d.textContent = i;
    gutter.appendChild(d);
  }
}

buildGutter();
loadTasks();
