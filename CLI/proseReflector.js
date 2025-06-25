// proseReflector.js
import inquirer from "inquirer";
import { ensureApiKey } from "./lib/envSetup.js";
import { callLLM } from "./lib/openRouterClient.js";

(async () => {
  console.log("\n🪞 StoryDirector: Prose Reflector\n");

  const apiKey = await ensureApiKey();
  process.env.OPENROUTER_API_KEY = apiKey;

  const { prose } = await inquirer.prompt([
    {
      type: "editor",
      name: "prose",
      message: "Paste the LLM prose you want to analyze:",
    },
  ]);

  const { userQuestion } = await inquirer.prompt([
    {
      type: "input",
      name: "userQuestion",
      message: "Ask your reflective question about the prose (e.g., 'Why do you keep using the word crystalline?')",
    },
  ]);

  const reflectionPrompt = `
You are a helpful writing assistant that explains your narrative reasoning without defensiveness or justification.
Given the following prose and question, provide an honest analysis of the patterns or motivations behind the prose.

Prose:
"""
${prose.trim()}
"""

Question:
"""
${userQuestion.trim()}
"""

Do not try to fix or revise anything. Simply reflect and suggest **gentle**, user-approved alternatives **only if asked**. Avoid framing anything as wrong.
`;

  try {
    const analysis = await callLLM(reflectionPrompt);
    console.log("\n🧠 LLM Reflection:\n");
    console.log(analysis);
  } catch (err) {
    console.error("💥 Failed to reflect on prose:", err.message);
  }
})();
