
import React, { useState, useEffect, useCallback } from "react";
import { useFormFiller } from "../hooks/useFormFiller";

// Field schema for character editor
export const characterFields = [
  { id: "name", label: "Name", type: "text" },
  { id: "race", label: "Race/Species", type: "text" },
  { id: "gender", label: "Gender", type: "text" },
  { id: "archetype", label: "Archetype", type: "select" },
  { id: "quirks", label: "Quirks (comma-separated)", type: "quirks" },
  { id: "beliefs", label: "Beliefs, code, principles...", type: "textarea" },
  { id: "voiceSample", label: "Voice Sample", type: "textarea" },
  { id: "appearance.eyes", label: "Eyes", type: "text" },
  { id: "appearance.hair", label: "Hair", type: "text" },
  { id: "appearance.build", label: "Build / Posture", type: "text" },
  { id: "backstory", label: "Backstory", type: "textarea" },
];

// Helper to get value by path (e.g., "appearance.eyes")
function getValueByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

// Helper to set value by path (returns new object)
function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const newObj = { ...obj };
  let curr = newObj;
  for (let i = 0; i < keys.length - 1; i++) {
    curr[keys[i]] = { ...curr[keys[i]] };
    curr = curr[keys[i]];
  }
  curr[keys[keys.length - 1]] = value;
  return newObj;
}


export default function CharacterEditor({ character, onSave, onFormFillerReady }) {
  const [localCharacter, setLocalCharacter] = useState(character);

  // Addy/automation form filling support (now supports nested fields)
  const fillField = useCallback((field, value) => {
    console.log("[CharacterEditor] fillField called:", field, value);
    setLocalCharacter(prev => setValueByPath(prev, field, value));
  }, []);
  const fillFields = useCallback((fields) => {
    console.log("[CharacterEditor] fillFields called:", fields);
    setLocalCharacter(prev => {
      let updated = { ...prev };
      for (const key in fields) {
        updated = setValueByPath(updated, key, fields[key]);
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    if (onFormFillerReady) {
      onFormFillerReady({ fillField, fillFields });
      console.log("[CharacterEditor] onFormFillerReady called, form filler registered.");
    }
  }, [fillField, fillFields, onFormFillerReady]);

  useEffect(() => {
    setLocalCharacter(character);
    console.log("[CharacterEditor] setLocalCharacter called from character prop change", character);
    // Only update when character id changes (prevents overwriting local edits)
    // If no id, fallback to object reference
  }, [character?.id]);

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

  // Generic change handler using path
  const handleChange = (field, value) => {
    setLocalCharacter(prev => setValueByPath(prev, field, value));
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

      {/* Schema-driven form rendering */}
      <div className="border rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">✨ Identity & Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {characterFields.map(field => {
            if (field.type === "select" && field.id === "archetype") {
              return (
                <select
                  key={field.id}
                  value={getValueByPath(localCharacter, field.id) || ""}
                  onChange={e => handleChange(field.id, e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="">Select Archetype</option>
                  {archetypes.map((a, i) => (
                    <option key={i} value={a.name}>{a.name}</option>
                  ))}
                </select>
              );
            }
            if (field.type === "textarea") {
              return (
                <textarea
                  key={field.id}
                  placeholder={field.label}
                  value={getValueByPath(localCharacter, field.id) || ""}
                  onChange={e => handleChange(field.id, e.target.value)}
                  className="border rounded p-2 w-full"
                  rows={field.id === "backstory" ? 6 : 4}
                />
              );
            }
            if (field.type === "quirks") {
              return (
                <input
                  key={field.id}
                  type="text"
                  placeholder={field.label}
                  value={(getValueByPath(localCharacter, field.id) || []).join(", ")}
                  onChange={e => handleChange(field.id, e.target.value.split(",").map(s => s.trim()))}
                  className="border rounded p-2 w-full mb-2"
                />
              );
            }
            // Default: text input
            return (
              <input
                key={field.id}
                type="text"
                placeholder={field.label}
                value={getValueByPath(localCharacter, field.id) || ""}
                onChange={e => handleChange(field.id, e.target.value)}
                className="border rounded p-2"
              />
            );
          })}
        </div>
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
