from app.query_memory import search

def fetch_context(prompt, memory_type="auto"):
    # TODO: Add routing logic later if needed
    docs, metadata = search(prompt)
    print(f"[memorybot] fetch_context called with prompt: {prompt}")
    print(f"[memorybot] docs: {docs}")
    print(f"[memorybot] metadata: {metadata}")
    return docs, metadata
