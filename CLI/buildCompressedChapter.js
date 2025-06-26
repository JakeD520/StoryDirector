// buildScriptCompression.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { callLLM } from "./lib/openRouterClient.js";
import dotenv from "dotenv";
dotenv.config();

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🎬 StoryDirector: Compress Chapter as Script Draft\n");

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
  const segments = blueprint.beats || blueprint.segments || [];
  const cast = (blueprint.characters || []).map(c => c.name).join(", ");

  const scriptBlocks = [];

  for (let i = 0; i < segments.length; i++) {
    const summary = segments[i].summary.trim();
    const location = segments[i].location || blueprint.location || "unspecified";
    const timeOfDay = segments[i].timeOfDay || blueprint.timeOfDay || "unspecified";

    const prompt = `Convert the following story beat into screenplay format.\n\nIMPORTANT CONSTRAINTS:\n- Do NOT invent new characters.\n- Do NOT rename characters.\n- Do NOT change location or time.\n- Do NOT move characters to a new setting.\n- Do NOT add dialog or props not directly implied by the summary.\n- Use only the characters listed: ${cast}.\n- Keep all dialogue and action inside the stated setting.\n\nScene: EXT. ${location.toUpperCase()} - ${timeOfDay.toUpperCase()}\nBeat ${i + 1} Summary:\n${summary}`;

    console.log(`🎬 Compressing beat ${i + 1}/${segments.length} as script...`);
    const result = await callLLM(prompt);
    scriptBlocks.push(result.trim());
  }

  const outputPath = path.join(chaptersPath, selectedChapter, "chapterScript.txt");
  fs.writeFileSync(outputPath, scriptBlocks.join("\n\n"), "utf8");

  console.log(`\n✅ Script-style compressed chapter saved to: ${outputPath}\n`);
})();
