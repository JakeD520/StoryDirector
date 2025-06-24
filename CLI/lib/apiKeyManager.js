const fs = require("fs");
const readline = require("readline");
const path = require("path");

const envPath = path.resolve(__dirname, ".env");

function hasEnvKey() {
  if (!fs.existsSync(envPath)) return false;
  const contents = fs.readFileSync(envPath, "utf8");
  return contents.includes("OPENROUTER_API_KEY=");
}

function loadEnv() {
  require("dotenv").config({ path: envPath });
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

// ✅ Make sure this part is included!
module.exports = {
  hasEnvKey,
  loadEnv,
  promptForKey,
};
