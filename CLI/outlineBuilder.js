// outlineBuilder.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

(async () => {
  console.log("\n🗂️ StoryDirector: Outline Builder\n");

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
      message: "Which project is this outline for?",
      choices: projects,
    },
  ]);

  const outlinePath = path.join(storagePath, selectedProject, "outline.json");
  let outline = [];

  if (fs.existsSync(outlinePath)) {
    const { loadExisting } = await inquirer.prompt([
      {
        type: "confirm",
        name: "loadExisting",
        message: "An outline already exists. Do you want to edit it?",
        default: true,
      },
    ]);
    if (loadExisting) {
      outline = JSON.parse(fs.readFileSync(outlinePath, "utf8"));
    }
  }

  let addMoreSections = true;
  while (addMoreSections) {
    const { sectionTitle } = await inquirer.prompt([
      { type: "input", name: "sectionTitle", message: "Enter section title:" },
    ]);

    const beats = [];
    let addMoreBeats = true;
    while (addMoreBeats) {
      const { beatTitle, beatDescription } = await inquirer.prompt([
        { type: "input", name: "beatTitle", message: "Enter beat title:" },
        { type: "editor", name: "beatDescription", message: "Enter beat description:" },
      ]);
      beats.push({ title: beatTitle, description: beatDescription });

      const { moreBeats } = await inquirer.prompt([
        { type: "confirm", name: "moreBeats", message: "Add another beat to this section?", default: true },
      ]);
      addMoreBeats = moreBeats;
    }

    outline.push({ section: sectionTitle, beats });

    const { moreSections } = await inquirer.prompt([
      { type: "confirm", name: "moreSections", message: "Add another section?", default: true },
    ]);
    addMoreSections = moreSections;
  }

  fs.writeFileSync(outlinePath, JSON.stringify(outline, null, 2));
  console.log(`\n✅ Outline saved to: storage/${selectedProject}/outline.json\n`);
})();
