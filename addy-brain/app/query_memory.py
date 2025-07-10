import chromadb
from sentence_transformers import SentenceTransformer
import json
import os

# Set up ChromaDB client
client = chromadb.PersistentClient(path="./db")
collection = client.get_or_create_collection("character_bios")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def load_and_store():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    bios_path = os.path.join(base_dir, "memory", "character_bios.json")
    print(f"[DEBUG] Loading bios from: {bios_path}")
    with open(bios_path, "r") as f:
        data = json.load(f)
    for entry in data:
        try:
            collection.peek(ids=[entry["id"]])
        except:
            emb = embedder.encode(entry["document"]).tolist()
            collection.add(
                documents=[entry["document"]],
                metadatas=[entry["metadata"]],
                ids=[entry["id"]],
                embeddings=[emb]
            )

# Ensure bios are loaded into ChromaDB at import time
load_and_store()

def search(query, k=3):
    print(f"[ChromaDB] Searching for: {query}")
    emb = embedder.encode([query])
    results = collection.query(query_embeddings=emb, n_results=k)
    print(f"[ChromaDB] Results: {results}")
    return results["documents"][0], results["metadatas"][0]

# MemoryBot class for SupervisorAgent
class MemoryBot:
    def fetch_context(self, prompt, k=3):
        # Use the prompt as a query to the vector DB
        docs, meta = search(prompt, k)
        return docs, meta

memorybot = MemoryBot()

# Ensure bios are loaded into ChromaDB at import time
load_and_store()
