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

