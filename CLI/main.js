require('dotenv').config(); // Load environment variables from .env

// CLI Entry Script – Setup and Test LLM Call

// Load environment key support FIRST
const { ensureApiKey } = require("./lib/envSetup");
console.log("✅ Loaded envSetup");

// Load LLM client
const { callLLM } = require("./lib/openRouterClient");
console.log("✅ Loaded openRouterClient");

(async () => {
  console.log("🚀 Starting CLI...");

  try {
    // Ensure API key exists and load it
    await ensureApiKey();
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("🔑 API key loaded:", apiKey.slice(0, 6) + "...");

    // Get user input from command line arguments or use a default prompt
    const prompt =
      process.argv.slice(2).join(" ") ||
      "Give me 3 story ideas involving ancient tech and AI.";
    console.log(`\n📨 Sending prompt:\n"${prompt}"\n`);

    // Call the LLM and display the response
    const result = await callLLM(prompt);
    console.log("🧠 LLM Response:\n", result);
  } catch (err) {
    console.error("💥 CLI Error:", err.message);
  }

    console.log("\n✅ CLI session completed.");
  })();