"""
To-Do List Application - Flask Backend
CodSoft Python Programming Internship - Task 1

REST API + server-rendered frontend for a To-Do List app.
Tasks are stored in a JSON file (data/tasks.json) so they persist
across server restarts. No database setup required.
"""

import json
import os
from datetime import datetime
from itertools import count

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "tasks.json")


# ---------------------------------------------------------------------
# Storage helpers
# ---------------------------------------------------------------------

def ensure_data_file():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f)


def load_tasks():
    ensure_data_file()
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_tasks(tasks):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=2)


def next_id(tasks):
    return max([t["id"] for t in tasks], default=0) + 1


def find_task(tasks, task_id):
    return next((t for t in tasks if t["id"] == task_id), None)


VALID_PRIORITIES = {"High", "Medium", "Low"}


def validate_task_payload(data, partial=False):
    """Return (cleaned_dict, error_message)."""
    cleaned = {}

    if "title" in data or not partial:
        title = (data.get("title") or "").strip()
        if not title:
            return None, "Title is required."
        cleaned["title"] = title

    if "description" in data or not partial:
        cleaned["description"] = (data.get("description") or "").strip()

    if "priority" in data or not partial:
        priority = data.get("priority", "Medium")
        if priority not in VALID_PRIORITIES:
            return None, f"Priority must be one of {sorted(VALID_PRIORITIES)}."
        cleaned["priority"] = priority

    if "due" in data or not partial:
        due = (data.get("due") or "").strip()
        if due:
            try:
                datetime.strptime(due, "%Y-%m-%d")
            except ValueError:
                return None, "Due date must be in YYYY-MM-DD format."
        cleaned["due"] = due

    if "done" in data:
        cleaned["done"] = bool(data.get("done"))

    return cleaned, None


# ---------------------------------------------------------------------
# Frontend route
# ---------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------

@app.route("/api/tasks", methods=["GET"])
def api_list_tasks():
    tasks = load_tasks()
    return jsonify(tasks)


@app.route("/api/tasks", methods=["POST"])
def api_create_task():
    data = request.get_json(silent=True) or {}
    cleaned, error = validate_task_payload(data, partial=False)
    if error:
        return jsonify({"error": error}), 400

    tasks = load_tasks()
    task = {
        "id": next_id(tasks),
        "title": cleaned["title"],
        "description": cleaned["description"],
        "priority": cleaned["priority"],
        "due": cleaned["due"],
        "done": False,
        "created": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    tasks.append(task)
    save_tasks(tasks)
    return jsonify(task), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT", "PATCH"])
def api_update_task(task_id):
    tasks = load_tasks()
    task = find_task(tasks, task_id)
    if not task:
        return jsonify({"error": "Task not found."}), 404

    data = request.get_json(silent=True) or {}
    cleaned, error = validate_task_payload(data, partial=True)
    if error:
        return jsonify({"error": error}), 400

    task.update(cleaned)
    save_tasks(tasks)
    return jsonify(task)


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def api_delete_task(task_id):
    tasks = load_tasks()
    task = find_task(tasks, task_id)
    if not task:
        return jsonify({"error": "Task not found."}), 404

    tasks = [t for t in tasks if t["id"] != task_id]
    save_tasks(tasks)
    return jsonify({"deleted": task_id})


@app.route("/api/tasks/clear-completed", methods=["POST"])
def api_clear_completed():
    tasks = load_tasks()
    remaining = [t for t in tasks if not t["done"]]
    removed = len(tasks) - len(remaining)
    save_tasks(remaining)
    return jsonify({"removed": removed})


@app.route("/api/stats", methods=["GET"])
def api_stats():
    tasks = load_tasks()
    today = datetime.now().date()

    def is_overdue(t):
        if t["done"] or not t["due"]:
            return False
        try:
            return datetime.strptime(t["due"], "%Y-%m-%d").date() < today
        except ValueError:
            return False

    total = len(tasks)
    done = sum(1 for t in tasks if t["done"])
    overdue = sum(1 for t in tasks if is_overdue(t))
    return jsonify({
        "total": total,
        "done": done,
        "pending": total - done,
        "overdue": overdue,
    })


if __name__ == "__main__":
    ensure_data_file()
    app.run(debug=True, host="0.0.0.0", port=5000)
