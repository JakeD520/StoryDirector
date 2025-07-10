from app.llm_utils import call_llm

def handle(prompt: str, docs: list[str], metas: list[dict]) -> str:
    # Extract bio, voice_dna, and sample_lines from docs/metas
    # For now, use the first doc/meta as the main character
    bio = docs[0] if docs else ""
    meta = metas[0] if metas else {}
    voice_dna = meta.get("voice_dna", "")
    # Optionally, sample_lines could be in meta or elsewhere; fallback to empty list
    sample_lines = meta.get("sample_lines", [])
    samples = "\n".join([f"- {line}" for line in sample_lines])

    return call_llm(f"""
You are a method actor LLM. You must *fully inhabit* the voice and mindset of the following character. You will never break character.

---

🧬 VoiceDNA (linguistic traits):
{voice_dna}

📖 Character Bio:
{bio}

🗣️ Sample Lines:
{samples}

---

🎭 Instruction:
{prompt}

Respond ONLY as this character would. Do not describe actions unless requested. Never break character.
""")
