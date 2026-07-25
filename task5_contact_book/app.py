"""
Contact Book — Task 5 (CodSoft Python Programming Internship)

A small Flask web app that stores contacts in SQLite and exposes a
JSON API the frontend talks to. Run with:

    pip install flask --break-system-packages
    python app.py

Then open http://127.0.0.1:5000 in a browser.
"""
from flask import Flask, jsonify, request, render_template, g
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "contacts.db")

app = Flask(__name__)


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS contacts (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT NOT NULL,
            phone    TEXT NOT NULL,
            email    TEXT,
            address  TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def row_to_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "phone": row["phone"],
        "email": row["email"] or "",
        "address": row["address"] or "",
    }


# ---------------------------------------------------------------------------
# Page route
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------
@app.route("/api/contacts", methods=["GET"])
def list_contacts():
    """List all contacts, optionally filtered by a search query (?q=)
    that matches name or phone number, and/or a starting letter (?letter=)."""
    q = request.args.get("q", "").strip().lower()
    letter = request.args.get("letter", "").strip().upper()

    db = get_db()
    rows = db.execute("SELECT * FROM contacts ORDER BY name COLLATE NOCASE ASC").fetchall()
    contacts = [row_to_dict(r) for r in rows]

    if q:
        contacts = [
            c for c in contacts
            if q in c["name"].lower() or q in c["phone"].lower()
        ]
    if letter:
        contacts = [c for c in contacts if c["name"][:1].upper() == letter]

    return jsonify(contacts)


@app.route("/api/contacts", methods=["POST"])
def add_contact():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    email = (data.get("email") or "").strip()
    address = (data.get("address") or "").strip()

    if not name or not phone:
        return jsonify({"error": "Name and phone are required."}), 400

    db = get_db()
    cur = db.execute(
        "INSERT INTO contacts (name, phone, email, address) VALUES (?, ?, ?, ?)",
        (name, phone, email, address),
    )
    db.commit()
    new_row = db.execute("SELECT * FROM contacts WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(row_to_dict(new_row)), 201


@app.route("/api/contacts/<int:contact_id>", methods=["PUT"])
def update_contact(contact_id):
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    email = (data.get("email") or "").strip()
    address = (data.get("address") or "").strip()

    if not name or not phone:
        return jsonify({"error": "Name and phone are required."}), 400

    db = get_db()
    existing = db.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    if existing is None:
        return jsonify({"error": "Contact not found."}), 404

    db.execute(
        "UPDATE contacts SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?",
        (name, phone, email, address, contact_id),
    )
    db.commit()
    updated = db.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    return jsonify(row_to_dict(updated))


@app.route("/api/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    db = get_db()
    existing = db.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    if existing is None:
        return jsonify({"error": "Contact not found."}), 404
    db.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
    db.commit()
    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
else:
    # also make sure the DB exists when imported (e.g. by a WSGI server)
    init_db()
