from app.agents import voicebot, scenebot, dialoguebot, memorybot, actorbot
from app.llm_utils import call_llm

def classify_task(prompt: str) -> str:
    prompt = prompt.lower()
    if any(kw in prompt for kw in ["voice", "tone", "style", "accent"]):
        return "voice"
    elif any(kw in prompt for kw in ["scene", "setting", "location", "action"]):
        return "scene"
    elif any(kw in prompt for kw in ["dialogue", "conversation", "talk", "monologue", "exchange", "line"]):
        return "dialogue"
    elif any(kw in prompt for kw in ["actor", "read", "performance", "in character"]):
        return "actor"
    return "general"

def route(prompt: str, context: list[str] = []) -> str:
    task = classify_task(prompt)
    print(f"🧠 Routed to: {task}")

    # Debug: Show context type and size
    print(f"[router] Context type: {type(context)}, length: {len(context) if hasattr(context, '__len__') else 'N/A'}")

    if task == "voice":
        print(f"[router] Routing to voicebot with prompt: {prompt}")
        return voicebot.handle(prompt, context)
    elif task == "scene":
        print(f"[router] Routing to scenebot with prompt: {prompt}")
        return scenebot.handle(prompt, context)
    elif task == "dialogue":
        print(f"[router] Routing to dialoguebot with prompt: {prompt}")
        return dialoguebot.handle(prompt, context)
    elif task == "actor":
        # context is expected to be a list of docs, but we also need metas
        # If context is a tuple (docs, metas), unpack it; else, treat as docs only
        if isinstance(context, tuple) and len(context) == 2:
            docs, metas = context
        else:
            docs = context
            metas = [{} for _ in docs]
        print(f"[router] Calling actorbot.handle with docs: {docs}, metas: {metas}")
        print(f"[router] actorbot.handle: {actorbot.handle}")
        return actorbot.handle(prompt, docs, metas)
    else:
        memory = "\n".join([f"- {d}" for d in context])
        print(f"[router] Routing to GeneralBot with prompt: {prompt}")
        return call_llm(f"""You are GeneralBot, a specialized assistant for general story tasks.
You are not interacting with the user.
You report to Addy, the creative assistant.

Context:
{memory}

Instruction from Addy:
{prompt}

Respond only with your direct suggestion. Do not explain or add extra text.
""")
