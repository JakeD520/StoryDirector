// narrativeCanon.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n📜 StoryDirector: Narrative Canon Builder\n");

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
      message: "Which project do you want to define canon for?",
      choices: projects,
    },
  ]);

  const canonPath = path.join(storagePath, selectedProject, "canon.json");
  const existing = fs.existsSync(canonPath)
    ? JSON.parse(fs.readFileSync(canonPath, "utf8"))
    : {};

  let done = false;

  while (!done) {
    const { topic } = await inquirer.prompt([
      {
        type: "input",
        name: "topic",
        message: "What is this canon entry about? (e.g. Deities, Time, Cosmic)",
        validate: (input) => input.trim() !== "" || "Topic cannot be empty",
      },
    ]);

    const { truth } = await inquirer.prompt([
      {
        type: "input",
        name: "truth",
        message: `Define the immutable truth about '${topic}':`,
        validate: (input) => input.trim() !== "" || "Canon statement cannot be empty",
      },
    ]);

    existing[topic] = truth;

    const { again } = await inquirer.prompt([
      {
        type: "confirm",
        name: "again",
        message: "Add another canon entry?",
        default: true,
      },
    ]);

    done = !again;
  }

  fs.writeFileSync(canonPath, JSON.stringify(existing, null, 2));
  console.log(`\n✅ Canon saved to: storage/${selectedProject}/canon.json\n`);
})();
