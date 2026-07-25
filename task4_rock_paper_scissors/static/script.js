const EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' };
let playing = false;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
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

async function loadScore() {
  try {
    const score = await fetchJson('/api/score');
    setConnStatus(true);
    renderScore(score);
  } catch (err) {
    setConnStatus(false, err.message);
  }
}

async function play(choice) {
  if (playing) return;
  playing = true;
  setButtonsDisabled(true);

  const userHand = document.getElementById('userHand');
  const computerHand = document.getElementById('computerHand');
  const outcomeEl = document.getElementById('outcome');

  userHand.textContent = EMOJI[choice];
  userHand.classList.add('animate');
  computerHand.textContent = '❓';
  computerHand.classList.add('animate');
  outcomeEl.textContent = 'Rock… Paper… Scissors…';
  outcomeEl.className = 'outcome';

  try {
    const data = await fetchJson('/api/play', {
      method: 'POST',
      body: JSON.stringify({ choice }),
    });

    setTimeout(() => {
      computerHand.textContent = EMOJI[data.computer_choice];
      outcomeEl.textContent = outcomeText(data.outcome, data.computer_choice);
      outcomeEl.classList.add(data.outcome === 'win' ? 'win' : data.outcome === 'lose' ? 'lose' : 'tie');
      renderScore(data.score);
      setConnStatus(true);
      setButtonsDisabled(false);
      playing = false;
    }, 500);
  } catch (err) {
    outcomeEl.textContent = err.message;
    setConnStatus(false, err.message);
    setButtonsDisabled(false);
    playing = false;
  }
}

function outcomeText(outcome, computerChoice) {
  const cc = computerChoice.charAt(0).toUpperCase() + computerChoice.slice(1);
  if (outcome === 'win') return `You win! Computer played ${cc}.`;
  if (outcome === 'lose') return `You lose. Computer played ${cc}.`;
  return `It's a tie — both played ${cc}.`;
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll('.choice-btn').forEach(b => (b.disabled = disabled));
}

function renderScore(score) {
  document.getElementById('scoreWins').textContent = score.wins;
  document.getElementById('scoreLosses').textContent = score.losses;
  document.getElementById('scoreTies').textContent = score.ties;
  document.getElementById('scoreRounds').textContent = score.rounds;
}

async function resetScore() {
  try {
    await fetchJson('/api/score/reset', { method: 'POST' });
    await loadScore();
    document.getElementById('outcome').textContent = 'Make your move';
    document.getElementById('outcome').className = 'outcome';
    document.getElementById('userHand').textContent = '✊';
    document.getElementById('computerHand').textContent = '❓';
  } catch (err) {
    alert(err.message);
  }
}

loadScore();
