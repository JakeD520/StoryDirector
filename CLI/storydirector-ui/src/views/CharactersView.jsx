import React, { useState, useEffect } from "react";
import CharacterEditor from "./CharacterEditor";

export default function CharactersView() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterData, setCharacterData] = useState(null);

  // Load characters from localStorage on mount
  useEffect(() => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("character:")
    );
    setCharacters(keys.map((key) => key.replace("character:", "")));
  }, []);

  const loadCharacter = (name) => {
    const raw = localStorage.getItem(`character:${name}`);
    if (raw) {
      setSelectedCharacter(name);
      setCharacterData(JSON.parse(raw));
    }
  };

  const createNewCharacter = () => {
    const name = prompt("Enter new character name:");
    if (name && !characters.includes(name)) {
      const blank = {
        name,
        gender: "",
        species: "",
        archetype: "",
        occupation: "",
        appearance: {},
        bio: ""
      };
      localStorage.setItem(`character:${name}`, JSON.stringify(blank));
      setCharacters((prev) => [...prev, name]);
      setSelectedCharacter(name);
      setCharacterData(blank);
    }
  };

  const saveCharacter = () => {
    if (selectedCharacter && characterData) {
      localStorage.setItem(
        `character:${selectedCharacter}`,
        JSON.stringify(characterData, null, 2)
      );
      alert("Character saved.");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-900 text-white p-4 border-r border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Characters</h2>
          <button onClick={createNewCharacter} className="text-green-400">+ Add</button>
        </div>
        <ul className="space-y-2">
          {characters.map((name) => (
            <li
              key={name}
              onClick={() => loadCharacter(name)}
              className={`cursor-pointer p-2 rounded hover:bg-gray-700 ${
                selectedCharacter === name ? "bg-gray-700" : ""
              }`}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-gray-950 text-white">
        {characterData ? (
          <CharacterEditor
            character={characterData}
            setCharacter={setCharacterData}
            onSave={saveCharacter}
          />
        ) : (
          <div className="text-gray-400">Select a character to begin.</div>
        )}
      </div>
    </div>
  );
}
