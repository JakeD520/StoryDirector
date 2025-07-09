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
  const systemContent = panelData
    ? `You are Addy, the user's assistant director. Here is the current panel context:\n\n${JSON.stringify(panelData, null, 2)}`
    : "You are Addy, the user's assistant director. No panel data found.";

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
        if (editObj.type && window.applyPanelEdit && typeof window.applyPanelEdit === 'function') {
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
