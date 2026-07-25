"""
Calculator Application - Flask Backend
CodSoft Python Programming Internship - Task 2

REST API + server-rendered frontend for a simple calculator.
All arithmetic happens on the server; the frontend just collects
input and displays results. Also keeps a short in-memory history.
"""

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

OPERATIONS = {"+", "-", "*", "/"}

# In-memory calculation history (resets when the server restarts)
history = []
MAX_HISTORY = 10


def calculate(a, b, op):
    """Perform the arithmetic operation. Returns (result, error)."""
    if op == "+":
        return a + b, None
    if op == "-":
        return a - b, None
    if op == "*":
        return a * b, None
    if op == "/":
        if b == 0:
            return None, "Division by zero is not allowed."
        return a / b, None
    return None, f"Unsupported operation '{op}'."


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    data = request.get_json(silent=True) or {}

    try:
        a = float(data.get("a"))
        b = float(data.get("b"))
    except (TypeError, ValueError):
        return jsonify({"error": "Both 'a' and 'b' must be valid numbers."}), 400

    op = data.get("op")
    if op not in OPERATIONS:
        return jsonify({"error": f"'op' must be one of {sorted(OPERATIONS)}."}), 400

    result, error = calculate(a, b, op)
    if error:
        return jsonify({"error": error}), 400

    # round to avoid ugly floating point artifacts like 0.1 + 0.2
    result = round(result, 10)

    entry = {"a": a, "b": b, "op": op, "result": result}
    history.insert(0, entry)
    del history[MAX_HISTORY:]

    return jsonify(entry)


@app.route("/api/history", methods=["GET"])
def api_history():
    return jsonify(history)


@app.route("/api/history", methods=["DELETE"])
def api_clear_history():
    history.clear()
    return jsonify({"cleared": True})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
