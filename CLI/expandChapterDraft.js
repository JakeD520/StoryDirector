// expandScriptToProse.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { callLLM } from "./lib/openRouterClient.js";
import dotenv from "dotenv";
dotenv.config();

const storagePath = path.resolve("./storage");

function describeWeights(weights) {
  const descriptors = {
    "Internal Thoughts": "introspective and layered with character reflection",
    "Action / Movement": "visually grounded with physical interaction",
    "Dialogue": "rich in spoken exchange and character voice",
    "Worldbuilding": "woven with setting and lore details",
    "Visual Imagery": "sensory-driven with vivid description",
    "Description / Sensory Detail": "rich with tactile and emotional texture"
  };

  return Object.entries(weights || {})
    .filter(([k, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => descriptors[k])
    .slice(0, 3)
    .join(", ");
}

(async () => {
  console.log("\n🎬 StoryDirector: Expand Script to Prose\n");

  const projects = fs.readdirSync(storagePath).filter(name =>
    fs.statSync(path.join(storagePath, name)).isDirectory()
  );

  const { selectedProject } = await inquirer.prompt({
    type: "list",
    name: "selectedProject",
    message: "Select a project:",
    choices: projects
  });

  const chaptersPath = path.join(storagePath, selectedProject, "chapters");
  const chapterDirs = fs.readdirSync(chaptersPath).filter(name =>
    fs.statSync(path.join(chaptersPath, name)).isDirectory()
  );

  const { selectedChapter } = await inquirer.prompt({
    type: "list",
    name: "selectedChapter",
    message: "Select a chapter:",
    choices: chapterDirs
  });

  const scriptPath = path.join(chaptersPath, selectedChapter, "chapterScript.txt");
  const blueprintPath = path.join(chaptersPath, selectedChapter, "chapterBlueprint.json");

  if (!fs.existsSync(scriptPath)) {
    console.log("❌ No chapterScript.txt found. Run buildScriptCompression.js first.");
    return;
  }

  const rawScript = fs.readFileSync(scriptPath, "utf8").trim();
  const scenes = rawScript.split(/\n\s*---\s*\n/); // split by ---

  let expanded = "";

  const blueprint = fs.existsSync(blueprintPath)
    ? JSON.parse(fs.readFileSync(blueprintPath, "utf8"))
    : {};

  const tone = blueprint.metadata?.tone || "natural";
  const pov = blueprint.metadata?.pov || "third person";
  const tense = blueprint.metadata?.tense || "past";
  const weights = blueprint.weights || {};

  const styleNote = `Convert the following screenplay scene into rich narrative prose.\nUse ${pov} ${tense} tense with a ${tone} tone.\nStyle should be ${describeWeights(weights)}.\nPreserve location, time, and character actions. Do not invent new events or resolve story arcs.`;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    const prompt = `${styleNote}\n\nScreenplay Scene:\n"""\n${scene}\n"""`;

    console.log(`🪄 Expanding scene ${i + 1}/${scenes.length}...`);
    const result = await callLLM(prompt);
    expanded += result.trim() + "\n\n";
  }

  const outputPath = path.join(chaptersPath, selectedChapter, "chapterExpanded.txt");
  fs.writeFileSync(outputPath, expanded.trim(), "utf8");

  console.log(`\n✅ Expanded chapter saved to: ${outputPath}\n`);
})();
