export default async function callLLM(messages, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet", // a valid free model
      messages: messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter Error:", errorText);
    throw new Error(`LLM Error: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "(No response)";
}
