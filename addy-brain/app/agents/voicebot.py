from app.llm_utils import call_llm

def handle(prompt, context_docs):
    context = "\n".join([f"- {doc}" for doc in context_docs])
    formatted = f"""You are VoiceBot, an expert in analyzing and shaping writing voice.

Context samples:
{context}

Task:
Based on the above, complete the following voice-related request:
{prompt}
"""
    return call_llm(formatted)
