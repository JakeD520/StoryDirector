// createVoice.js (patched to update existing characters)
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

const coreElements = [
  "Rh", "Co", "Fr", "Dx", "Ch", "Rp",
  "Sf", "El", "Cp", "Sb", "Pm", "Im", "An", "Mt", "Md",
  "Ph", "Rg", "Iv", "Sa", "Cs", "Ps",
  "Is", "Mp", "Mv", "Ng", "Fl", "Py", "Ac", "Ix"
];

const tempoElements = {
  Tm: ["Comatose", "Stoned", "Normal", "Excited", "Manic"],
  Dn: ["Simple", "Basic", "Normal", "Dense", "Racing"],
  Cd: ["Monotone", "Flat", "Flowing", "Varied", "Erratic"],
  Rc: ["Scattered", "Regular", "Obsessive"]
};

(async () => {
  console.log("\n🎙️ StoryDirector: Define Voice for Existing Character\n");

  const projects = fs.readdirSync(storagePath).filter((name) => {
    return fs.statSync(path.join(storagePath, name)).isDirectory();
  });

  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message: "Select a project:",
      choices: projects,
    },
  ]);

  const characterDir = path.join(storagePath, selectedProject, "characters");
  if (!fs.existsSync(characterDir)) {
    console.log("⚠️  No characters found in this project.");
    return;
  }

  const characters = fs.readdirSync(characterDir).filter((f) => f.endsWith(".json"));

  if (characters.length === 0) {
    console.log("⚠️  No characters available. Create characters first.");
    return;
  }

  const { characterFile } = await inquirer.prompt([
    {
      type: "list",
      name: "characterFile",
      message: "Select a character to define voice for:",
      choices: characters,
    },
  ]);

  const characterPath = path.join(characterDir, characterFile);
  const characterData = JSON.parse(fs.readFileSync(characterPath, "utf8"));

  const selectedVoice = {};
  for (const code of coreElements) {
    const { value } = await inquirer.prompt([
      {
        type: "input",
        name: "value",
        message: `Set intensity for ${code} (0–10, or leave blank to skip):`,
        validate: input => {
          if (input.trim() === "") return true;
          const num = Number(input);
          return isNaN(num) || num < 0 || num > 10 ? "Must be 0–10 or blank" : true;
        }
      }
    ]);
    if (value.trim() !== "") selectedVoice[code] = Number(value);
  }

  const rhythm = {};
  for (const [key, options] of Object.entries(tempoElements)) {
    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: `Select ${key} (${key === "Tm" ? "Tempo" : key === "Dn" ? "Density" : key === "Cd" ? "Cadence" : "Consistency"}):`,
        choices: options
      }
    ]);
    rhythm[key] = selection;
  }

  characterData.voiceFormula = selectedVoice;
  characterData.rhythm = rhythm;

  fs.writeFileSync(characterPath, JSON.stringify(characterData, null, 2));
  console.log(`\n✅ Voice style updated for: ${characterFile}\n`);
})();
