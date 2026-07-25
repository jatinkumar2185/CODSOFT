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

function onLengthChange() {
  document.getElementById('lengthVal').textContent = document.getElementById('length').value;
}

async function generatePassword() {
  const errEl = document.getElementById('error');
  errEl.textContent = '';

  const payload = {
    length: parseInt(document.getElementById('length').value, 10),
    upper: document.getElementById('upper').checked,
    lower: document.getElementById('lower').checked,
    digits: document.getElementById('digits').checked,
    symbols: document.getElementById('symbols').checked,
  };

  const btn = document.querySelector('.generate');
  btn.disabled = true;

  try {
    const data = await fetchJson('/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    document.getElementById('passwordOut').textContent = data.password;
    updateStrength(data.strength);
    setConnStatus(true);
  } catch (err) {
    errEl.textContent = err.message;
    setConnStatus(false, err.message);
  } finally {
    btn.disabled = false;
  }
}

function updateStrength(strength) {
  const bars = [document.getElementById('bar1'), document.getElementById('bar2'), document.getElementById('bar3')];
  bars.forEach(b => b.className = 'bar');
  const label = document.getElementById('strengthLabel');

  if (strength === 'weak') {
    bars[0].classList.add('on', 'weak');
    label.textContent = 'Strength: Weak';
  } else if (strength === 'okay') {
    bars[0].classList.add('on', 'okay');
    bars[1].classList.add('on', 'okay');
    label.textContent = 'Strength: Okay';
  } else {
    bars.forEach(b => b.classList.add('on', 'strong'));
    label.textContent = 'Strength: Strong';
  }
}

function copyPassword() {
  const text = document.getElementById('passwordOut').textContent;
  if (text.includes('•')) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    const old = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = old), 1200);
  });
}

generatePassword();
