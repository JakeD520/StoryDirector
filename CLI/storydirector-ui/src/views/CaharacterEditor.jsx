import React from "react";
import CharacterIdentityBlock from "./CharacterIdentityBlock";

export default function CharacterEditor({ character, setCharacter, onSave }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-400 mb-4">
        Editing: {character.name || "Unnamed Character"}
      </h2>

      <CharacterIdentityBlock character={character} setCharacter={setCharacter} />

      <div className="mt-6">
        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save Character
        </button>
      </div>
    </div>
  );
}
