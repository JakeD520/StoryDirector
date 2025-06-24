// createProject.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storagePath = path.resolve(__dirname, "./storage");

async function createProject() {
  console.log("\n📁 StoryDirector: Create New Project\n");

  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is the name of your new story project?",
      validate: (input) => input.trim() !== "" || "Project name cannot be empty",
    },
  ]);

  const folderName = projectName.trim().toLowerCase().replace(/\s+/g, "-");
  const projectDir = path.join(storagePath, folderName);

  if (fs.existsSync(projectDir)) {
    console.log("⚠️  A project with this name already exists.");
    return;
  }

  fs.mkdirSync(projectDir, { recursive: true });
  fs.writeFileSync(path.join(projectDir, "metadata.json"), JSON.stringify({
    name: projectName.trim(),
    created: new Date().toISOString(),
  }, null, 2));

  fs.writeFileSync(path.join(projectDir, "notes.txt"), "# Notes\n\n");
  fs.writeFileSync(path.join(projectDir, "pitch.json"), "{}\n");

  console.log(`✅ Created project folder: /storage/${folderName}/`);
  console.log("📎 Added: metadata.json, notes.txt, pitch.json\n");
}

createProject();
