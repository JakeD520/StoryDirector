import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import CharacterEditor from "../components/CharacterEditor";

export default function CharactersView() {
  const [characters, setCharacters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_characters");
    if (stored) setCharacters(JSON.parse(stored));
  }, []);

  const handleAddCharacter = () => {
    const newChar = {
      id: uuidv4(),
      name: "New Character",
      gender: "",
      race: "",
      archetype: "",
      occupation: "",
      appearance: "",
      bio: "",
      projectIds: []
    };
    const updated = [newChar, ...characters];
    setCharacters(updated);
    localStorage.setItem("storydirector_characters", JSON.stringify(updated));
    setSelectedId(newChar.id);
  };

  const handleUpdate = (updatedChar) => {
    const updated = characters.map(c => c.id === updatedChar.id ? updatedChar : c);
    setCharacters(updated);
    localStorage.setItem("storydirector_characters", JSON.stringify(updated));
  };

  const selected = characters.find(c => c.id === selectedId);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 p-4 bg-zinc-950 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Characters</h2>
        <button
          onClick={handleAddCharacter}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded text-sm"
        >
          ➕ Add Character
        </button>
        <div className="mt-4 flex flex-col gap-2">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              className={`text-left px-2 py-1 rounded ${
                selectedId === char.id ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Pane */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <CharacterEditor character={selected} onSave={handleUpdate} />
        ) : (
          <div className="text-zinc-500 italic">Select a character to edit</div>
        )}
      </div>
    </div>
  );
}
