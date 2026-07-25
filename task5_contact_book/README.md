# Contact Book — Task 5 (CodSoft Python Programming Internship)

A full contact book web app: **Python (Flask)** on the backend, **HTML/CSS/JS**
on the frontend, storing everything in a local **SQLite** database — no
frameworks, no build step.

## Features
- **Add contact** — name, phone, email, address
- **View contacts** — index-card grid, sorted alphabetically
- **Search** — live search by name or phone number
- **Filter by letter** — rolodex-style A–Z tabs down the side
- **Update contact** — edit any card in place
- **Delete contact** — with a confirmation step
- Clean, responsive, distinctively-themed UI (a rolodex/index-card look)

## Project structure
```
contact_book/
├── app.py              # Flask app + REST API (/api/contacts)
├── requirements.txt
├── contacts.db          # created automatically on first run
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## Run it

```bash
cd contact_book
pip install -r requirements.txt
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

## API reference

| Method | Route                    | Description                        |
|--------|---------------------------|-------------------------------------|
| GET    | `/api/contacts`           | List contacts (`?q=` search, `?letter=` filter) |
| POST   | `/api/contacts`           | Create a contact                    |
| PUT    | `/api/contacts/<id>`      | Update a contact                    |
| DELETE | `/api/contacts/<id>`      | Delete a contact                    |

## Notes for the internship submission
- This satisfies **Task 5: Contact Book** from the CodSoft Python
  Programming internship, built as a web app (Python backend + HTML/CSS/JS
  frontend) rather than a command-line tool.
- Push this folder to a GitHub repo named `CODSOFT_TASKSNO` alongside your
  other completed tasks, and record a short demo video per the internship's
  submission instructions.
