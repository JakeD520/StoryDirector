# StoryDirector - AddyBrain Agent Architecture

## Overview

AddyBrain is a modular, agent-based architecture that powers the AI assistant Addy. It is designed to support scalable, efficient, and collaborative storytelling workflows.

### Core Concept

* **Addy** is the only LLM-facing the user.
* **Agents** are behind-the-scenes LLMs responsible for specific storytelling tasks.
* **VectorDB (Chroma)** stores persistent memory: characters, scenes, tone, voiceDNA, etc.
* **Router** classifies the prompt and dispatches the request to the appropriate agent.

---

## 🔧 Components

### 1. `SupervisorAgent` (Addy)

* **Role**: User-facing creative assistant.
* **Functions**:

  * Gets user prompt
  * Fetches relevant memory from ChromaDB
  * Hands prompt and context to `router.py`
  * Responds to user in natural language

### 2. `router.py` (Routing Logic)

* **Role**: Task classification + dispatch agent
* **Functions**:

  * Determines the type of task (scene, dialogue, etc)
  * Passes prompt + context to the correct agent
  * Handles fallback if no agent fits

#### Routing Flow:

```python
from app.agents import voicebot, scenebot, dialogbot, memorybot, actorbot
from app.llm_utils import call_llm

def classify_task(prompt: str) -> str:
    prompt = prompt.lower()
    if any(kw in prompt for kw in ["voice", "tone", "style", "accent"]):
        return "voice"
    elif any(kw in prompt for kw in ["scene", "setting", "location", "action"]):
        return "scene"
    elif any(kw in prompt for kw in ["dialogue", "conversation", "talk", "monologue", "exchange", "line"]):
        return "dialogue"
    elif any(kw in prompt for kw in ["actor", "read", "performance"]):
        return "actor"
    return "general"

def route(prompt: str, context: list[str] = []) -> str:
    task = classify_task(prompt)

    if task == "voice":
        return voicebot.handle(prompt, context)
    elif task == "scene":
        return scenebot.handle(prompt, context)
    elif task == "dialogue":
        return dialogbot.handle(prompt, context)
    elif task == "actor":
        return actorbot.handle(prompt, context)
    else:
        memory = "\n".join([f"- {d}" for d in context])
        return call_llm(f"""You are Addy, a smart assistant helping with story design.

Context:
{memory}

Task:
{prompt}
""")
```

### 3. Agents

Each agent is a single-responsibility logic module that wraps a structured LLM prompt.

#### ✅ Shared Prompt Pattern:

```text
You are [AgentName], a specialized assistant focused on [task type].
You are not interacting with the user.
You report to Addy, the creative assistant.

Context:
{context}

Instruction from Addy:
{prompt}

Respond only with your direct suggestion.
```

#### Current Agents:

* **VoiceBot** → handles voice/tone modifications
* **SceneBot** → writes setting-based or scene-based content
* **DialogueBot** → writes/revises character conversations
* **MemoryBot** → fetches semantic context from vectorDB
* **ActorBot** → reads/voices specific character lines

### 4. Memory (ChromaDB)

* **Structure**: Each memory chunk is stored with `document`, `metadata`, and `id`
* **Use Cases**:

  * Character bios
  * Backstories
  * Dialogue lines
  * Worldbuilding fragments

### 5. LLM Utilities

* `call_llm()` wraps requests to OpenRouter or other API
* Includes model configuration, temperature, and safety control

---

## 🔄 Flow Example

```
[User] → "Make Meg's dialogue sound drunk"
   ↓
[SupervisorAgent] → fetch_context("Meg")
   ↓
[Router] → classify_task("dialogue") → calls DialogueBot
   ↓
[DialogueBot] → returns drunker version of Meg’s line
   ↓
[Addy] → "Here's a version of Meg's line with a drunk tone."
```

---

## 🚀 Scalability

* New agents can be added without refactoring the core
* Future agents: `PlotBot`, `ThemeBot`, `LoreBot`, `OutlineBot`, `NarratorBot`
* Each agent can be optimized with smaller models
* Agents can call other agents if needed (Addy orchestrates this)

---

## 💡 Philosophy

> "Let Addy speak. Let agents think."

By separating the voice of the assistant (Addy) from the specialized logic of task agents, we maintain conversational flow while optimizing system logic.

Addy is your collaborator. Agents are your team. Memory is your universe.

---

## 🔜 Next Steps

* Add advanced debugging/logging (show agent, prompt, memory size)
* UI integration via React frontend
* Add replay/revision interface for previous Addy prompts
* Support prompt presets for agent onboarding
