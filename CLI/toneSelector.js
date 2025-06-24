// toneSelector.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

const tones = [
  "Dark",
  "Light",
  "Hopeful",
  "Melancholy",
  "Absurd",
  "Tense",
  "Playful",
  "Cynical",
  "Whimsical",
  "Tragic",
  "Bittersweet",
  "Animated",
  "Other (Create New Tone)"
];

(async () => {
  console.log("\n🎭 StoryDirector: Tone Selector\n");

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
      message: "Which project do you want to assign a tone to?",
      choices: projects,
    },
  ]);

  const metadataPath = path.join(storagePath, selectedProject, "metadata.json");
  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    : {};

  let toneChoices = [...tones];
  let finalTone = metadata.tone || "";
  let selecting = true;

  while (selecting) {
    const { selectedTone } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedTone",
        message: "Choose a tone for this story:",
        choices: toneChoices,
        default: finalTone,
      },
    ]);

    if (selectedTone === "Other (Create New Tone)") {
      const { newTone } = await inquirer.prompt([
        {
          type: "input",
          name: "newTone",
          message: "Enter your custom tone:",
          validate: (input) => input.trim() !== "" || "Tone cannot be empty",
        },
      ]);

      const trimmed = newTone.trim();
      toneChoices = toneChoices.filter((t) => t !== "Other (Create New Tone)");
      if (!toneChoices.includes(trimmed)) {
        toneChoices.push(trimmed);
      }
      toneChoices.push("Other (Create New Tone)");
      finalTone = trimmed;
    } else {
      finalTone = selectedTone;
      selecting = false;
    }
  }

  metadata.tone = finalTone;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n💾 Tone saved to: storage/${selectedProject}/metadata.json\n`);
})();
