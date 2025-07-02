const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { callLLM } = require("./lib/openRouterClient");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((res) => rl.question(q, res));

const loadGlossary = () => {
  const glossaryPath = path.resolve(__dirname, "glossary", "voiceGlossary.json");
  if (!fs.existsSync(glossaryPath)) {
    console.error("❌ voiceGlossary.json not found.");
    process.exit(1);
  }
  return JSON.stringify(JSON.parse(fs.readFileSync(glossaryPath, "utf-8")), null, 2);
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

(async () => {
  console.log("\n🎙️ VoiceDNA Analyzer");

  const project = await ask("📁 Enter project name: ");
  const character = await ask("🎭 Enter character name: ");

  console.log("\n✍️ Paste your prose below. End input with a single line containing ONLY 'END':");
  let inputLines = [];
  rl.on("line", (line) => {
    if (line.trim() === "END") {
      rl.close();
    } else {
      inputLines.push(line);
    }
  });

  rl.on("close", async () => {
    const userText = inputLines.join("\n");
    const glossary = loadGlossary();

    const prompt = `
You are a linguistic analyst tasked with profiling a character's voice from a text sample. You will evaluate their writing or speech style using a fixed framework of 36 linguistic elements known as VoiceDNA.

Each element includes:
- A symbol (e.g. Rh, Co)
- A functional category (e.g. Rhythm, Coordination)
- An instruction describing how to measure it
- A scale from 0 (not present) to 4 (strongly present)

Use only the instructions provided for scoring — do not add or omit elements. Your output must include all 36 element scores, even if the value is 0.

Below is the voice glossary (JSON format):
${glossary}

Below is the sample text:
"""
${userText}
"""

Return ONLY a valid JSON object with 36 properties using double quotes and NO comments.
`;

    try {
      console.log("\n🧠 Analyzing VoiceDNA...");
      const result = await callLLM(prompt);
      const cleaned = result.replace(/\/\/.*$/gm, "").trim();
      const parsed = JSON.parse(cleaned);

      console.log("\n✅ VoiceDNA Result:");
      console.log(parsed);

      const savePath = path.resolve(__dirname, "storage", project, "character");
      ensureDir(savePath);

      const fileName = path.join(savePath, `${character}.voice.json`);
      fs.writeFileSync(fileName, JSON.stringify(parsed, null, 2), "utf-8");

      console.log(`\n💾 Saved to: ${fileName}`);
    } catch (err) {
      console.error("❌ LLM call or parse failed:", err.message);
    }
  });
})();
