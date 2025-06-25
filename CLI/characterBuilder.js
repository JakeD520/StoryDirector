// characterBuilder.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🧬 StoryDirector: Character Builder\n");

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
      message: "Which project is this character for?",
      choices: projects,
    },
  ]);

  const characterDir = path.join(storagePath, selectedProject, "characters");
  if (!fs.existsSync(characterDir)) fs.mkdirSync(characterDir);

  const { name, age, gender, origin, role } = await inquirer.prompt([
    { type: "input", name: "name", message: "Character name:" },
    { type: "input", name: "age", message: "Age or age range:" },
    { type: "input", name: "gender", message: "Gender or gender identity:" },
    { type: "input", name: "origin", message: "Species or origin:" },
    { type: "input", name: "role", message: "Narrative role (e.g., Protagonist, Foil):" }
  ]);

  const { appearance, personality, speakingStyle } = await inquirer.prompt([
    {
      type: "editor",
      name: "appearance",
      message: "Describe the character's appearance and physical demeanor:",
    },
    {
      type: "editor",
      name: "personality",
      message: "Describe the character's core personality and worldview:",
    },
    {
      type: "editor",
      name: "speakingStyle",
      message: "Describe how this character speaks, mocks, jokes, deflects, persuades:",
    }
  ]);

  const character = {
    name,
    age,
    gender,
    origin,
    role,
    appearance,
    personality,
    speakingStyle,
    voiceFormula: "DEFINED IN SEPARATE MODULE"
  };

  const filename = path.join(characterDir, `${name.replace(/\s+/g, "_")}.json`);
  fs.writeFileSync(filename, JSON.stringify(character, null, 2));
  console.log(`\n✅ Character saved to: storage/${selectedProject}/characters/${name.replace(/\s+/g, "_")}.json\n`);
})();
