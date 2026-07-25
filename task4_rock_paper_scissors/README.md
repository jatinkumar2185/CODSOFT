# Rock · Paper · Scissors — Flask App

CodSoft Python Programming Internship — Task 4

A full-stack Rock-Paper-Scissors game: a **Python/Flask backend** that
picks the computer's move and decides the winner, and an **HTML/CSS/JS
frontend** for playing and viewing the score.

## Features

- Play rock, paper, or scissors against the computer
- Computer's move and win/lose/tie logic decided entirely server-side
- Score (wins / losses / ties / rounds) tracked per-browser via a signed
  session cookie — no database needed, and different visitors don't share
  scores
- Reset score button
- Small "throw" animation while the result is revealed

## Project structure

```
rps_app/
├── app.py                 # Flask backend + REST API
├── requirements.txt
├── templates/
│   └── index.html         # main page
└── static/
    ├── style.css
    └── script.js           # talks to the API with fetch()
```

## Setup & run

```bash
cd rps_app
pip install -r requirements.txt
python app.py
```

Then open **http://localhost:5003** in your browser.

(Runs on port 5003 by default, alongside the To-Do app on 5000, Calculator
on 5001, and Password Generator on 5002.)

## API reference

| Method | Endpoint             | Description                          |
|--------|-----------------------|----------------------------------------|
| POST   | `/api/play`           | Submit your choice, get the result    |
| GET    | `/api/score`          | Get current score for this session    |
| POST   | `/api/score/reset`    | Reset score to zero                   |

Example request body for `/api/play`:

```json
{ "choice": "rock" }
```

`choice` must be `"rock"`, `"paper"`, or `"scissors"`.

Example response:

```json
{
  "user_choice": "rock",
  "computer_choice": "scissors",
  "outcome": "win",
  "score": { "wins": 1, "losses": 0, "ties": 0, "rounds": 1 }
}
```

## Notes

- Score lives in the Flask session cookie, so it persists across page
  refreshes for the same browser, but resets if cookies are cleared.
- `app.secret_key` is a placeholder for local development — replace it
  with a real random secret before deploying anywhere public.
- `debug=True` is set in `app.py` for local development; turn it off before
  deploying anywhere public.
