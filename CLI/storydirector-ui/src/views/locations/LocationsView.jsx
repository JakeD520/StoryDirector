import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import LocationEditor from "./LocationsEditor";

export default function LocationsView({ onPanelData }) {
  const [locations, setLocations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_locations");
    if (stored) setLocations(JSON.parse(stored));
  }, []);

  // Send panelData to Addy (SceneComposer) on mount and when selection changes
  useEffect(() => {
    if (onPanelData) {
      onPanelData({
        type: "LocationsView",
        locationCount: locations.length,
        selectedLocation: locations.find(l => l.id === selectedId) || null
      });
    }
  }, [onPanelData, locations, selectedId]);

  const handleAddLocation = () => {
    const newLocation = {
      id: uuidv4(),
      name: "New Location",
      type: "",
      world: "",
      description: "",
      atmosphere: "",
      spatialLayout: "",
      sensoryDetails: "",
      juxtaposition: "",
      tags: []
    };
    const updated = [newLocation, ...locations];
    setLocations(updated);
    localStorage.setItem("storydirector_locations", JSON.stringify(updated));
    setSelectedId(newLocation.id);
  };

  const handleUpdate = (updatedLocation) => {
    const updated = locations.map(l => l.id === updatedLocation.id ? updatedLocation : l);
    setLocations(updated);
    localStorage.setItem("storydirector_locations", JSON.stringify(updated));
  };

  const handleDelete = (idToDelete) => {
    const updated = locations.filter(l => l.id !== idToDelete);
    setLocations(updated);
    localStorage.setItem("storydirector_locations", JSON.stringify(updated));
    if (selectedId === idToDelete) setSelectedId(null);
  };

  const selected = locations.find(l => l.id === selectedId);

  return (
    <div className="flex h-full min-h-screen w-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 p-4 bg-zinc-950 flex flex-col gap-2 pt-16 sticky top-0 self-start h-screen">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Locations</h2>
        <button
          onClick={handleAddLocation}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded text-sm"
        >
          ➕ Add Location
        </button>
        <div className="mt-4 flex flex-col gap-2">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-center justify-between group">
              <button
                onClick={() => setSelectedId(loc.id)}
                className={`flex-1 text-left px-2 py-1 rounded ${
                  selectedId === loc.id ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {loc.name}
              </button>
              <button
                onClick={() => handleDelete(loc.id)}
                className="text-red-400 text-xs px-2 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                title="Delete location"
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
          <LocationEditor location={selected} onSave={handleUpdate} />
        ) : (
          <div className="text-zinc-500 italic">Select a location to edit</div>
        )}
      </div>
    </div>
  );
}
