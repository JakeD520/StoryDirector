import { useState, useEffect } from "react";

export default function WorldEditor({ world, onSave }) {
  const [edited, setEdited] = useState(world);

  useEffect(() => {
    setEdited(world);
  }, [world]);

  const handleChange = (field, value) => {
    setEdited({ ...edited, [field]: value });
  };

  const handleSystemChange = (field, value) => {
    setEdited({
      ...edited,
      systems: {
        ...edited.systems,
        [field]: value
      }
    });
  };

  const handleSave = () => {
    onSave(edited);
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/80 shadow-lg p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🌍</span>
        <h2 className="text-2xl font-bold text-emerald-400">Edit World</h2>
      </div>

      <input
        value={edited.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="World Name"
        className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
      />

      <textarea
        value={edited.description}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="General description"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <textarea
        value={edited.timeline}
        onChange={(e) => handleChange("timeline", e.target.value)}
        placeholder="Timeline overview or history anchors"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <div>
        <label className="block mb-2 text-sm text-gray-300">Magic System</label>
        <textarea
          value={edited.systems.magic}
          onChange={(e) => handleSystemChange("magic", e.target.value)}
          className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm text-gray-300">Technology Level</label>
        <textarea
          value={edited.systems.technology}
          onChange={(e) => handleSystemChange("technology", e.target.value)}
          className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm text-gray-300">Religion & Mythology</label>
        <textarea
          value={edited.systems.religion}
          onChange={(e) => handleSystemChange("religion", e.target.value)}
          className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm text-gray-300">Government & Politics</label>
        <textarea
          value={edited.systems.government}
          onChange={(e) => handleSystemChange("government", e.target.value)}
          className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
        />
      </div>

      <textarea
        value={edited.history}
        onChange={(e) => handleChange("history", e.target.value)}
        placeholder="Significant historical moments, conflicts, turning points"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <textarea
        value={edited.constraints.join(", ")}
        onChange={(e) => handleChange("constraints", e.target.value.split(",").map(s => s.trim()))}
        placeholder="Rules or constraints (comma-separated)"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded shadow"
        >
          💾 Save World
        </button>
      </div>
    </div>
  );
}
