from app.query_memory import memorybot
from app.router import route
from app.llm_utils import call_llm

def ask_addy(prompt: str) -> dict:
    """
    Orchestrates the Addy agent workflow:
    - Fetches context from memorybot
    - Routes the prompt to the correct agent
    - Reformulates the agent output in Addy's voice
    Returns a dict with Addy's response, agent output, and debug info.
    Addy will also help debug agent output if requested.
    """
    try:
        docs, meta = memorybot.fetch_context(prompt)
        raw_agent_response = route(prompt, (docs, meta))
        debug_info = f"\n[DEBUG]\nAgent Output: {raw_agent_response}\nMemory Size: {len(docs)}\nMeta: {meta}\n"
        # If the user prompt includes 'debug' or 'show debug', Addy will include debug info in the response
        addy_prompt = f"""You are Addy, a helpful creative assistant.

Context:
{raw_agent_response}

User Request:
{prompt}

Respond naturally and helpfully to the user.
If the user asks for debug info, include the following debug details:
{debug_info}
"""
        addy_response = call_llm(addy_prompt)
        return {
            "addy": addy_response,
            "agent_raw": raw_agent_response,
            "memory_size": len(docs),
            "meta": meta,
            "debug": debug_info
        }
    except Exception as e:
        return {
            "addy": f"Sorry, something went wrong: {e}",
            "agent_raw": "",
            "memory_size": 0,
            "meta": {},
            "debug": f"Exception: {e}"
        }
