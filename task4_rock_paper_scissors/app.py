"""
Rock-Paper-Scissors Game - Flask Backend
CodSoft Python Programming Internship - Task 4

REST API + server-rendered frontend for Rock-Paper-Scissors.
The computer's choice and the win/lose/tie logic run entirely on the
server. Score is tracked per-browser using a signed session cookie,
so different visitors don't share (or clobber) each other's scores.
"""

import secrets

from flask import Flask, jsonify, render_template, request, session

app = Flask(__name__)
# Session cookie signing key. Fine for local/dev use; generate a real
# secret (e.g. via `secrets.token_hex(32)`) before deploying anywhere public.
app.secret_key = "codsoft-task4-dev-key-change-me"

CHOICES = ["rock", "paper", "scissors"]

BEATS = {
    "rock": "scissors",
    "scissors": "paper",
    "paper": "rock",
}


def ensure_score():
    session.setdefault("wins", 0)
    session.setdefault("losses", 0)
    session.setdefault("ties", 0)
    session.setdefault("rounds", 0)


def decide_winner(user_choice, computer_choice):
    if user_choice == computer_choice:
        return "tie"
    if BEATS[user_choice] == computer_choice:
        return "win"
    return "lose"


@app.route("/")
def index():
    ensure_score()
    return render_template("index.html")


@app.route("/api/play", methods=["POST"])
def api_play():
    data = request.get_json(silent=True) or {}
    user_choice = data.get("choice")

    if user_choice not in CHOICES:
        return jsonify({"error": f"Choice must be one of {CHOICES}."}), 400

    ensure_score()

    computer_choice = secrets.choice(CHOICES)
    outcome = decide_winner(user_choice, computer_choice)

    session["rounds"] += 1
    if outcome == "win":
        session["wins"] += 1
    elif outcome == "lose":
        session["losses"] += 1
    else:
        session["ties"] += 1
    session.modified = True

    return jsonify({
        "user_choice": user_choice,
        "computer_choice": computer_choice,
        "outcome": outcome,
        "score": {
            "wins": session["wins"],
            "losses": session["losses"],
            "ties": session["ties"],
            "rounds": session["rounds"],
        },
    })


@app.route("/api/score", methods=["GET"])
def api_score():
    ensure_score()
    return jsonify({
        "wins": session["wins"],
        "losses": session["losses"],
        "ties": session["ties"],
        "rounds": session["rounds"],
    })


@app.route("/api/score/reset", methods=["POST"])
def api_reset_score():
    session["wins"] = 0
    session["losses"] = 0
    session["ties"] = 0
    session["rounds"] = 0
    return jsonify({"reset": True})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5003)
