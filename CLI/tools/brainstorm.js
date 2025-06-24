// Node.js v18+ has built-in fetch, so no need to require node-fetch

const API_KEY = process.env.OPENROUTER_API_KEY || ""; // Set your key here for testing
const MODEL = "openai/gpt-3.5-turbo";

async function callLLM(prompt) {
  if (!API_KEY) {
    console.error("Error: OPENROUTER_API_KEY is not set. Set it as an environment variable or hardcode it for testing.");
    process.exit(1);
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log("Response:\n" + data.choices[0].message.content);
    } else {
      console.error("Unexpected response format:", data);
    }
  } catch (err) {
    console.error("API call failed:", err.message);
  }
}

const prompt = process.argv.slice(2).join(" ") || "Write a story idea about a robot who learns how to cook.";
callLLM(prompt);
