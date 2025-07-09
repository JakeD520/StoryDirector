// src/utils/callLLM.js




export default async function callLLM(prompt) {
  let messages;
  if (typeof prompt === "string") {
    if (!prompt.trim()) throw new Error("❌ Prompt is empty.");
    messages = [{ role: "user", content: prompt }];
  } else if (Array.isArray(prompt)) {
    if (!prompt.length) throw new Error("❌ Prompt array is empty.");
    messages = prompt;
  } else {
    throw new Error("❌ Invalid prompt type.");
  }
  const apiKey = localStorage.getItem("openrouter_api_key");
  if (!apiKey) throw new Error("❌ Missing OpenRouter API key.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages,
    }),
  });

  const data = await response.json();
  console.log("📦 Full LLM response:\n", JSON.stringify(data, null, 2));

  return data.choices?.[0]?.message?.content || "No response received.";
}
