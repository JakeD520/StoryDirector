// beatBriefing.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🎬 StoryDirector: Beat Briefing Tool\n");

  const projects = fs.readdirSync(storagePath).filter((name) => {
    const fullPath = path.join(storagePath, name);
    return fs.statSync(fullPath).isDirectory();
  });

  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message: "Select a project:",
      choices: projects,
    },
  ]);

  const chaptersPath = path.join(storagePath, selectedProject, "chapters");
  const chapterFiles = fs.readdirSync(chaptersPath).filter(f => f.endsWith(".json"));

  const { selectedChapter } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedChapter",
      message: "Select a chapter:",
      choices: chapterFiles.map(f => f.replace(".json", "")),
    },
  ]);

  const filePath = path.join(chaptersPath, `${selectedChapter}.json`);
  const chapter = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const addMoreBeats = async () => {
    const { summary, wordCount } = await inquirer.prompt([
      {
        type: "editor",
        name: "summary",
        message: "Describe what happens in this beat:",
      },
      {
        type: "number",
        name: "wordCount",
        message: "Target word count:",
        default: 300,
      }
    ]);

    chapter.beats.push({ summary, wordCount });

    const { again } = await inquirer.prompt([
      {
        type: "confirm",
        name: "again",
        message: "Add another beat?",
        default: true,
      },
    ]);

    if (again) await addMoreBeats();
  };

  await addMoreBeats();

  fs.writeFileSync(filePath, JSON.stringify(chapter, null, 2));
  console.log("\n✅ Beats updated and saved.\n");
})();
