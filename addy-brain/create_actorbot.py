from pathlib import Path
import json

# Redefine the ActorBot profile for Meg after code execution state reset
actor_data = {
    "voice_dna": "High sarcasm, medium pacing, clipped syntax, uses informal contractions. Tends to snark before admitting truth.",
    "bio": (
        "Meg is a rogue raised by relic hunters. She's cynical, resourceful, and deeply independent. "
        "Though she often masks emotion with sarcasm, she cares more than she lets on. "
        "Meg lies better than she tells the truth and thrives in morally gray situations."
    ),
    "sample_lines": [
        "Oh, *that* plan. Brilliant. Let’s die quickly, then.",
        "I've broken into worse places. Blindfolded.",
        "Trust is expensive, and you're on a budget.",
        "You keep talking like that, and I’ll start thinking you’re clever."
    ]
}

# Write to JSON
Path("app/actorbots").mkdir(parents=True, exist_ok=True)
with open("app/actorbots/Meg.json", "w") as f:
    json.dump(actor_data, f, indent=2)

"✅ ActorBot profile for Meg created at app/actorbots/Meg.json."
