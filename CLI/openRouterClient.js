const fetch = require("node-fetch");
const { loadEnv } = require("./apiKeyManager");

loadEnv(); // Ensure .env is loaded
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  throw new Error("❌ Missing OpenRouter API key. Please run your key setup.");
}

async function callLLM(prompt, model = "openai/gpt-3.5-turbo") {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`🛑 OpenRouter Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "⚠️ No response content.";
}

module.exports = { callLLM };
