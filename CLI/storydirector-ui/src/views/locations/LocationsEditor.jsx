import { useState, useEffect } from "react";

export default function LocationEditor({ location, onSave }) {
  const [edited, setEdited] = useState(location);

  useEffect(() => {
    setEdited(location);
  }, [location]);

  const handleChange = (field, value) => {
    setEdited({ ...edited, [field]: value });
  };

  const handleSave = () => {
    onSave(edited);
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/80 shadow-lg p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🗺️</span>
        <h2 className="text-2xl font-bold text-emerald-400">Edit Location</h2>
      </div>
      <div className="flex gap-4">
        <input
          value={edited.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Location Name"
          className="w-1/2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
        <input
          value={edited.type}
          onChange={(e) => handleChange("type", e.target.value)}
          placeholder="Type (e.g., Cliff, Shop)"
          className="w-1/2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
        />
      </div>

      <textarea
        value={edited.description}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="General description"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <textarea
        value={edited.atmosphere}
        onChange={(e) => handleChange("atmosphere", e.target.value)}
        placeholder="Atmosphere and mood"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <textarea
        value={edited.spatialLayout}
        onChange={(e) => handleChange("spatialLayout", e.target.value)}
        placeholder="Spatial layout and structure"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <textarea
        value={edited.sensoryDetails}
        onChange={(e) => handleChange("sensoryDetails", e.target.value)}
        placeholder="Sensory details (sight, sound, smell, etc.)"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <textarea
        value={edited.juxtaposition}
        onChange={(e) => handleChange("juxtaposition", e.target.value)}
        placeholder="Juxtaposition and thematic tension"
        className="w-full h-24 p-2 rounded bg-zinc-800 border border-zinc-700 text-white resize-none"
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded shadow"
        >
          💾 Save Location
        </button>
      </div>
    </div>
  );
}
