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

Then open **http://localhost:5002** in your browser.

(Runs on port 5002 by default so it can run alongside the Task 1 To-Do app
on port 5000 and the Task 2 Calculator on port 5001.)

## API reference

| Method | Endpoint         | Description              |
|--------|-------------------|---------------------------|
| POST   | `/api/generate`  | Generate a password       |

Example request body:

```json
{
  "length": 20,
  "upper": true,
  "lower": true,
  "digits": true,
  "symbols": true
}
```

Example response:

```json
{ "password": "k7#Qz2!mPx9@Lr4Nvt&B", "strength": "strong" }
```

## Notes

- Passwords are generated fresh on each request and are never stored or
  logged anywhere.
- `debug=True` is set in `app.py` for local development; turn it off before
  deploying anywhere public.
