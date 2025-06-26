// brainstorm.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

(async () => {
  console.log("\n🧠 StoryDirector: Brainstorm Organizer\n");

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
      message: "Which project would you like to brainstorm?",
      choices: projects,
    },
  ]);

  const pitchPath = path.join(storagePath, selectedProject, "pitch.json");
  const brainstormPath = path.join(storagePath, selectedProject, "brainstorm.json");

  if (!fs.existsSync(pitchPath)) {
    console.log("❌ No pitch.json found. Run pitch.js first.");
    return;
  }

  const { structured } = JSON.parse(fs.readFileSync(pitchPath, "utf8"));
  const sections = structured.match(/\*\*.+?\*\*[\s\S]+?(?=(\*\*|$))/g);
  const brainstorm = {};

  for (const section of sections) {
    const [titleLine, ...lines] = section.trim().split("\n");
    const key = titleLine.replace(/\*\*/g, "").trim();
    const values = lines.map((l) => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean);

    let editing = true;
    const updated = [...values];

    while (editing) {
      console.log(`\n🔹 ${key}:`);
      updated.forEach((item, idx) => console.log(`  [${idx + 1}] ${item}`));

      const { action } = await inquirer.prompt([
        {
          type: "input",
          name: "action",
          message: "Type number to remove, 'add [text]', or hit Enter to continue:",
        },
      ]);
      
      if (!action) break;

      if (/^\d+$/.test(action)) {
        const index = parseInt(action, 10) - 1;
        if (index >= 0 && index < updated.length) {
          updated.splice(index, 1);
        }
      } else if (action.toLowerCase().startsWith("add ")) {
        const newItem = action.slice(4).trim();
        if (newItem) updated.push(newItem);
      }
    }

    brainstorm[key] = updated;
  }

  fs.writeFileSync(brainstormPath, JSON.stringify(brainstorm, null, 2));
  console.log(`\n💾 Brainstorm saved to: storage/${selectedProject}/brainstorm.json\n`);
})();
