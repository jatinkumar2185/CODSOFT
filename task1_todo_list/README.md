# To-Do List — Flask App

CodSoft Python Programming Internship — Task 1

A full-stack To-Do List application: a **Python/Flask backend** exposing a
REST API, and an **HTML/CSS/JS frontend** that consumes it. Tasks persist
server-side in `data/tasks.json`.

## Features

- Create, view, update, and delete tasks
- Priority levels (High / Medium / Low) and optional due dates
- Overdue detection
- Search, filter (by status), and sort (by due date / priority / newest)
- Clear all completed tasks in one click
- Live stats (total / pending / done / overdue)

## Project structure

```
todo_app/
├── app.py                 # Flask backend + REST API
├── requirements.txt
├── data/
│   └── tasks.json         # created automatically on first run
├── templates/
│   └── index.html         # main page
└── static/
    ├── style.css
    └── script.js           # talks to the API with fetch()
```

## Setup & run

```bash
cd todo_app
pip install -r requirements.txt
python app.py
```

Then open **http://localhost:5000** in your browser.

## API reference

| Method | Endpoint                     | Description                     |
|--------|-------------------------------|----------------------------------|
| GET    | `/api/tasks`                  | List all tasks                  |
| POST   | `/api/tasks`                  | Create a task                   |
| PATCH  | `/api/tasks/<id>`             | Update a task (partial)         |
| DELETE | `/api/tasks/<id>`             | Delete a task                   |
| POST   | `/api/tasks/clear-completed`  | Delete all completed tasks      |
| GET    | `/api/stats`                  | Task count summary              |

Example request body for creating a task:

```json
{
  "title": "Finish Task 1",
  "description": "Wire up the Flask API",
  "priority": "High",
  "due": "2026-08-01"
}
```

## Notes

- Data is stored in `data/tasks.json` — delete that file to reset the list.
- `debug=True` is set in `app.py` for local development; turn it off before
  deploying anywhere public.
