// generateProseFromBlueprint.js
import "dotenv/config";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { callLLM } from "./lib/openRouterClient.js";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n📘 StoryDirector: Generate Prose from Chapter Blueprint\n");

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
  const proseOutputPath = path.join(chaptersPath, selectedChapter, "chapterProse.txt");

  let prose = "";
  let previousContext = "";

  for (let i = 0; i < blueprint.segments.length; i++) {
    const segment = blueprint.segments[i];

    const prompt = `You are writing a scene segment that is part of a continuous chapter narrative. Maintain continuity with previous segments and avoid resetting location or character states unless specified.\n\n` +
      `Chapter Title: ${blueprint.title}\n` +
      `Purpose: ${blueprint.purpose}\n` +
      `Pacing: ${blueprint.pacing}\n` +
      `Location: ${blueprint.location}, Time: ${blueprint.timeOfDay}\n\n` +
      `Setting Description: ${blueprint.setting?.description || "N/A"}\n` +
      `Tone: ${blueprint.tone?.label || "N/A"}\n\n` +
      `Characters: ${blueprint.characters?.map(c => c.name).join(", ")}\n` +
      `Voice Instructions: ${blueprint.characters?.map(c => `${c.name}: ${c.speakingStyle || "n/a"}`).join(" | ")}\n\n` +
      `Worldbuilding Context: ${blueprint.worldbuilding?.summary || "N/A"}\n\n` +
      (previousContext ? `Previous Segment Context:\n${previousContext}\n\n` : "") +
      `Current Segment ${i + 1}/${blueprint.segments.length}:\n` +
      `Summary: ${segment.summary}\n` +
      `Target Word Count: ${segment.wordCount}\n\n` +
      `The goal is open-endedness at the beat level, meaning that each small interaction should lead into the next without being neatly tied up or emotionally resolved.`;

    console.log(`\n✏️ Generating prose for segment ${i + 1}/${blueprint.segments.length}...`);
    const segmentText = await callLLM(prompt);
    prose += `\n\n--- Segment ${i + 1} ---\n\n${segmentText.trim()}`;
    previousContext = segmentText.trim();
  }

  fs.writeFileSync(proseOutputPath, prose);
  console.log(`\n✅ Full chapter prose saved to: ${proseOutputPath}\n`);
})();
