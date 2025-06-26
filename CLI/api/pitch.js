// Location: /api/pitch.js

import fs from "fs";
import path from "path";
import { callLLM } from "../lib/openRouterClient.js";
import { ensureApiKey } from "../lib/envSetup.js";

const storagePath = path.resolve("./storage");

export default async function createPitch(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { project, story } = req.body;

  if (!project || !story || typeof story !== "string" || !story.trim()) {
    return res.status(400).json({ error: "Missing project or story input" });
  }

  try {
    const apiKey = await ensureApiKey();
    process.env.OPENROUTER_API_KEY = apiKey;

    const prompt = `
You are a story development assistant.
A user has entered a raw, stream-of-thought story idea. Your task is to:
1. Remove filler words, connectors, adjectives, and adverbs.
2. Extract and list the key story elements:
   - Themes
   - Characters
   - Plot Points
   - Settings
   - Genres
   - Key Items or Objects
3. Return the result in a clean bullet list format under each heading.

User Input:
"""
${story.trim()}
"""

Now perform the task.
    `;

    const result = await callLLM(prompt);
    const structured = result.trim();

    const pitchPath = path.join(storagePath, project, "pitch.json");
    fs.writeFileSync(
      pitchPath,
      JSON.stringify({ rawInput: story.trim(), structured }, null, 2)
    );

    res.status(200).json({ result: structured });
  } catch (err) {
    console.error("❌ Pitch analysis error:", err);
    res.status(500).json({ error: "LLM processing failed" });
  }
}
