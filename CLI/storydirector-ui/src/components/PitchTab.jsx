import React, { useState, useEffect } from "react";
import analyzePitch from "../utils/analyzePitch";
import PitchTile from "../components/PitchTile";

export default function PitchTab({ onPanelData }) {
  const [text, setText] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeElaboration, setActiveElaboration] = useState(null);
  const [elaborationText, setElaborationText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pitch_results");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExtracted(parsed || null);
      } catch {
        console.warn("⚠️ Could not parse saved pitch_results");
      }
    }
  }, []);

  // Expose pitch data to parent (ProjectOverview)
  useEffect(() => {
    if (onPanelData) {
      onPanelData({
        type: "PitchTab",
        extracted,
        text
      });
    }
  }, [onPanelData, extracted, text]);

  const saveToLocalStorage = (updatedExtracted) => {
    localStorage.setItem("pitch_results", JSON.stringify(updatedExtracted));
  };

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzePitch(text);
      if (!result.error) {
        setExtracted(result);
        saveToLocalStorage(result);
      } else {
        setError("Invalid format returned from AI");
        console.warn(result.raw);
      }
    } catch (err) {
      console.error("Extraction error:", err);
      setError("Failed to extract elements. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleElaborate = (item) => {
    setActiveElaboration(item);
    setElaborationText("");
  };

  const saveElaboration = async () => {
    if (!elaborationText.trim()) {
      setActiveElaboration(null);
      return;
    }

    try {
      const elaborationResult = await analyzePitch(elaborationText, activeElaboration);
      if (elaborationResult && !elaborationResult.error) {
        const updated = { ...extracted };
        for (const category of Object.keys(elaborationResult)) {
          if (!Array.isArray(elaborationResult[category])) continue;
          const existing = new Set(updated[category] || []);
          elaborationResult[category].forEach(item => existing.add(item));
          updated[category] = Array.from(existing);
        }
        setExtracted(updated);
        saveToLocalStorage(updated);
      } else {
        console.warn("Invalid elaboration result:", elaborationResult.raw);
      }
    } catch (err) {
      console.error("Error elaborating:", err);
    } finally {
      setActiveElaboration(null);
      setElaborationText("");
    }
  };

  const categories = ["characters", "locations", "themes", "items", "conflicts", "genreGuesses"];

  // Render only the content, no outer wrappers, so ProjectOverview controls scroll/padding/layout
  return (
    <>
      <div>
        <label className="block text-zinc-300 mb-2">Stream of Thought</label>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start brainstorming your story idea..."
          className="w-full p-4 rounded bg-zinc-800 border border-zinc-600 text-white resize-none"
        />
        <button
          onClick={handleExtract}
          disabled={loading}
          className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Extracting..." : "Extract Story Elements"}
        </button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {extracted && (
        <div className="space-y-4">
          {categories.map(cat => (
            extracted[cat] && extracted[cat].length > 0 && (
              <div key={cat}>
                <h3 className="text-emerald-400 text-lg font-semibold mb-2 capitalize">{cat}</h3>
                <div className="flex flex-wrap gap-2">
                  {extracted[cat].map((item, idx) => (
                    <PitchTile key={cat + '-' + idx} label={item} onClick={() => handleElaborate(item)} />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {activeElaboration && (
        <div className="mt-6 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
          <h4 className="text-lg text-white mb-2">Elaborate on: <span className="text-emerald-400">{activeElaboration}</span></h4>
          <textarea
            rows={4}
            value={elaborationText}
            onChange={(e) => setElaborationText(e.target.value)}
            placeholder="Add more details..."
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-600 text-white"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={saveElaboration}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setActiveElaboration(null)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
