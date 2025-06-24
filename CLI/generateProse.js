// generateProse.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { ensureApiKey } from "./lib/envSetup.js";
import { callLLM } from "./lib/openRouterClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

(async () => {
  console.log("\n📖 StoryDirector: Generate Sample Prose\n");

  const apiKey = await ensureApiKey();
  process.env.OPENROUTER_API_KEY = apiKey;

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
      message: "Choose a project to generate prose from:",
      choices: projects,
    },
  ]);

  const metaPath = path.join(storagePath, selectedProject, "metadata.json");
  const pitchPath = path.join(storagePath, selectedProject, "pitch.json");
  const brainstormPath = path.join(storagePath, selectedProject, "brainstorm.json");
  const weightPath = path.join(storagePath, selectedProject, "weights.json");

  const metadata = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
  const pitchData = fs.existsSync(pitchPath) ? JSON.parse(fs.readFileSync(pitchPath, "utf8")) : {};
  const brainstorm = fs.existsSync(brainstormPath) ? JSON.parse(fs.readFileSync(brainstormPath, "utf8")) : {};
  const weights = fs.existsSync(weightPath) ? JSON.parse(fs.readFileSync(weightPath, "utf8")) : null;

  const elements = [
    `Project: ${metadata.name || selectedProject}`,
    metadata.genres ? `Genres: ${metadata.genres.join(", ")}` : null,
    metadata.tone ? `Tone: ${metadata.tone}` : null,
    metadata.readerExperience ? `Reader Experience: ${metadata.readerExperience.join(", ")}` : null,
    metadata.pov ? `POV: ${metadata.pov}` : null,
    metadata.tense ? `Tense: ${metadata.tense}` : null,
    metadata.contentRating ? `Content Rating: ${metadata.contentRating}` : null,
    metadata.storyArc ? `Story Arc: ${metadata.storyArc}` : null,
    pitchData.structured ? `Pitch:\n${pitchData.structured}` : null,
    Object.keys(brainstorm).length > 0 ? `Story Elements:\n${JSON.stringify(brainstorm, null, 2)}` : null,
    weights ? `Prose Weighting:\n${Object.entries(weights).map(([k, v]) => `${k}: ${v}%`).join("\n")}` : null,
  ].filter(Boolean).join("\n\n");

  const prompt = `
You are a creative writing assistant. Given the following story data, write a short, engaging opening scene.

Honor the tone, point of view, and weighting instructions below. Let your writing reflect the percentage balance of narrative focus.

${elements}

Write the scene:
  `;

  try {
    const result = await callLLM(prompt);
    console.log("\n📘 Generated Scene:\n");
    console.log(result);
  } catch (err) {
    console.error("💥 Failed to generate prose:", err.message);
  }
})();
