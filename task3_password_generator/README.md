# Password Generator — Flask App

CodSoft Python Programming Internship — Task 3

A full-stack password generator: a **Python/Flask backend** that generates
passwords using Python's `secrets` module (cryptographically strong, unlike
`random`), and an **HTML/CSS/JS frontend** for choosing options and viewing
the result.

## Features

- Adjustable length (4–64 characters)
- Toggle uppercase, lowercase, digits, and symbols
- Guarantees at least one character from each selected type, then shuffles
- Strength meter (Weak / Okay / Strong) based on length and variety
- One-click copy to clipboard

## Project structure

```
password_app/
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
cd password_app
pip install -r requirements.txt
python app.py
```
