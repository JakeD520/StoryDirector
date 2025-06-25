// generateChapter.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n📚 StoryDirector: Chapter Blueprint Generator\n");

  const projects = fs.readdirSync(storagePath).filter((name) => {
    return fs.statSync(path.join(storagePath, name)).isDirectory();
  });

  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message: "Select a project:",
      choices: projects,
    },
  ]);

  const chapterDir = path.join(storagePath, selectedProject, "chapters");
  const chapterFiles = fs.readdirSync(chapterDir).filter((f) => f.endsWith(".json"));

  const { selectedChapter } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedChapter",
      message: "Select a chapter to structure:",
      choices: chapterFiles.map((f) => f.replace(".json", "")),
    },
  ]);

  const chapterPath = path.join(chapterDir, `${selectedChapter}.json`);
  const chapterData = JSON.parse(fs.readFileSync(chapterPath, "utf8"));

  if (!chapterData.beats || chapterData.beats.length === 0) {
    console.log("⚠️  This chapter has no beats.");
    return;
  }

  const totalWordGoal = chapterData.beats.reduce((sum, beat) => {
    return sum + (typeof beat.wordCount === "number" ? beat.wordCount : 0);
  }, 0);

  const segments = chapterData.beats.map((beat, index) => {
    return {
      beats: [index],
      targetWords: typeof beat.wordCount === "number" ? beat.wordCount : 300,
      transitionHint: "Continue from the prior moment with appropriate tone."
    };
  });

  const blueprint = {
    summary: chapterData.summary,
    totalWordGoal,
    segments
  };

  const outputPath = path.join(chapterDir, selectedChapter, `chapterBlueprint.json`);
  const proseDir = path.join(chapterDir, selectedChapter);
  if (!fs.existsSync(proseDir)) fs.mkdirSync(proseDir);

  fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2));
  console.log(`\n✅ Blueprint created at: storage/${selectedProject}/chapters/${selectedChapter}/chapterBlueprint.json\n`);
})();

