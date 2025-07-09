// src/utils/addy/voiceSkills.js
import callLLM from "../callLLM";


/**
 * VoiceDNA generation/editing skill handler
 * @param {Object} options
 * @param {string} options.input - Natural language input from user
 * @param {Object} options.context - panelData from VoiceView
 * @returns {Promise<Object|null>} editCommand for applyPanelEdit()
 */
export default async function voiceSkills({ input, context }) {
  const selected = context.selectedCharacter || context.character || null;
  const focusFields = context.focusFields || [];

  const characterName = selected?.name || "this character";

  const prompt = `You are a voice analysis assistant using a system of 36 linguistic and rhythmic elements.

Generate a VoiceDNA profile for ${characterName} based on the following request:
"${input}"

Return a JSON object like this:
{
  type: "updateVoiceDNA",
  id: "${selected?.id || "temp-id"}",
  updates: {
    Rh: 2,
    Co: 1,
    Fr: 0,
    Dx: 3,
    Ch: 2,
    Rp: 1,
    Sf: 3,
    El: 0,
    Cp: 2,
    Rg: 1,
    Md: 1,
    Ac: 0,
    Fl: 0,
    Ix: 2,
    Is: 1,
    Mp: 1,
    Mv: 2,
    Ng: 0,
    Py: 1,
    Ph: 0,
    Iv: 1,
    Sa: 1,
    Cs: 0,
    Ps: 1,
    Tm: 2,
    Dn: 2,
    Cd: 2,
    Rc: 2,
    C1: 0,
    C2: 0,
    C3: 0,
    C4: 0,
    C5: 0,
    C6: 0,
    C7: 0,
    C8: 0
  }
}`;

  const result = await callLLM(prompt);

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn("[Addy:voiceSkills] Failed to parse JSON:", err);
  }

  return null;
}