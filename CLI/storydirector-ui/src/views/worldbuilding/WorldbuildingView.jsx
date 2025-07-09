import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import WorldEditor from "./WorldEdit";

// Accept onPanelData as a prop
export default function WorldbuildingView({ onPanelData }) {
  const [worlds, setWorlds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Send panel data to Addy when worlds or selectedId changes
  useEffect(() => {
    if (typeof onPanelData === "function") {
      onPanelData({
        worldCount: worlds.length,
        selectedWorld: worlds.find(w => w.id === selectedId) || null
      });
    }
  }, [worlds, selectedId, onPanelData]);

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_worlds");
    if (stored) setWorlds(JSON.parse(stored));
  }, []);

  const handleAddWorld = () => {
    const newWorld = {
      id: uuidv4(),
      name: "New World",
      description: "",
      timeline: "",
      regions: [],
      factions: [],
      systems: {
        magic: "",
        technology: "",
        religion: "",
        government: ""
      },
      history: "",
      constraints: []
    };
    const updated = [newWorld, ...worlds];
    setWorlds(updated);
    localStorage.setItem("storydirector_worlds", JSON.stringify(updated));
    setSelectedId(newWorld.id);
  };

  const handleUpdate = (updatedWorld) => {
    const updated = worlds.map(w => w.id === updatedWorld.id ? updatedWorld : w);
    setWorlds(updated);
    localStorage.setItem("storydirector_worlds", JSON.stringify(updated));
  };

  const handleDelete = (idToDelete) => {
    const updated = worlds.filter(w => w.id !== idToDelete);
    setWorlds(updated);
    localStorage.setItem("storydirector_worlds", JSON.stringify(updated));
    if (selectedId === idToDelete) setSelectedId(null);
  };

  const selected = worlds.find(w => w.id === selectedId);

  return (
    <div className="flex h-full min-h-screen w-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 p-4 bg-zinc-950 flex flex-col gap-2 pt-16 sticky top-0 self-start h-screen">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Worlds</h2>
        <button
          onClick={handleAddWorld}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded text-sm"
        >
          ➕ Add World
        </button>
        <div className="mt-4 flex flex-col gap-2">
          {worlds.map(world => (
            <div key={world.id} className="flex items-center justify-between group">
              <button
                onClick={() => setSelectedId(world.id)}
                className={`flex-1 text-left px-2 py-1 rounded ${
                  selectedId === world.id ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {world.name}
              </button>
              <button
                onClick={() => handleDelete(world.id)}
                className="text-red-400 text-xs px-2 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                title="Delete world"
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
          <WorldEditor world={selected} onSave={handleUpdate} />
        ) : (
          <div className="text-zinc-500 italic">Select a world to edit</div>
        )}
      </div>
    </div>
  );
}
