import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProfileSetupView from "./ProfileSetupView";
import callLLM from "../utils/callLLM";
import YourNewView from "./YourNewView";
import EnhancedProfileView from "./EnhancedProfileView";
import VoiceView from "./VoiceView";
import ProjectsView from "./ProjectsView";
import CreateProject from "./CreateProject";
import ProjectOverview from "./ProjectOverview";
import storyDirectorAPI from "../utils/storyDirectorAPI";
import CharactersView from "./CharactersView";
import CommunityView from "./CommunityView"; // <-- Imported CommunityView
import UniverseDashboard from "./UniverseDashboard";
import CommunityHub from "./CommunityHub";



export default function SceneComposer() {
  const [addyMessages, setAddyMessages] = useState([
    { role: "system", content: "Hi, I'm Addy. How can I assist with your story today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeView, setActiveView] = useState("profile");
  const [panelData, setPanelData] = useState(null); // NEW: store current panel data
  const messagesEndRef = useRef(null);
  const [selectedUniverse, setSelectedUniverse] = useState(null);


  useEffect(() => {
    const stored = localStorage.getItem("storydirector_user_profile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const storedKey = localStorage.getItem("openrouter_api_key");
    if (storedKey) setApiKey(storedKey);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [addyMessages]);

  useEffect(() => {
  window.storyDirectorAPI = storyDirectorAPI;
}, []);

useEffect(() => {
  import("../utils/storyDirectorAPI").then((mod) => {
    window.storyDirectorAPI = mod.default;
  });
}, []);

  const handleSaveKey = () => {
    localStorage.setItem("openrouter_api_key", apiKey);
    setShowSettings(false);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const updatedMessages = [...addyMessages, { role: "user", content: userInput }];
    setAddyMessages(updatedMessages);
    setUserInput("");

    try {
      // Use panelData for Addy's context if available
      const systemContent = panelData
        ? `You are Addy, the user's assistant director. Here is the current panel context:\n\n${JSON.stringify(panelData, null, 2)}`
        : "You are Addy, the user's assistant director. No panel data found.";

      const enrichedMessages = [
        {
          role: "system",
          content: systemContent
        },
        ...updatedMessages
      ];

      const response = await callLLM(enrichedMessages, apiKey);
      setAddyMessages([...updatedMessages, { role: "assistant", content: response }]);
    } catch (err) {
      console.error("Error calling LLM:", err);
      setAddyMessages([...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error." }]);
    }
  };


  const views = [
    { key: "projects", label: "Projects" },
    { key: "factions", label: "Factions" },
    { key: "characters", label: "Characters" },
    { key: "community", label: "Community" },
    { key: "scene", label: "Scene Deck" },
    { key: "voice", label: "Voice Profiles" },
    { key: "profile", label: "Profile" },
    { key: "future", label: "Future Plans" }

  ];

  // Panel map for simple views
  const panels = {
    canon: () => <div className="text-xl">Canon View Coming Soon...</div>,
    factions: () => <div className="text-xl">Factions View Coming Soon...</div>,
    characters: () => <CharactersView />,
    community: () => (
      <CommunityView
        onSelect={(universe) => {
          setSelectedUniverse(universe);
          setActiveView("universeDashboard");
        }}
      />
    ),
    scene: () => <div className="text-xl">Scene Deck Coming Soon...</div>,
    yournewview: () => <YourNewView />,
    profile: () => <EnhancedProfileView />,
    voice: () => <VoiceView />,
    projects: () => <ProjectsView renderMainPanel={setActiveView} />,
    createProject: () => <CreateProject renderMainPanel={setActiveView} />,
    projectOverview: () => <ProjectOverview renderMainPanel={setActiveView} onPanelData={setPanelData} />,
  };

  const renderMainPanel = () => {
    if (activeView === "universeDashboard") {
      return (
        <UniverseDashboard
          universe={selectedUniverse}
          goBack={() => setActiveView("community")}
          enterCommunity={(universe) => {
            setSelectedUniverse(universe);
            setActiveView("communityHub");
          }}
        />
      );
    }
    if (activeView === "communityHub") {
      return (
        <CommunityHub
          universe={selectedUniverse}
          goBack={() => setActiveView("universeDashboard")}
        />
      );
    }
    // Default: use the panels map
    return panels[activeView]?.() || null;
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-950 to-black text-gray-100 font-serif flex flex-row overflow-hidden shadow-2xl">
      {/* Left Sidebar */}
      <div className="w-64 h-full border-r border-gray-800 p-6 flex flex-col justify-start bg-gradient-to-b from-gray-900 to-black shadow-inner rounded-tr-2xl rounded-br-2xl">
        <h2 className="text-2xl font-semibold mb-6">StoryDirector</h2>
        <nav className="flex flex-col gap-4 text-base text-gray-400">
          {views.map(({ key, label }) => (
            <button
              key={key}
              className="hover:text-white transition"
              onClick={() => setActiveView(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="w-full h-12 px-6 flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 text-sm text-gray-300 shadow-sm">
          <div>📣 Community Updates</div>
          <div className="flex gap-6">
            <span className="hover:text-white transition cursor-pointer">Top Stories</span>
            <span className="hover:text-white transition cursor-pointer">Library</span>
            <span
              className="hover:text-white transition cursor-pointer"
              onClick={() => setShowProfileEditor(true)}
            >
              My Profile
            </span>
            <span className="hover:text-white transition cursor-pointer">🔔</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 px-6 py-4 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/20 overflow-hidden">
          {renderMainPanel()}
        </div>
      </div>

      {/* Addy Chat */}
      <div className="w-96 h-full border-l border-gray-800 p-6 bg-gradient-to-t from-gray-900 to-black shadow-inner flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Addy <br/> (Assistant Director)</h2>
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs text-emerald-400 hover:underline"
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 text-sm">
          {addyMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-md ${msg.role === "user" ? "bg-gray-800 text-right" : "bg-gray-700 text-left"}`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask Addy something..."
            className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="mt-2 w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm"
          >
            Send
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded shadow-xl w-full max-w-md">
              <h3 className="text-lg font-bold mb-4 text-white">OpenRouter API Key</h3>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white mb-4"
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={handleSaveKey} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded text-sm">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
