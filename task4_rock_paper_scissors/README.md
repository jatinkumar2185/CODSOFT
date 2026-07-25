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
