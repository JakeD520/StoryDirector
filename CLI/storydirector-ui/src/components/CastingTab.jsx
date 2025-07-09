// components/CastingTab.jsx
import React, { useEffect, useState } from "react";

export default function CastingTab({ data = [], update, onPanelData }) {
  const [castList, setCastList] = useState(data);

  useEffect(() => {
    if (onPanelData) {
      onPanelData({
        type: "CastingTab",
        castList,
        updateCasting: (newList) => {
          setCastList(newList);
          update && update(newList);
        }
      });
    }
  }, [onPanelData, castList, update]);

  const handleRemove = (id) => {
    const filtered = castList.filter(c => c.id !== id);
    setCastList(filtered);
    update && update(filtered);
  };

  return (
    <div className="text-white space-y-4">
      <h2 className="text-xl font-bold text-emerald-400">Cast Characters</h2>
      {castList.length === 0 ? (
        <p className="text-zinc-400 italic">No characters cast yet.</p>
      ) : (
        <ul className="space-y-2">
          {castList.map((char) => (
            <li key={char.id} className="flex justify-between items-center bg-zinc-800 px-4 py-2 rounded">
              <div>
                <strong>{char.name}</strong> {char.archetype && <>({char.archetype})</>}
              </div>
              <button
                onClick={() => handleRemove(char.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                ✕ Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
