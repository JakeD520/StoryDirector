// src/utils/addy/addyResponder.js
import callLLM from "../callLLM";

/**
 * Addy's centralized response handler
 * @param {Object} params
 * @param {string} params.input - User input from the chat box
 * @param {Object|null} params.panelData - Registered panel from SceneComposer
 * @param {string} params.apiKey - OpenRouter key
 * @returns {Promise<{ response: string, didApply: boolean }>}
 */
export async function getAddyResponse({ input, panelData, apiKey }) {
  // Try to get dynamic field IDs/schema from window (set by CharacterEdit or other views)
  let schemaFields = [];
  if (typeof window !== 'undefined' && window.currentCharacterSchema) {
    schemaFields = window.currentCharacterSchema;
  } else if (panelData && panelData.schemaFields) {
    schemaFields = panelData.schemaFields;
  }
  const fieldIds = schemaFields.map(f => f.id);

  // Build dynamic system prompt
  let systemContent = '';
  if (panelData) {
    systemContent = `You are Addy, the user's assistant director. Here is the current panel context:\n\n${JSON.stringify(panelData, null, 2)}\n\n`;
  } else {
    systemContent = "You are Addy, the user's assistant director. No panel data found.\n\n";
  }
  if (fieldIds.length > 0) {
    systemContent += `Here is the schema for the form. Only use these field IDs as keys in your JSON output:\n${JSON.stringify(fieldIds)}\n`;
  }
  systemContent += "When the user asks to update or set any field, always output a single JSON object with the fields to update, e.g. { \"name\": \"Jim\" }. Do not just confirm in natural language. If you want, you may also output window.applyPanelEdit({ ... }) as a code block.";

  const enrichedMessages = [
    { role: "system", content: systemContent },
    { role: "user", content: input }
  ];

  const response = await callLLM(enrichedMessages, apiKey);

  // Parse for command
  let didApply = false;
  const codeBlockMatch = response.match(/window\.applyPanelEdit\((\{[\s\S]*?\})\)/);
  if (codeBlockMatch) {
    try {
      const editObj = eval('(' + codeBlockMatch[1] + ')');
      if (window.applyPanelEdit && typeof window.applyPanelEdit === 'function') {
        console.log("[AddyResponder] Calling window.applyPanelEdit with:", editObj);
        window.applyPanelEdit(editObj);
        didApply = true;
      }
    } catch (e) {
      console.warn("[Addy] Failed to auto-execute applyPanelEdit from code block:", e);
    }
  } else {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const editObj = JSON.parse(jsonMatch[0]);
        if (window.applyPanelEdit && typeof window.applyPanelEdit === 'function') {
          console.log("[AddyResponder] Calling window.applyPanelEdit with:", editObj);
          window.applyPanelEdit(editObj);
          didApply = true;
        }
      } catch (e) {
        // Not valid JSON
      }
    }
  }

  return { response, didApply };
}
