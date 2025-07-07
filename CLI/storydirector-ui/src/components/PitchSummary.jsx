// PitchSummary.jsx
import React from "react";
import PitchTile from "./PitchTile";

export default function PitchSummary({ data, onElaborate }) {
  const categories = ["characters", "locations", "themes", "items", "conflicts", "genreGuesses"];

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-lg font-bold capitalize text-emerald-400 mb-2">{cat}</h3>
          <div className="flex flex-wrap gap-2">
            {(data[cat] || []).map((item, idx) => (
              <PitchTile key={idx} label={item} onClick={() => onElaborate(cat, item)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
