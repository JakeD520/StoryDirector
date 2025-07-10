# AddyBrain (StoryDirector AI Agent System) — Master Record

## 📁 Folder Structure

```
addy-brain/
│
├── app/
│   ├── agents/
│   │   ├── actorbot.py
│   │   ├── dialoguebot.py
│   │   ├── memorybot.py
│   │   ├── scenebot.py
│   │   ├── voicebot.py
│   ├── query_memory.py
│   ├── router.py
│   ├── SupervisorAgent.py
│   └── llm_utils.py
│
├── memory/
│   └── character_bios.json
│
├── run_query.py
├── requirements.txt
└── (venv, .env, etc.)
```

---

## 🧠 Core Components

### 1. SupervisorAgent (app/SupervisorAgent.py)
- **Entry point for user queries.**
- Orchestrates: fetches context from memory, routes to the correct agent, reformulates output in Addy’s voice.
- Returns a dict with Addy’s response, agent output, memory size, and debug info.

### 2. Router (app/router.py)
- **Classifies the user’s prompt** (scene, dialogue, actor, etc.).
- Routes to the appropriate agent.
- For `actor`, passes both docs and metas to the agent.
- Can be extended for multi-agent orchestration (e.g., scene → actorbot for character performances).

### 3. Agents (app/agents/)
- **Single-responsibility modules** for each creative task.
- `actorbot.py` — generates in-character performances.
- `scenebot.py` — generates scenes.
- `dialoguebot.py` — generates dialogue.
- `voicebot.py` — handles voice/tone.
- `memorybot.py` — fetches context from ChromaDB.

### 4. Memory (app/query_memory.py, memory/character_bios.json)
- Uses ChromaDB for persistent vector search.
- `load_and_store()` loads bios from JSON into ChromaDB.
- `search()` queries the DB for relevant context.

### 5. LLM Utilities (app/llm_utils.py)
- Wraps calls to OpenRouter or other LLM APIs.

### 6. CLI (run_query.py)
- Simple REPL for testing AddyBrain.
- Calls `ask_addy()` and prints Addy’s response.

---

## ⚙️ Setup

1. **Install dependencies:**
   ```
   python -m venv venv
   venv\Scripts\activate  # or source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Ensure ChromaDB is initialized:**
   - On import, `load_and_store()` in `query_memory.py` loads bios into the DB.

3. **Run the CLI:**
   ```
   python run_query.py
   ```

---

## 🏗️ Design Patterns

- **Router orchestrates all agent calls.** Agents do not call each other directly.
- **Agents are minimal and token-efficient.** Only SupervisorAgent “humanizes” output.
- **Context (docs, metas) is passed as a tuple for agents that need metadata.**
- **Debug prints** are included throughout for easy tracing.

---

## 🧩 Extending AddyBrain

- Add new agents by creating a new file in `app/agents/` and importing it in `router.py`.
- To enable agent collaboration (e.g., scene → actorbot), add orchestration logic in `router.py` after the main agent call.
- To add new memory types, extend `memorybot.py` and `query_memory.py`.

---

## 📝 Example Usage

```
>> Ask Addy (e.g., 'give me a sarcastic rogue'): give me a performance, in character read of the meg actor
[ChromaDB] Searching for: give me a performance, in character read of the meg actor
[ChromaDB] Results: ...
🧠 Routed to: actor
[router] Calling actorbot.handle with docs: [...], metas: [...]
Addy says:
(Meg's in-character performance)
```

---

## 🔍 Troubleshooting

- If ChromaDB returns empty results, ensure `load_and_store()` is called and the DB is populated.
- If agent signatures mismatch, check all imports and restart your Python process.
- Use debug prints in `router.py` and `memorybot.py` to trace data flow.

---

**This record should be enough for any LLM or developer to understand, extend, or debug your AddyBrain system.**
If you need a zipped copy of the folder or a requirements.txt sample, just ask!
