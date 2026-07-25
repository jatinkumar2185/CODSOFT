# Calculator — Flask App

CodSoft Python Programming Internship — Task 2

A full-stack calculator: a **Python/Flask backend** that performs all the
arithmetic, and an **HTML/CSS/JS frontend** that collects input and displays
results. Keeps a short calculation history in server memory.

## Features

- Add, subtract, multiply, divide — computed entirely on the server
- Input validation (rejects non-numeric input, blocks division by zero)
- Rounds floating-point results to avoid artifacts like `0.1 + 0.2 = 0.30000000000000004`
- Live calculation history (last 10 calculations), with a clear button

## Project structure

```
calculator_app/
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
cd calculator_app
pip install -r requirements.txt
python app.py
```
