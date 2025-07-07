import React from "react";

export default function PitchTile({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-zinc-800 text-white text-sm rounded-full border border-zinc-600 hover:border-emerald-500 hover:text-emerald-400 transition whitespace-nowrap max-w-xs truncate"
      title={label}
    >
      {label}
    </button>
  );
}
