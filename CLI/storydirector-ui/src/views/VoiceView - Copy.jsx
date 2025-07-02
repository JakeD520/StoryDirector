import React, { useState } from "react";
import callLLM from "../utils/callLLM";
import VoiceRadarChart from "../components/VoiceRadarChart";

export default function VoiceView() {
  const [project, setProject] = useState("");
  const [character, setCharacter] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");

    const apiKey = localStorage.getItem("openrouter_api_key");
    if (!apiKey) {
      setError("Missing OpenRouter API key. Please enter it in Addy’s settings.");
      return;
    }

    if (!project || !character || !text) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      const glossary = await fetch("/glossary/voiceGlossary.json").then((res) => res.json());

      const prompt = `
You are a linguistic analyst tasked with profiling a character's voice from a text sample. You will evaluate their writing or speech style using a fixed framework of 36 linguistic elements known as VoiceDNA.

Each element includes:
- A symbol (e.g. Rh, Co)
- A functional category (e.g. Rhythm, Coordination)
- An instruction describing how to measure it
- A scale from 0 (not present) to 4 (strongly present)

Use only the instructions provided for scoring — do not add or omit elements. Your output must include all 36 element scores, even if the value is 0.

Below is the voice glossary (JSON format):
${JSON.stringify(glossary)}

Below is the sample text:
"""
${text}
"""

Return ONLY a valid JSON object with 36 properties using double quotes and NO comments.
`.trim();

      const response = await callLLM(
        [{ role: "user", content: prompt }],
        apiKey,
        "anthropic/claude-3.5-sonnet"
      );

      let cleaned = response.trim();

      // Remove markdown code block if present
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
      }

      // Match first JSON block
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match && match.length > 0) {
        const parsed = JSON.parse(match[0]);
        setResult(parsed);

        const voicePath = `/storage/${project}/character/${character}.voice.json`;
        localStorage.setItem(voicePath, JSON.stringify(parsed, null, 2));
      } else {
        throw new Error("No valid JSON object found.");
      }
    } catch (err) {
      console.error("⚠️ JSON parse failed. Full raw response:", err.message);
      setError("Voice analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white space-y-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-emerald-400">VoiceDNA Analyzer</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Project Name"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />
        <input
          type="text"
          placeholder="Character Name"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />
        <textarea
          rows={8}
          placeholder="Paste sample prose here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded text-white font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze Voice"}
        </button>

        {error && <div className="text-red-400">{error}</div>}

{result && (
  <div className="max-h-[500px] overflow-y-auto space-y-4 mt-4 p-2 border-t border-gray-700">
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h3 className="text-lg font-bold mb-2 text-emerald-300">VoiceDNA Result</h3>
      <pre className="text-sm text-gray-200 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <VoiceRadarChart data={result} />
    </div>
  </div>
)}
      </div>
    </div>
  );
}
