// expandChapterDraft.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { callLLM } from "./lib/openRouterClient.js";
import dotenv from "dotenv";
dotenv.config();

const storagePath = path.resolve("./storage");
const voiceGlossaryPath = path.resolve("./glossary/voiceGlossary.json");

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

function formatCharacterLine(c, glossary) {
  const voice = glossary[c.name] ? ` Voice Profile: ${JSON.stringify(glossary[c.name])}` : "";
  return `- ${c.name} (${c.age}, ${c.role}): ${c.personality}.${voice}`;
}

(async () => {
  console.log("\n🌬️ StoryDirector: Expand Chapter Blueprint into Prose\n");

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

  const blueprintPath = path.join(chaptersPath, selectedChapter, "chapterBlueprint.json");
  if (!fs.existsSync(blueprintPath)) {
    console.log("❌ No chapterBlueprint.json found. Run generateChapterBlueprint.js first.");
    return;
  }

  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, "utf8"));
  const voiceGlossary = fs.existsSync(voiceGlossaryPath)
    ? JSON.parse(fs.readFileSync(voiceGlossaryPath, "utf8"))
    : {};

  const outputPath = path.join(chaptersPath, selectedChapter, "chapterExpanded.txt");
  const summaries = (blueprint.segments || []).map(seg => seg.summary.trim()).filter(Boolean);
  const combinedSummary = summaries.join(" ");

  const tone = blueprint.metadata?.tone || "natural";
  const pov = blueprint.metadata?.pov || "third person";
  const tense = blueprint.metadata?.tense || "past";
  const weights = blueprint.weights || {};
  const readerExp = (blueprint.metadata?.readerExperience || []).join(", ");
  const characters = (blueprint.characters || []).map(c => formatCharacterLine(c, voiceGlossary)).join("\n");
  const location = blueprint.location || "unspecified location";
  const timeOfDay = blueprint.timeOfDay || "unspecified time";
  const purpose = blueprint.purpose || "general";
  const pacing = blueprint.pacing || "even";
  const genres = (blueprint.metadata?.genres || []).join(", ");
  const arc = blueprint.metadata?.storyArc || "unspecified arc";

  const header = `Chapter Blueprint Overview:\n- Title: ${blueprint.title}\n- Purpose: ${purpose}\n- Pacing: ${pacing}\n- Location: ${location}, ${timeOfDay}\n- Genres: ${genres}\n- Reader Experience: ${readerExp}\n- Story Arc: ${arc}\n\nCharacters:\n${characters}`;

  const styleNote = `Write in ${pov} ${tense} tense with a ${tone} tone.\nStyle should be ${describeWeights(weights)}. Use only the content provided. Do not invent or modify structure. Fully realize the blueprint exactly as presented. Expand to 6x original length.Maintain immersive flow.`;

  const prompt = `${header}\n\n${styleNote}\n\nStory Draft:\n"""\n${combinedSummary}\n"""`;

  console.log("🪄 Expanding story paragraph into prose...");
  const result = await callLLM(prompt);

  fs.writeFileSync(outputPath, result.trim(), "utf8");

  console.log(`\n✅ Expanded chapter saved to: ${outputPath}\n`);
})();
