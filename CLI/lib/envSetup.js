const fs = require("fs");
const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");

const envPath = path.resolve(process.cwd(), ".env");

function hasApiKey() {
  if (!fs.existsSync(envPath)) return false;
  const envContent = fs.readFileSync(envPath, "utf8");
  return /OPENROUTER_API_KEY\s*=\s*\S+/.test(envContent);
}

async function promptForApiKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question("Enter your OpenRouter API key: ", (key) => {
      rl.close();
      resolve(key.trim());
    });
  });
}

async function ensureApiKey() {
  if (!hasApiKey()) {
    const key = await promptForApiKey();
    fs.writeFileSync(envPath, `OPENROUTER_API_KEY=${key}\n`, { encoding: "utf8", flag: "w" });
    console.log("✅ API key saved to .env");
  }
  dotenv.config({ path: envPath }); // Always load .env after ensuring
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("❌ Failed to load API key from .env");
  }
}

module.exports = { ensureApiKey };