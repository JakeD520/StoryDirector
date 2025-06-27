// captureVoiceAI.js – Auto-generate VoiceDNA from prose using OpenRouter

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { callLLM } from "./openRouterClient.js";

const storagePath = path.resolve("./storage");

const rhythmKeys = {
  Tm: ["Comatose", "Stoned", "Normal", "Excited", "Manic"],
  Dn: ["Simple", "Basic", "Normal", "Dense", "Racing"],
  Cd: ["Monotone", "Flat", "Flowing", "Varied", "Erratic"],
  Rc: ["Scattered", "Regular", "Obsessive"]
};

const elementKeys = [
  "Rh","Co","Fr","Dx","Ch","Rp","Sf","El","Cp","Sb","Pm","Im","An","Mt","Md",
  "Ph","Rg","Iv","Sa","Cs","Ps","Is","Mp","Mv","Ng","Fl","Py","Ac","Ix"
];

(async () => {
  console.log("\n🎙️ StoryDirector: AI VoiceDNA Generator\n");

  const projects = fs.readdirSync(storagePath).filter(name =>
    fs.statSync(path.join(storagePath, name)).isDirectory()
  );

  const { selectedProject } = await inquirer.prompt({
    type: "list",
    name: "selectedProject",
    message: "Select a project:",
    choices: projects
  });

  const characterDir = path.join(storagePath, selectedProject, "characters");
  if (!fs.existsSync(characterDir)) return console.log("⚠️  No characters found.");

  const characters = fs.readdirSync(characterDir).filter(f => f.endsWith(".json"));
  if (characters.length === 0) return console.log("⚠️  No characters available.");

  const { characterFile } = await inquirer.prompt({
    type: "list",
    name: "characterFile",
    message: "Select character:",
    choices: characters
  });

  const tmpPath = path.join(os.tmpdir(), `voice_sample_${Date.now()}.txt`);
  execSync(`${process.platform === "win32" ? "notepad" : "nano"} ${tmpPath}`, { stdio: "inherit" });
  const prose = fs.readFileSync(tmpPath, "utf8").trim();
  if (!prose) return console.log("❌ No input captured.");

  const prompt = `You are a linguist. Analyze the following prose and return a JSON object with the following keys:
- 29 voice elements (0–4): ${elementKeys.join(",")}
- 4 rhythm traits (choose one per key): Tm, Dn, Cd, Rc
Each rhythm trait must be a string from its respective scale:
Tm: Comatose, Stoned, Normal, Excited, Manic
Dn: Simple, Basic, Normal, Dense, Racing
Cd: Monotone, Flat, Flowing, Varied, Erratic
Rc: Scattered, Regular, Obsessive
Only return a valid compact JSON object. Here is the prose:\n\n"""
${prose}
"""`;

  console.log("\n🧠 Analyzing with LLM...\n");
  const response = await callLLM(prompt);

  try {
    const parsed = JSON.parse(response);
    const characterPath = path.join(characterDir, characterFile);
    const baseName = path.basename(characterFile, ".json");
    const outPath = path.join(characterDir, `${baseName}.voice.json`);
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
    console.log(`\n✅ VoiceDNA saved to ${outPath}`);
  } catch (e) {
    console.error("❌ Failed to parse LLM response as JSON:\n", response);
  }
})();
