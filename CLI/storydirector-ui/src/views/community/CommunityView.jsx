import React, { useState, useEffect } from "react";

// TEMP MOCKS for development/demo
const listUniverses = () => ["universe1", "universe2"];
const getUniverseCanon = (id) => ({
  name: id === "universe1" ? "The First Universe" : "The Second Universe",
  tagline:
    id === "universe1"
      ? "A sample tagline for Universe 1"
      : "A sample tagline for Universe 2",
  description:
    id === "universe1"
      ? "A sample description for Universe 1"
      : "A sample description for Universe 2",
});


// Addy context support: accept onPanelData prop
export default function CommunityView({ onSelect, onCreateNew, onPanelData }) {
  const [universes, setUniverses] = useState([]);

  useEffect(() => {
    const ids = listUniverses();
    const loaded = ids.map((id) => {
      const canon = getUniverseCanon(id);
      return {
        id,
        name: canon?.name || id,
        tagline: canon?.tagline || canon?.description || "No tagline",
        description: canon?.description || "",
      };
    });
    setUniverses(loaded);
  }, []);

  // Send Addy context when universes change
  useEffect(() => {
    if (typeof onPanelData === "function") {
      onPanelData({
        universeCount: universes.length,
        universes: universes.map(u => ({ id: u.id, name: u.name, tagline: u.tagline }))
      });
    }
  }, [universes, onPanelData]);

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white">🌌 Subscribed Universes</h1>
      <p className="text-gray-400 text-sm mb-4 max-w-prose">
        These are the canons you’ve subscribed to, contributed to, or follow.
        Click to explore Storyworld updates.
      </p>

      <div
        onClick={onCreateNew}
        className="cursor-pointer border-2 border-dashed border-gray-600 rounded p-6 text-center text-gray-400 hover:bg-gray-800 hover:text-white transition"
      >
        ➕ Create New Storyverse
      </div>

      {universes.map((u) => (
        <div
          key={u.id}
          onClick={() => onSelect(u)}
          className="cursor-pointer border border-gray-700 rounded p-4 bg-gray-900 hover:bg-gray-800 transition"
        >
          <h2 className="text-xl font-semibold text-white">{u.name}</h2>
          <p className="text-sm text-gray-400">{u.tagline}</p>
        </div>
      ))}
    </div>
  );
}
