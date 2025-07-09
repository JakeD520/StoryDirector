// src/utils/addy/characterSkills.js
import callLLM from "../callLLM";


/**
 * Character editing/generation skill handler
 * @param {Object} options
 * @param {string} options.input - Natural language input from user
 * @param {Object} options.context - panelData from CharactersView
 * @returns {Promise<Object|null>} editCommand for applyPanelEdit()
 */
export default async function characterSkills({ input, context }) {
  const selected = context.selectedCharacter;
  const focusFields = context.focusFields || [];

  let prompt = "";

  if (selected && focusFields.length > 0) {
    prompt = `You are a character designer AI. Fill in the following fields for this character based on user request: ${focusFields.join(", ")}.

Character:
${JSON.stringify(selected, null, 2)}

User Request:
"${input}"

Respond ONLY with a JSON object like:
{
  type: "updateCharacter",
  id: "${selected.id}",
  updates: {
    ${focusFields.map(f => `${f}: "..."`).join(",\n    ")}
  }
}`;
  } else if (!selected) {
    // No character selected – create new
    prompt = `You are a character creation assistant.

Generate a new character profile based on the following instruction:
"${input}"

Respond ONLY with a JSON object like:
{
  type: "addCharacter",
  name: "...",
  gender: "...",
  race: "...",
  archetype: "...",
  occupation: "...",
  appearance: "...",
  bio: "...",
  projectIds: []
}`;
  } else {
    // Selected character but no focusFields – fallback to full update
    prompt = `You are a character assistant. Use this base profile:
${JSON.stringify(selected, null, 2)}

Based on the request:
"${input}"

Generate new values for:
- bio
- appearance
- occupation (optional)

Return a JSON object like:
{
  type: "updateCharacter",
  id: "${selected.id}",
  updates: {
    bio: "...",
    appearance: "..."
  }
}`;
  }

  const result = await callLLM(prompt);

  // Try to safely parse JSON
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn("[Addy:characterSkills] Failed to parse JSON:", err);
  }

  return null;
}
