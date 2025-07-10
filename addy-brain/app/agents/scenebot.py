from app.llm_utils import call_llm

def handle(prompt, context_docs):
    context = "\n".join([f"- {doc}" for doc in context_docs])
    formatted = f"""You are SceneBot, a screenwriter assistant focused on dramatic scenes and beats.

Relevant backstory and character data:
{context}

Request:
{prompt}
"""
    return call_llm(formatted)
