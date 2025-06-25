// buildChapter.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { callLLM } from "./lib/openRouterClient.js";
import dotenv from "dotenv";
dotenv.config();

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n📚 StoryDirector: Build Full Chapter\n");

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
  const prosePath = path.join(chaptersPath, selectedChapter, "chapterDraft.txt");

  let fullProse = "";

  for (let i = 0; i < blueprint.segments.length; i++) {
    const beat = blueprint.segments[i];
    const previousText = fullProse.trim();

    let prompt = "";
    if (i === 0) {
      prompt = `Begin the chapter using this summary:\n\n${beat.summary}\n\nWrite a flowing narrative. Do not summarize.`;
    } else {
      const lastParagraph = previousText.split(/\n{2,}/).pop();
      prompt = `Here's the last paragraph of the current draft:\n\n${lastParagraph}\n\nRewrite that paragraph and continues the chapter using this summary:\n\n${beat.summary}\n\nKeep the momentum. No need to wrap up or reset.`;
    }

    console.log(`✏️ Processing segment ${i + 1}/${blueprint.segments.length}...`);
    const result = await callLLM(prompt);

    fullProse += (i === 0 ? "" : "\n\n") + result.trim();
    fs.writeFileSync(prosePath, fullProse);
  }

  console.log(`\n✅ Chapter draft saved to: ${prosePath}\n`);
})();
