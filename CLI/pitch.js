// pitch.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { ensureApiKey } from "./lib/envSetup.js";
import { callLLM } from "./lib/openRouterClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

(async () => {
  console.log("\n🎬 StoryDirector: Pitch Breakdown Tool\n");

  // Ensure API key is available
  const apiKey = await ensureApiKey();
  process.env.OPENROUTER_API_KEY = apiKey;

  // Get list of available projects
  const projects = fs.readdirSync(storagePath).filter((name) => {
    const fullPath = path.join(storagePath, name);
    return fs.statSync(fullPath).isDirectory();
  });

  if (projects.length === 0) {
    console.log("⚠️  No story projects found. Run createProject.js first.");
    return;
  }

  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message: "Which project is this pitch for?",
      choices: projects,
    },
  ]);

  const answers = await inquirer.prompt([
    {
      type: "editor",
      name: "story",
      message: "Enter your stream-of-thought story idea:",
    },
  ]);

  const rawInput = answers.story.trim();
  if (!rawInput) {
    console.log("⚠️  No input provided. Exiting.");
    return;
  }

  console.log("\n📨 Sending to LLM for analysis...\n");

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
${rawInput}
"""

Now perform the task.
  `;

  try {
    const result = await callLLM(prompt);
    console.log("\n🧠 Structured Pitch Elements:\n");
    console.log(result);

    const pitchPath = path.join(storagePath, selectedProject, "pitch.json");
    fs.writeFileSync(pitchPath, JSON.stringify({ rawInput, structured: result }, null, 2));
    console.log(`\n💾 Pitch saved to: storage/${selectedProject}/pitch.json\n`);
  } catch (err) {
    console.error("💥 Pitch Module Error:", err.message);
  }
})();
