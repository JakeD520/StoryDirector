import { useState } from "react";
import CharacterEdit from "./CharacterEdit";
// import other views as needed

const tabs = [
  {
    id: "character",
    label: "Character Form",
    component: <CharacterEdit />
  },
  // Add more tabs here as you develop
  // {
  //   id: "location",
  //   label: "Location Form",
  //   component: <LocationEdit />
  // },
  // {
  //   id: "addy",
  //   label: "Addy Tester",
  //   component: <AddyTester />
  // }
];

export default function DevPanel() {
  const [activeTab, setActiveTab] = useState("character");

  const current = tabs.find(t => t.id === activeTab);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">🛠️ Dev Panel</h1>
      <div className="flex space-x-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              tab.id === activeTab
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white p-4 rounded shadow-md border">{current?.component}</div>
    </div>
  );
}
