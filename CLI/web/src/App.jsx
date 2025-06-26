// Location: /web/src/App.jsx

import { useState } from "react";
import CreateProject from "./pages/CreateProject";
import PitchTool from "./pages/PitchTool";
import BrainstormWhiteboard from "./pages/BrainstormWhiteboard";


const routes = {
  create: <CreateProject />,
  pitch: <PitchTool />,
  brainstorm: <BrainstormWhiteboard />,
};

export default function App() {
  const [activePage, setActivePage] = useState("create");

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <nav className="flex space-x-4 mb-6">
        <button
          onClick={() => setActivePage("create")}
          className={`px-4 py-2 rounded ${
            activePage === "create" ? "bg-teal-500" : "bg-gray-700"
          }`}
        >
          Create Project
        </button>
        <button
          onClick={() => setActivePage("pitch")}
          className={`px-4 py-2 rounded ${
            activePage === "pitch" ? "bg-teal-500" : "bg-gray-700"
          }`}
        >
          Pitch Tool
        </button>
        <button
          onClick={() => setActivePage("brainstorm")}
          className={`px-4 py-2 rounded ${
            activePage === "brainstorm" ? "bg-teal-500" : "bg-gray-700"
          }`}
        >
          Brainstorm Whiteboard
        </button>
      </nav>

      {routes[activePage]}
    </div>
  );
}
