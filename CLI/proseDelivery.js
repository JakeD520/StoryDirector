// proseDelivery.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

const POV_OPTIONS = [
  "First Person",
  "Second Person",
  "Third Person Limited",
  "Third Person Omniscient",
  "Narrator",
  "Other (Create Custom POV)"
];

const TENSE_OPTIONS = [
  "Past Tense",
  "Present Tense",
  "Other (Create Custom Tense)"
];

(async () => {
  console.log("\n📚 StoryDirector: Prose Delivery Selector\n");

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
      message: "Which project do you want to set prose delivery for?",
      choices: projects,
    },
  ]);

  const metadataPath = path.join(storagePath, selectedProject, "metadata.json");
  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    : {};

  // POV selection
  let povChoices = [...POV_OPTIONS];
  let pov = metadata.pov || "";
  let selectingPOV = true;

  while (selectingPOV) {
    const { selectedPOV } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedPOV",
        message: "Select the point of view:",
        choices: povChoices,
        default: pov,
      },
    ]);

    if (selectedPOV === "Other (Create Custom POV)") {
      const { customPOV } = await inquirer.prompt([
        {
          type: "input",
          name: "customPOV",
          message: "Enter your custom point of view:",
          validate: (input) => input.trim() !== "" || "POV cannot be empty",
        },
      ]);

      const trimmed = customPOV.trim();
      povChoices = povChoices.filter((p) => p !== "Other (Create Custom POV)");
      if (!povChoices.includes(trimmed)) {
        povChoices.push(trimmed);
      }
      povChoices.push("Other (Create Custom POV)");
      pov = trimmed;
    } else {
      pov = selectedPOV;
      selectingPOV = false;
    }
  }

  // Tense selection
  let tenseChoices = [...TENSE_OPTIONS];
  let tense = metadata.tense || "";
  let selectingTense = true;

  while (selectingTense) {
    const { selectedTense } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedTense",
        message: "Select the narrative tense:",
        choices: tenseChoices,
        default: tense,
      },
    ]);

    if (selectedTense === "Other (Create Custom Tense)") {
      const { customTense } = await inquirer.prompt([
        {
          type: "input",
          name: "customTense",
          message: "Enter your custom tense:",
          validate: (input) => input.trim() !== "" || "Tense cannot be empty",
        },
      ]);

      const trimmed = customTense.trim();
      tenseChoices = tenseChoices.filter((t) => t !== "Other (Create Custom Tense)");
      if (!tenseChoices.includes(trimmed)) {
        tenseChoices.push(trimmed);
      }
      tenseChoices.push("Other (Create Custom Tense)");
      tense = trimmed;
    } else {
      tense = selectedTense;
      selectingTense = false;
    }
  }

  metadata.pov = pov;
  metadata.tense = tense;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n💾 Prose delivery saved to: storage/${selectedProject}/metadata.json\n`);
})();
