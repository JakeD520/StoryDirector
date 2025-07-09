import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import CharacterEditor from "../../components/CharacterEditor";

export default function CharactersView({ onPanelData }) {
  const [characters, setCharacters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_characters");
    if (stored) setCharacters(JSON.parse(stored));
  }, []);

  // Send panelData to Addy (SceneComposer) on mount and when selection changes
  // Addy/parent edit handler
  const handleEdit = (editCommand) => {
    if (editCommand.type === "addCharacter") {
      const newChar = {
        id: uuidv4(),
        name: editCommand.name || "New Character",
        gender: editCommand.gender || "",
        race: editCommand.race || "",
        archetype: editCommand.archetype || "",
        occupation: editCommand.occupation || "",
        appearance: editCommand.appearance || "",
        bio: editCommand.bio || "",
        projectIds: editCommand.projectIds || []
      };
      const updated = [newChar, ...characters];
      setCharacters(updated);
      localStorage.setItem("storydirector_characters", JSON.stringify(updated));
      setSelectedId(newChar.id);
      return true;
    }
    if (editCommand.type === "updateCharacter" && editCommand.id) {
      const updated = characters.map(c => c.id === editCommand.id ? { ...c, ...editCommand.updates } : c);
      setCharacters(updated);
      localStorage.setItem("storydirector_characters", JSON.stringify(updated));
      return true;
    }
    if (editCommand.type === "deleteCharacter" && editCommand.id) {
      const updated = characters.filter(c => c.id !== editCommand.id);
      setCharacters(updated);
      localStorage.setItem("storydirector_characters", JSON.stringify(updated));
      if (selectedId === editCommand.id) setSelectedId(null);
      return true;
    }
    if (editCommand.type === "selectCharacter" && editCommand.id) {
      setSelectedId(editCommand.id);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (onPanelData) {
      onPanelData({
        type: "CharactersView",
        characters,
        selectedCharacter: characters.find(c => c.id === selectedId) || null,
        handleEdit,
      });
    }
  }, [onPanelData, characters, selectedId]);




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

  const handleDelete = (idToDelete) => {
    const updated = characters.filter(c => c.id !== idToDelete);
    setCharacters(updated);
    localStorage.setItem("storydirector_characters", JSON.stringify(updated));

    if (selectedId === idToDelete) {
      setSelectedId(null);
    }
  };

  const selected = characters.find(c => c.id === selectedId);
  return (
    <div className="flex h-full min-h-screen w-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 p-4 bg-zinc-950 flex flex-col gap-2 pt-16 sticky top-0 self-start h-screen">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Characters</h2>
        <button
          onClick={handleAddCharacter}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded text-sm"
        >
          ＋ Add Character
        </button>
        <div className="mt-4 flex flex-col gap-2">
          {characters.map(char => (
            <div key={char.id} className="flex items-center justify-between group">
              <button
                onClick={() => setSelectedId(char.id)}
                className={`flex-1 text-left px-2 py-1 rounded ${
                  selectedId === char.id ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {char.name}
              </button>
              <button
                onClick={() => handleDelete(char.id)}
                className="text-red-400 text-xs px-2 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                title="Delete character"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-6 pt-16 overflow-y-auto">
        {selected ? (
          <CharacterEditor character={selected} onSave={handleUpdate} />
        ) : (
          <div className="text-zinc-500 italic">Select a character to edit</div>
        )}
      </div>
    </div>
  );
}
