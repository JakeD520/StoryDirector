// worldbuilding.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🌍 StoryDirector: Worldbuilding Tool\n");

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
      message: "Which project is this worldbuilding entry for?",
      choices: projects,
    },
  ]);

  const worldDir = path.join(storagePath, selectedProject, "worldbuilding");
  if (!fs.existsSync(worldDir)) fs.mkdirSync(worldDir);

  const { topic } = await inquirer.prompt([
    {
      type: "input",
      name: "topic",
      message: "Enter a worldbuilding topic (e.g., Caelian Technology, Magic System):",
      validate: (input) => input.trim() !== "" || "Topic cannot be empty",
    },
  ]);

  const { description } = await inquirer.prompt([
    {
      type: "editor",
      name: "description",
      message: "Use the editor to write a detailed entry for this topic:",
    },
  ]);

  const entry = {
    topic,
    description,
  };

  const filename = path.join(worldDir, `${topic.replace(/\s+/g, "_")}.json`);
  fs.writeFileSync(filename, JSON.stringify(entry, null, 2));

  console.log(`\n✅ Worldbuilding entry saved to: storage/${selectedProject}/worldbuilding/${topic.replace(/\s+/g, "_")}.json\n`);
})();
