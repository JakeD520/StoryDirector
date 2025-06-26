async function callLLM(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("❌ Missing OpenRouter API key.");
  }

  console.log("🔎 Sending Authorization header:", `Bearer ${apiKey}`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  console.log("📦 Full LLM response:\n", JSON.stringify(data, null, 2));

  return data.choices?.[0]?.message?.content || "No response received.";
}

// ✅ Use ESM export now
export { callLLM };
