async function callLLM(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("❌ Missing OpenRouter API key.");
  }

  // Debug: Print the actual Authorization header value
  console.log("🔎 Sending Authorization header:", `Bearer ${apiKey}`);

  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  console.log("📦 Full LLM response:\n", JSON.stringify(data, null, 2)); // <-- Debug line

  return data.choices?.[0]?.message?.content || "No response received.";
}

module.exports = { callLLM };
async function callLLM(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("❌ Missing OpenRouter API key.");
  }

  // Debug: Print the actual Authorization header value
  console.log("🔎 Sending Authorization header:", `Bearer ${apiKey}`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  console.log("📦 Full LLM response:\n", JSON.stringify(data, null, 2)); // <-- Debug line

  return data.choices?.[0]?.message?.content || "No response received.";
}

module.exports = { callLLM };