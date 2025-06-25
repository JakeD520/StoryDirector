// generateChapterBlueprint.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🧠 StoryDirector: Generate Chapter Blueprint\n");

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

  const chapterPath = path.join(chaptersPath, `${selectedChapter}.json`);
  const settingDir = path.join(storagePath, selectedProject, "settings");
  const settingFile = fs.readdirSync(settingDir).find(f => f.toLowerCase().includes(chapterPath.split(path.sep).pop().replace(".json", "").toLowerCase()));
  const settingPath = settingFile ? path.join(settingDir, settingFile) : null;
  const worldPath = path.join(storagePath, selectedProject, "worldbuilding.json");
  const canonPath = path.join(storagePath, selectedProject, "canon.json");
  const metadataPath = path.join(storagePath, selectedProject, "metadata.json");
  const weightsPath = path.join(storagePath, selectedProject, "weights.json");
  const charactersDir = path.join(storagePath, selectedProject, "characters");

  const chapter = JSON.parse(fs.readFileSync(chapterPath, "utf8"));
  const setting = settingPath && fs.existsSync(settingPath) ? JSON.parse(fs.readFileSync(settingPath, "utf8")) : {};
  const worldbuilding = fs.existsSync(worldPath) ? JSON.parse(fs.readFileSync(worldPath, "utf8")) : {};
  const canon = fs.existsSync(canonPath) ? JSON.parse(fs.readFileSync(canonPath, "utf8")) : {};
  const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf8")) : {};
  const weights = fs.existsSync(weightsPath) ? JSON.parse(fs.readFileSync(weightsPath, "utf8")) : {};

  const characters = chapter.characters.map(name => {
    const charPath = path.join(charactersDir, `${name}.json`);
    return fs.existsSync(charPath) ? JSON.parse(fs.readFileSync(charPath, "utf8")) : { name };
  });

  const blueprint = {
    title: chapter.title,
    summary: chapter.summary,
    purpose: chapter.purpose,
    pacing: chapter.pacing,
    location: chapter.location,
    timeOfDay: chapter.timeOfDay,
    setting,
    worldbuilding,
    canon,
    metadata,
    weights,
    characters,
    segments: chapter.beats.map(beat => ({
      summary: beat.summary,
      wordCount: beat.wordCount
    }))
  };

  const blueprintPath = path.join(chaptersPath, selectedChapter, "chapterBlueprint.json");
  fs.writeFileSync(blueprintPath, JSON.stringify(blueprint, null, 2));

  console.log(`\n✅ Chapter blueprint created at: ${blueprintPath}\n`);
})();
