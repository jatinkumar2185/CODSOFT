let currentOp = '+';

function opSymbol(op) {
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op];
}

function setOp(op, btn) {
  currentOp = op;
  document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateExpr();
}

function updateExpr() {
  const a = document.getElementById('num1').value || '0';
  const b = document.getElementById('num2').value || '0';
  document.getElementById('expr').textContent = `${a} ${opSymbol(currentOp)} ${b}`;
}

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

async function calculate() {
  const errEl = document.getElementById('error');
  errEl.textContent = '';

  const aRaw = document.getElementById('num1').value;
  const bRaw = document.getElementById('num2').value;

  if (aRaw.trim() === '' || bRaw.trim() === '') {
    errEl.textContent = 'Please enter both numbers.';
    return;
  }

  const goBtn = document.getElementById('goBtn');
  goBtn.disabled = true;

  try {
    const data = await fetchJson('/api/calculate', {
      method: 'POST',
      body: JSON.stringify({ a: aRaw, b: bRaw, op: currentOp }),
    });
    document.getElementById('result').textContent = `= ${data.result}`;
    setConnStatus(true);
    await loadHistory();
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    goBtn.disabled = false;
  }
}

async function loadHistory() {
  try {
    const items = await fetchJson('/api/history');
    setConnStatus(true);
    renderHistory(items);
  } catch (err) {
    setConnStatus(false, err.message);
  }
}

function renderHistory(items) {
  const el = document.getElementById('historyList');
  if (!items.length) {
    el.innerHTML = '<div class="history-empty">No calculations yet.</div>';
    return;
  }
  el.innerHTML = items
    .map(h => `<div class="history-item"><span>${h.a} ${opSymbol(h.op)} ${h.b} = ${h.result}</span></div>`)
    .join('');
}

async function clearHistory() {
  try {
    await fetchJson('/api/history', { method: 'DELETE' });
    await loadHistory();
  } catch (err) {
    alert(err.message);
  }
}

function clearAll() {
  document.getElementById('num1').value = '';
  document.getElementById('num2').value = '';
  document.getElementById('result').textContent = '= 0';
  document.getElementById('error').textContent = '';
  updateExpr();
}

loadHistory();
