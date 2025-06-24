import fs from "fs";
import readline from "readline";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Needed to simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");

function hasKey() {
  return fs.existsSync(envPath) &&
    fs.readFileSync(envPath, "utf8").includes("OPENROUTER_API_KEY=");
}

function loadEnv() {
  dotenv.config({ path: envPath });
  return process.env.OPENROUTER_API_KEY || null;
}

async function promptForKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter your OpenRouter API key: ", (key) => {
      const formatted = `OPENROUTER_API_KEY=${key.trim()}\n`;
      fs.writeFileSync(envPath, formatted, { encoding: "utf8", flag: "w" });
      rl.close();
      resolve(key.trim());
    });
  });
}

async function ensureApiKey() {
  if (!hasKey()) {
    console.log("🔐 No API key found. Prompting...");
    await promptForKey();
  }
  const key = loadEnv();
  if (!key) throw new Error("❌ Failed to load API key from .env");
  return key;
}

// ✅ Modern export
export { ensureApiKey };
