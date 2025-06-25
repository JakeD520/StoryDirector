// reorderBeats.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🧩 StoryDirector: Reorder Chapter Beats\n");

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
      message: "Select a chapter:",
      choices: chapterFiles.map((f) => f.replace(".json", "")),
    },
  ]);

  const chapterPath = path.join(chapterDir, `${selectedChapter}.json`);
  const chapterData = JSON.parse(fs.readFileSync(chapterPath, "utf8"));

  if (!chapterData.beats || chapterData.beats.length === 0) {
    console.log("⚠️  This chapter has no beats to reorder.");
    return;
  }

  console.log("\nCurrent beat order:");
  chapterData.beats.forEach((beat, idx) => {
    const summary = beat.purpose?.split("\n")[0]?.slice(0, 60) || "(no description)";
    console.log(`[${idx + 1}] ${beat.mood} | ${beat.pacing} | ${summary}`);
  });

  const { newOrder } = await inquirer.prompt([
    {
      type: "input",
      name: "newOrder",
      message: "Enter new order (e.g. 3,1,2):",
      validate: input => {
        const parts = input.split(",").map(n => parseInt(n.trim()));
        const isValid = parts.length === chapterData.beats.length && parts.every(n => n > 0 && n <= chapterData.beats.length);
        return isValid ? true : "Invalid order. Use comma-separated values like 2,1,3";
      },
    },
  ]);

  const order = newOrder.split(",").map(n => parseInt(n.trim()) - 1);
  const reordered = order.map(index => chapterData.beats[index]);
  chapterData.beats = reordered;

  fs.writeFileSync(chapterPath, JSON.stringify(chapterData, null, 2));
  console.log(`\n✅ Beat order updated in: storage/${selectedProject}/chapters/${selectedChapter}.json\n`);
})();
