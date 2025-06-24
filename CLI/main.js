const { hasEnvKey, loadEnv, promptForKey } = require("./apiKeyManager");

(async () => {
  try {
    if (!hasEnvKey()) {
      console.log("🔐 No API key found. Prompting...");
      await promptForKey();
    } else {
      console.log("✅ Found existing .env file");
    }

    loadEnv();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("❌ Failed to load API key from .env");
      return;
    }

    console.log("🔑 API Key loaded:", apiKey.slice(0, 6) + "...");
  } catch (err) {
    console.error("💥 Error:", err);
  }
})();
