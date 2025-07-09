import characterSkills from "./characterSkills";
import locationSkills from "./locationSkills";
import voiceSkills from "./voiceSkills";
import callLLM from "../callLLM";

export async function getAddyCommand({ input, panelData }) {
  const context = panelData || {};
  const type = context.type || "general";

  try {
    switch (type) {
      case "CharactersView":
        return await characterSkills({ input, context });
      case "LocationsView":
        return await locationSkills({ input, context });
      case "VoiceView":
        return await voiceSkills({ input, context });
      default:
        return await getGeneralResponse({ input });
    }
  } catch (err) {
    console.error("[AddyEngine] Error in routing:", err);
    return null;
  }
}

async function getGeneralResponse({ input }) {
  const prompt = `You are Addy, a helpful AI assistant inside a creative writing app. 

The user has asked:
"${input}"

Reply with a helpful message. No code, no JSON. Just useful human language.`;

  try {
    const response = await callLLM(prompt);
    return {
      type: "generalMessage",
      content: response
    };
  } catch (err) {
    console.error("[Addy] General response failed:", err);
    return {
      type: "generalMessage",
      content: "⚠️ I had trouble answering that. Try again in a moment?"
    };
  }
}

