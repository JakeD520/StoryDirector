
import React, { useState } from "react";
import VoiceRadarChart from "../components/VoiceRadarChart";
import callLLM from "../utils/callLLM";

export default function VoiceView() {
  const [project, setProject] = useState("");
  const [character, setCharacter] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [revisedText, setRevisedText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    setRevisedText("");

    const apiKey = localStorage.getItem("openrouter_api_key");
    if (!apiKey) {
      setError("Missing OpenRouter API key.");
      return;
    }
    if (!project || !character || !text) {
      setError("Please fill out all fields.");
      return;
    }
    try {
      setLoading(true);
      const glossary = await fetch("/glossary/voiceGlossary.json").then((res) => res.json());
      // 1. Analyze the sample text to get VoiceDNA
      const prompt = `You are a linguistic analyst. Analyze the sample text and score each of the 36 VoiceDNA elements (0–4) using ONLY the glossary below. Return ONLY a JSON object with 36 keys.\n\nGlossary:\n${JSON.stringify(glossary)}\n\nSample Text:\n"""\n${text}\n"""`;
      const response = await callLLM([{ role: "user", content: prompt }], apiKey);
      const cleaned = response.replace(/```(?:json)?|```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No valid JSON object found.");
      const parsed = JSON.parse(match[0]);
      setResult(parsed);
      // 2. Use ONLY the VoiceDNA to rewrite the control monologue
      const voicePath = `/storage/${project}/character/${character}.voice.json`;
      localStorage.setItem(voicePath, JSON.stringify(parsed, null, 2));

      const controlMonologue = `The task is to place the items into the container in a specific order. The first item is a small, rectangular object. Its surface is smooth and uniform in color. It will be placed flat against the bottom surface of the container. Next, we will take the cylindrical items. There are three of them. They should be aligned parallel to the longest side of the first object. The final item is a set of papers, held together by a clip. This will be laid on top of the other items, ensuring it does not bend. The process is now complete. All items are secured within the container according to the standard procedure.`;
      const regenPrompt = `You are a language simulator. Using ONLY the VoiceDNA profile below, and the glossary for reference, rewrite the following monologue so it matches the DNAs unique voice traits as closely as possible.\n\nVoiceDNA (trait scores 0–4):\n${JSON.stringify(parsed)}\n\nGlossary:\n${JSON.stringify(glossary)}\n\nOriginal Monologue:\n"""\n${controlMonologue}\n"""`;
      
      const rewritten = await callLLM([{ role: "user", content: regenPrompt }], apiKey);
      setRevisedText(rewritten.trim());
    } catch (err) {
      setError("Analysis failed: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-3/4 min-h-[80vh] max-h-[90vh] mx-auto p-8 bg-gray-950 rounded-lg flex flex-col justify-start overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">Voice Analyzer</h2>
      <div className="mb-4 flex flex-col gap-2">
        <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" placeholder="Project Name" value={project} onChange={e => setProject(e.target.value)} />
        <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" placeholder="Character Name" value={character} onChange={e => setCharacter(e.target.value)} />
        <textarea className="p-2 rounded bg-gray-800 border border-gray-700 text-white" placeholder="Paste sample text here..." value={text} onChange={e => setText(e.target.value)} rows={5} />
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 mt-2" onClick={handleAnalyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze Voice"}</button>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {result && <VoiceRadarChart data={result} />}
      {revisedText && (
        <div className="mt-6 bg-gray-800 p-4 rounded border border-gray-700">
          <h4 className="text-lg font-bold mb-2 text-emerald-300">Rewritten Monologue</h4>
          <pre className="whitespace-pre-wrap text-gray-200">{revisedText}</pre>
        </div>
      )}
    </div>
  );
}
