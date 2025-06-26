// buildChapter.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { callLLM } from "./lib/openRouterClient.js";
import dotenv from "dotenv";
dotenv.config();

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n📚 StoryDirector: Build Full Chapter from Beat Summaries\n");

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
    console.log("❌ No blueprint found. Run generateChapterBlueprint.js first.");
    return;
  }

  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, "utf8"));
  const segments = blueprint.segments || [];

  if (segments.length === 0) {
    console.log("⚠️  No beat summaries found in blueprint.");
    return;
  }

  const beatList = segments
    .map((seg, i) => `Beat ${i + 1}:\n${seg.summary.trim()}`)
    .join("\n\n");

  const tone = blueprint.metadata?.tone || "natural";
  const pov = blueprint.metadata?.pov || "third person";
  const tense = blueprint.metadata?.tense || "past";

  const prompt = `
You are writing a full-length story chapter made up of connected beats.
Do not resolve character arcs until the end. Maintain narrative tension and forward motion throughout.

Each beat flows naturally into the next. Avoid summarizing or concluding early.
Use third-person, ${tense.toLowerCase()} tense. Match the tone: ${tone}.
POV: ${pov}

Here is the beat list for the chapter:

${beatList}

Write the full chapter as continuous narrative prose based on the above.
`;

  console.log("📨 Sending full chapter prompt to LLM...");
  const result = await callLLM(prompt);

  const outputPath = path.join(chaptersPath, selectedChapter, "chapter.txt");
  fs.writeFileSync(outputPath, result.trim(), "utf8");

  console.log(`\n✅ Full chapter saved to: ${outputPath}\n`);
})();
