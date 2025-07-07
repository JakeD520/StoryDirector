import callLLM from "./callLLM";

export default async function analyzePitch(text) {
  const prompt = `
You are a story analysis assistant.

Extract key story elements from the following stream-of-thought input.
Return the result as clean JSON with the following structure:
{
  "characters": ["..."],
  "locations": ["..."],
  "themes": ["..."],
  "items": ["..."],
  "conflicts": ["..."],
  "genre Guesses": ["..."]
}

Be concise. Return only essential nouns or noun phrases. Do not include extra prose. Remove redundant modifiers, adjectives, adverbs, or speculative commentary. 
Only list unique items in each category.

---
Input:
${text}
---

Return only the JSON.
`;

  const apiKey = localStorage.getItem("openrouter_api_key");
  const response = await callLLM([{ role: "user", content: prompt }], apiKey);

  try {
    const cleaned = response.replace(/```(?:json)?|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/); // Pull JSON object
    if (!match) throw new Error("No valid JSON object found in response.");
    return JSON.parse(match[0]);
  } catch (err) {
    console.warn("⚠️ Failed to parse LLM output:", response);
    return { error: "Invalid JSON returned from LLM", raw: response };
  }
}
