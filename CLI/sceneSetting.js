// sceneSetting.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🎬 StoryDirector: Scene Setting Builder\n");

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
      message: "Which project is this setting for?",
      choices: projects,
    },
  ]);

  const settingsDir = path.join(storagePath, selectedProject, "settings");
  if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir);

  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter a setting name:",
      validate: (input) => input.trim() !== "" || "Name cannot be empty",
    },
  ]);

  const { description } = await inquirer.prompt([
    {
      type: "editor",
      name: "description",
      message: "Use the editor to describe the setting in full detail:",
    },
  ]);

  const setting = {
    name,
    description,
  };

  const filename = path.join(settingsDir, `${name.replace(/\s+/g, "_")}.json`);
  fs.writeFileSync(filename, JSON.stringify(setting, null, 2));

  console.log(`\n✅ Setting saved to: storage/${selectedProject}/settings/${name.replace(/\s+/g, "_")}.json\n`);
})();
