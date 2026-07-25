"""
Password Generator Application - Flask Backend
CodSoft Python Programming Internship - Task 3

REST API + server-rendered frontend for a password generator.
Passwords are generated server-side using Python's 'secrets' module,
which is cryptographically stronger than 'random' and appropriate
for generating real passwords.
"""

import string
import secrets

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

UPPER = string.ascii_uppercase
LOWER = string.ascii_lowercase
DIGITS = string.digits
SYMBOLS = "!@#$%^&*()-_=+[]{}<>?"

MIN_LENGTH = 4
MAX_LENGTH = 64


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/generate", methods=["POST"])
def api_generate():
    data = request.get_json(silent=True) or {}

    try:
        length = int(data.get("length", 16))
    except (TypeError, ValueError):
        return jsonify({"error": "Length must be a whole number."}), 400

    if length < MIN_LENGTH or length > MAX_LENGTH:
        return jsonify({"error": f"Length must be between {MIN_LENGTH} and {MAX_LENGTH}."}), 400

    use_upper = bool(data.get("upper", True))
    use_lower = bool(data.get("lower", True))
    use_digits = bool(data.get("digits", True))
    use_symbols = bool(data.get("symbols", False))

    pool = ""
    if use_upper:
        pool += UPPER
    if use_lower:
        pool += LOWER
    if use_digits:
        pool += DIGITS
    if use_symbols:
        pool += SYMBOLS

    if not pool:
        return jsonify({"error": "Select at least one character type."}), 400

    # Guarantee at least one character from each selected set, then fill
    # the rest randomly, then shuffle so the guaranteed characters aren't
    # always in the same position.
    required = []
    if use_upper:
        required.append(secrets.choice(UPPER))
    if use_lower:
        required.append(secrets.choice(LOWER))
    if use_digits:
        required.append(secrets.choice(DIGITS))
    if use_symbols:
        required.append(secrets.choice(SYMBOLS))

    remaining_length = max(length - len(required), 0)
    password_chars = required + [secrets.choice(pool) for _ in range(remaining_length)]
    password_chars = password_chars[:length]

    # Fisher-Yates style shuffle using secrets for randomness
    for i in range(len(password_chars) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        password_chars[i], password_chars[j] = password_chars[j], password_chars[i]

    password = "".join(password_chars)
    strength = assess_strength(length, [use_upper, use_lower, use_digits, use_symbols])

    return jsonify({"password": password, "strength": strength})


def assess_strength(length, types_used):
    types_count = sum(1 for t in types_used if t)
    score = 0
    if length >= 8:
        score += 1
    if length >= 14:
        score += 1
    if types_count >= 3:
        score += 1

    if score <= 1:
        return "weak"
    if score == 2:
        return "okay"
    return "strong"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
