import React, { useState, useEffect } from "react";

export default function CharacterEditor({ character, onSave }) {
  const [localCharacter, setLocalCharacter] = useState(character);

  useEffect(() => {
    setLocalCharacter(character);
  }, [character]);

  const [archetypes, setArchetypes] = useState([]);

  useEffect(() => {
    fetch("/glossary/archetypeGlossary.json")
      .then(res => res.json())
      .then(data => {
        // Convert object to array of {name, desc}
        if (!Array.isArray(data)) {
          setArchetypes(Object.entries(data).map(([name, desc]) => ({ name, desc })));
        } else {
          setArchetypes(data);
        }
      });
  }, []);

  const handleChange = (field, value) => {
    setLocalCharacter({ ...localCharacter, [field]: value });
  };

  const handleNestedChange = (section, field, value) => {
    setLocalCharacter({
      ...localCharacter,
      [section]: {
        ...localCharacter[section],
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    if (onSave) onSave(localCharacter);
  };

  return (
    <div className="p-6 overflow-y-auto space-y-6">
      {/* Header Bar */}
      <div className="text-xl font-bold border-b pb-2">
        🧍 {localCharacter.name || "Unnamed Character"} | Archetype: {localCharacter.archetype || "—"}
      </div>

      {/* Identity Card */}
      <div className="border rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">✨ Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={localCharacter.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Race/Species"
            value={localCharacter.race}
            onChange={(e) => handleChange("race", e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Gender"
            value={localCharacter.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="border rounded p-2"
          />
          <select
            value={localCharacter.archetype}
            onChange={(e) => handleChange("archetype", e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Select Archetype</option>
            {archetypes.map((a, i) => (
              <option key={i} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Philosophy & Demeanor Card */}
      <div className="border rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">🧭 Philosophy & Demeanor</h2>
        <input
          type="text"
          placeholder="Quirks (comma-separated)"
          value={(localCharacter.quirks || []).join(", ")}
          onChange={(e) => handleChange("quirks", e.target.value.split(",").map(s => s.trim()))}
          className="border rounded p-2 w-full mb-2"
        />
        <textarea
          placeholder="Beliefs, code, principles..."
          value={localCharacter.beliefs}
          onChange={(e) => handleChange("beliefs", e.target.value)}
          className="border rounded p-2 w-full"
          rows={4}
        ></textarea>
        <button className="mt-2 text-sm text-blue-600">🧠 Help Me Discover</button>
      </div>

      {/* Voice Sample Card */}
      <div className="border rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">🧬 Voice Sample & DNA</h2>
        <textarea
          placeholder="Write a short journal or in-character monologue..."
          value={localCharacter.voiceSample}
          onChange={(e) => handleChange("voiceSample", e.target.value)}
          className="border rounded p-2 w-full"
          rows={4}
        ></textarea>
        <button className="mt-2 text-sm text-purple-600">🧪 Analyze Voice</button>
      </div>

      {/* Appearance Card */}
      <div className="border rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">🖋 Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Eyes"
            value={localCharacter.appearance.eyes}
            onChange={(e) => handleNestedChange("appearance", "eyes", e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Hair"
            value={localCharacter.appearance.hair}
            onChange={(e) => handleNestedChange("appearance", "hair", e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Build / Posture"
            value={localCharacter.appearance.build}
            onChange={(e) => handleNestedChange("appearance", "build", e.target.value)}
            className="border rounded p-2"
          />
        </div>
      </div>

      {/* Backstory Card */}
      <div className="border rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">📖 Backstory</h2>
        <textarea
          placeholder="Character backstory, traumas, triumphs..."
          value={localCharacter.backstory}
          onChange={(e) => handleChange("backstory", e.target.value)}
          className="border rounded p-2 w-full"
          rows={6}
        ></textarea>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
