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
  const canonPath = path.join(storagePath, selectedProject, "canon.json");
  const charactersPath = path.join(storagePath, selectedProject, "characters");
  const settingsPath = path.join(storagePath, selectedProject, "settings");
  const worldbuildingPath = path.join(storagePath, selectedProject, "worldbuilding");
  const outlinePath = path.join(storagePath, selectedProject, "outline.json");

  const metadata = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
  const pitchData = fs.existsSync(pitchPath) ? JSON.parse(fs.readFileSync(pitchPath, "utf8")) : {};
  const brainstorm = fs.existsSync(brainstormPath) ? JSON.parse(fs.readFileSync(brainstormPath, "utf8")) : {};
  const weights = fs.existsSync(weightPath) ? JSON.parse(fs.readFileSync(weightPath, "utf8")) : null;
  const canon = fs.existsSync(canonPath) ? JSON.parse(fs.readFileSync(canonPath, "utf8")) : null;

  let characterSummaries = "";
  if (fs.existsSync(charactersPath)) {
    const charFiles = fs.readdirSync(charactersPath).filter(f => f.endsWith(".json"));
    const characters = charFiles.map(file => JSON.parse(fs.readFileSync(path.join(charactersPath, file), "utf8")));
    characterSummaries = characters.map(char => {
      return `Character: ${char.name} (${char.role})\nGender: ${char.gender}\nOrigin: ${char.origin}\nAge: ${char.age}\n\nAppearance: ${char.appearance}\n\nPersonality: ${char.personality}\n\nSpeaking Style: ${char.speakingStyle}`;
    }).join("\n\n---\n\n");
  }

  let settingSummary = "";
  if (fs.existsSync(settingsPath)) {
    const settingFiles = fs.readdirSync(settingsPath).filter(f => f.endsWith(".json"));
    if (settingFiles.length > 0) {
      const { selectedSetting } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedSetting",
          message: "Choose a setting for this scene:",
          choices: settingFiles.map(f => f.replace(".json", ""))
        }
      ]);
      const settingData = JSON.parse(fs.readFileSync(path.join(settingsPath, `${selectedSetting}.json`), "utf8"));
      settingSummary = `Setting: ${settingData.name}\n\n${settingData.description}`;
    }
  }

  let worldbuildingSummary = "";
  if (fs.existsSync(worldbuildingPath)) {
    const worldFiles = fs.readdirSync(worldbuildingPath).filter(f => f.endsWith(".json"));
    if (worldFiles.length > 0) {
      const { selectedWorld } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedWorld",
          message: "Choose a worldbuilding entry to include:",
          choices: worldFiles.map(f => f.replace(".json", ""))
        }
      ]);
      const worldData = JSON.parse(fs.readFileSync(path.join(worldbuildingPath, `${selectedWorld}.json`), "utf8"));
      worldbuildingSummary = `Worldbuilding Topic: ${worldData.topic}\n\n${worldData.description}`;
    }
  }

  let outlineSummary = "";
  if (fs.existsSync(outlinePath)) {
    const outlineData = JSON.parse(fs.readFileSync(outlinePath, "utf8"));
    outlineSummary = "Outline:\n" + outlineData.map(section => {
      const beats = section.beats.map(beat => `• ${beat.title}: ${beat.description}`).join("\n");
      return `\n${section.section}:\n${beats}`;
    }).join("\n\n");
  }

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
    canon ? `Narrative Canon:\n${Object.entries(canon).map(([k, v]) => `${k}: ${v}`).join("\n")}` : null,
    characterSummaries ? `Character Profiles:\n${characterSummaries}` : null,
    settingSummary ? `Scene Setting:\n${settingSummary}` : null,
    worldbuildingSummary ? `Worldbuilding:\n${worldbuildingSummary}` : null,
    outlineSummary ? `${outlineSummary}` : null,
  ].filter(Boolean).join("\n\n");

  const prompt = `
You are a creative writing assistant. Given the following story data, write a short, engaging opening scene.

Honor the tone, point of view, and weighting instructions below. Let your writing reflect the percentage balance of narrative focus.
Respect the immutable truths of the story world as listed under 'Narrative Canon'.
Use the following character, setting, and worldbuilding information to ensure consistency of voice, behavior, and scene grounding.
Use the provided story outline to inform the structure and narrative direction.

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
