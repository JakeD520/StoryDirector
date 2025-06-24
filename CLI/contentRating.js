// contentWeighting.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const categories = [
  "Internal Thoughts",
  "Action / Movement",
  "Dialogue",
  "Worldbuilding",
  "Visual Imagery",
  "Description / Sensory Detail"
];

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n📊 StoryDirector: Content Weighting Tool\n");

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
      message: "Which project do you want to assign content weighting to?",
      choices: projects,
    },
  ]);

  console.log("Assign a percentage (0–100) to each narrative mode. Total must equal 100%.\n");

  const weights = {};
  let total = 0;

  for (const category of categories) {
    const { value } = await inquirer.prompt([
      {
        type: "input",
        name: "value",
        message: `${category}:`,
        validate: (input) => {
          const num = parseInt(input, 10);
          return (num >= 0 && num <= 100) || "Please enter a number between 0 and 100.";
        },
        filter: (input) => parseInt(input, 10),
      },
    ]);

    weights[category] = value;
    total += value;
  }

  console.log(`\n📦 Total: ${total}%`);
  if (total !== 100) {
    console.log("❌ Total must equal 100%. Please try again.");
    process.exit(1);
  }

  const weightPath = path.join(storagePath, selectedProject, "weights.json");
  fs.writeFileSync(weightPath, JSON.stringify(weights, null, 2));
  console.log(`✅ Weights saved to: storage/${selectedProject}/weights.json\n`);
})();
