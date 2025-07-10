from flask import Flask, request, jsonify
from flask_cors import CORS
from app.SupervisorAgent import ask_addy
from app.query_memory import collection

app = Flask(__name__)
CORS(app)  # Allow requests from any frontend (e.g., localhost:5173)

@app.route("/api/addy", methods=["POST"])
def call_addy():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    result = ask_addy(prompt)
    return jsonify({"result": result})

@app.route("/api/memory/add", methods=["POST"])
def add_memory():
    data = request.get_json()
    doc = data.get("document")
    meta = data.get("metadata", {})
    doc_id = data.get("id")

    if not doc or not doc_id:
        return jsonify({"error": "Missing document or id"}), 400

    collection.add(
        documents=[doc],
        metadatas=[meta],
        ids=[doc_id]
    )
    return jsonify({"status": "added", "id": doc_id})

@app.route("/api/memory/search", methods=["GET"])
def search_memory():
    query = request.args.get("q", "")
    if not query:
        return jsonify({"error": "Missing query param"}), 400

    results = collection.query(query_texts=[query], n_results=5)
    docs = results.get("documents", [[]])[0]
    return jsonify({"matches": docs})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
