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

Then open **http://localhost:5001** in your browser.

(Runs on port 5001 by default so it can run alongside the Task 1 To-Do app,
which uses port 5000.)

## API reference

| Method | Endpoint          | Description                          |
|--------|-------------------|----------------------------------------|
| POST   | `/api/calculate`  | Perform a calculation                 |
| GET    | `/api/history`    | Get recent calculation history        |
| DELETE | `/api/history`    | Clear calculation history             |

Example request body for `/api/calculate`:

```json
{ "a": 12, "b": 4, "op": "/" }
```

`op` must be one of `+`, `-`, `*`, `/`.

Example response:

```json
{ "a": 12.0, "b": 4.0, "op": "/", "result": 3.0 }
```

## Notes

- History is stored in memory and resets whenever the server restarts.
- `debug=True` is set in `app.py` for local development; turn it off before
  deploying anywhere public.
