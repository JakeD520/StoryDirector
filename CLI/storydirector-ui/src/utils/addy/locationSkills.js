// src/utils/addy/locationSkills.js
import callLLM from "../callLLM";


/**
 * Location editing/generation skill handler
 * @param {Object} options
 * @param {string} options.input - Natural language input from user
 * @param {Object} options.context - panelData from LocationsView
 * @returns {Promise<Object|null>} editCommand for applyPanelEdit()
 */
export default async function locationSkills({ input, context }) {
  const selected = context.selectedLocation;
  const focusFields = context.focusFields || [];

  let prompt = "";

  if (selected && focusFields.length > 0) {
    prompt = `You are a worldbuilding assistant. Fill in the following fields for this location based on user request: ${focusFields.join(", ")}.

Location:
${JSON.stringify(selected, null, 2)}

User Request:
"${input}"

Respond ONLY with a JSON object like:
{
  type: "updateLocation",
  id: "${selected.id}",
  updates: {
    ${focusFields.map(f => `${f}: "..."`).join(",\n    ")}
  }
}`;
  } else if (!selected) {
    // No location selected – create new
    prompt = `You are a location designer.

Generate a new story location based on this input:
"${input}"

Respond ONLY with a JSON object like:
{
  type: "addLocation",
  name: "...",
  description: "...",
  tags: ["..."],
  notes: "..."
}`;
  } else {
    // Fallback to general update
    prompt = `You are a worldbuilding assistant. Use the base location:
${JSON.stringify(selected, null, 2)}

Based on the request:
"${input}"

Suggest updated values for:
- name
- description
- tags
- notes

Respond with a JSON object like:
{
  type: "updateLocation",
  id: "${selected.id}",
  updates: {
    name: "...",
    description: "...",
    tags: ["..."],
    notes: "..."
  }
}`;
  }

  const result = await callLLM(prompt);

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn("[Addy:locationSkills] Failed to parse JSON:", err);
  }

  return null;
}