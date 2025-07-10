from app.llm_utils import call_llm

def handle(prompt, context_docs):
    context = "\n".join([f"- {doc}" for doc in context_docs])
    formatted = f"""You are DialogueBot, a character writing assistant who crafts realistic, dynamic exchanges between characters.

Relevant background:
{context}

Prompt:
{prompt}
"""
    return call_llm(formatted)
