import os
from dotenv import load_dotenv
import requests

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "mistralai/mistral-7b-instruct"  # ✅ known working model

def call_llm(prompt, temperature=0.7):
    if not OPENROUTER_API_KEY:
        raise ValueError("Missing OpenRouter API key. Set OPENROUTER_API_KEY as an environment variable.")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are Addy, a creative assistant for building stories. Be helpful, quirky, and insightful."},
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)

    if response.status_code != 200:
        print("❌ LLM API call failed. Response:")
        print(response.text)
        response.raise_for_status()

    return response.json()["choices"][0]["message"]["content"]
