// readerExperience.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

let experiences = [
  "Thought-provoking",
  "Philosophical",
  "Introspective",
  "Cathartic",
  "Heartwarming",
  "Bittersweet",
  "Soul-crushing",
  "Hopeful",
  "Immersive",
  "Atmospheric",
  "Lyrical",
  "Surreal",
  "Visceral",
  "Tense",
  "Melancholic",
  "Whimsical",
  "Humorous",
  "Playful",
  "Page-turner",
  "Meditative",
  "Amusing",
  "Unsettling",
  "Satisfying",
  "Other (Create New Experience)"
];

(async () => {
  console.log("\n🧠 StoryDirector: Reader Experience Selector\n");

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
      message: "Which project do you want to assign reader experiences to?",
      choices: projects,
    },
  ]);

  const metadataPath = path.join(storagePath, selectedProject, "metadata.json");
  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    : {};

  let done = false;
  let finalExperiences = metadata.readerExperience || [];

  while (!done) {
    const { selectedExperiences } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedExperiences",
        message: "Select one or more desired reader experiences:",
        choices: experiences,
        default: finalExperiences,
      },
    ]);

    if (selectedExperiences.includes("Other (Create New Experience)")) {
      const { newExperience } = await inquirer.prompt([
        {
          type: "input",
          name: "newExperience",
          message: "Enter your custom reader experience:",
          validate: (input) => input.trim() !== "" || "Experience cannot be empty",
        },
      ]);

      const trimmed = newExperience.trim();
      experiences = experiences.filter((e) => e !== "Other (Create New Experience)");
      if (!experiences.includes(trimmed)) {
        experiences.push(trimmed);
      }
      experiences.push("Other (Create New Experience)");
      finalExperiences = selectedExperiences.filter(e => e !== "Other (Create New Experience)");
      finalExperiences.push(trimmed);
    } else {
      finalExperiences = selectedExperiences;
      done = true;
    }
  }

  metadata.readerExperience = finalExperiences;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n💾 Reader experience saved to: storage/${selectedProject}/metadata.json\n`);
})();
