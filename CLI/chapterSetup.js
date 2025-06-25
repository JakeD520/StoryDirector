// chapterSetup.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n📖 StoryDirector: Chapter Setup Tool\n");

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
      message: "Which project is this chapter for?",
      choices: projects,
    },
  ]);

  const charactersPath = path.join(storagePath, selectedProject, "characters");
  const settingsPath = path.join(storagePath, selectedProject, "settings");
  const chaptersPath = path.join(storagePath, selectedProject, "chapters");

  if (!fs.existsSync(chaptersPath)) fs.mkdirSync(chaptersPath);

  const availableCharacters = fs.existsSync(charactersPath)
    ? fs.readdirSync(charactersPath).map((f) => f.replace(".json", ""))
    : [];

  const availableSettings = fs.existsSync(settingsPath)
    ? fs.readdirSync(settingsPath).map((f) => f.replace(".json", ""))
    : [];

  const { chapterTitle, purpose, pacing, location, timeOfDay, summary, characters, setting } = await inquirer.prompt([
    {
      type: "input",
      name: "chapterTitle",
      message: "Enter the chapter title:",
    },
    {
      type: "list",
      name: "purpose",
      message: "What is the purpose of this chapter?",
      choices: ["understanding", "growth", "conflict", "foreshadowing", "transition"],
    },
    {
      type: "list",
      name: "pacing",
      message: "Select overall pacing:",
      choices: ["slow build", "steady", "accelerating", "intense", "climactic"],
    },
    {
      type: "list",
      name: "location",
      message: "Is the chapter set indoors or outdoors?",
      choices: ["interior", "exterior"],
    },
    {
      type: "list",
      name: "timeOfDay",
      message: "When does the chapter take place?",
      choices: ["morning", "day", "pre dusk", "evening", "late night"],
    },
    {
      type: "checkbox",
      name: "characters",
      message: "Select characters in this chapter:",
      choices: availableCharacters,
      when: () => availableCharacters.length > 0,
    },
    {
      type: "list",
      name: "setting",
      message: "Select the setting for this chapter:",
      choices: availableSettings,
      when: () => availableSettings.length > 0,
    },
    {
      type: "editor",
      name: "summary",
      message: "Write a brief summary for the chapter:",
    },
  ]);

  const chapterData = {
    title: chapterTitle,
    purpose,
    pacing,
    location,
    timeOfDay,
    characters: characters || [],
    setting: setting || null,
    summary,
    beats: []
  };

  const safeFilename = chapterTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filePath = path.join(chaptersPath, `${safeFilename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(chapterData, null, 2));

  console.log(`\n✅ Chapter saved to: storage/${selectedProject}/chapters/${safeFilename}.json\n`);
})();
