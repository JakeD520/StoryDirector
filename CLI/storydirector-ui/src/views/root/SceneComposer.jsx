import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import ProfileSetupView from "../profile/ProfileSetupView";
import callLLM from "../../utils/callLLM";
import YourNewView from "../YourNewView";
import WorldbuildingView from "../worldbuilding/WorldbuildingView";
import WorldEditor from "../worldbuilding/WorldEdit";
import EnhancedProfileView from "../profile/EnhancedProfileView";
import VoiceView from "../voice/VoiceView";
import ProjectsView from "../projects/ProjectsView";
import CreateProject from "../projects/CreateProject";
import ProjectOverview from "../projects/ProjectOverview";
import storyDirectorAPI from "../../utils/storyDirectorAPI";
import CharactersView from "../characters/CharactersView";
import CommunityView from "../community/CommunityView";
import UniverseDashboard from "../universe/UniverseDashboard";
import CommunityHub from "../community/CommunityHub";
import LocationsView from "../locations/LocationsView";
import LocationEditor from "../locations/LocationsEditor";
import { getAddyResponse } from "../../utils/addy/addyResponder";

export default function SceneComposer() {
  const [addyMessages, setAddyMessages] = useState([
    { role: "system", content: "Hi, I'm Addy. How can I assist with your story today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileSetupView, setShowProfileSetupView] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeView, setActiveView] = useState("profile");
  const [panelData, setPanelData] = useState(null);
  const [addyEditablePanel, setAddyEditablePanel] = useState(null);
  const messagesEndRef = useRef(null);
  const [selectedUniverse, setSelectedUniverse] = useState(null);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

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


  // Expose API globally
  useEffect(() => {
    window.storyDirectorAPI = storyDirectorAPI;
  }, []);

  // Panel registration: store edit handler if present, with debug logging
  const handlePanelData = useCallback((data) => {
    setPanelData(data);
    if (data?.handleEdit || data?.edit) {
      setAddyEditablePanel(data);
      console.log("[SceneComposer] Registered editable panel:", data.type || "unknown", data);
    } else {
      console.log("[SceneComposer] Registered panel (no edit handler):", data.type || "unknown", data);
    }
  }, []);

  // Addy can call this to edit the current panel, with debug logging
  const applyPanelEdit = useCallback((editCommand) => {
    if (addyEditablePanel && (typeof addyEditablePanel.handleEdit === 'function' || typeof addyEditablePanel.edit === 'function')) {
      const fn = addyEditablePanel.handleEdit || addyEditablePanel.edit;
      console.log("[SceneComposer] applyPanelEdit: calling edit handler on panel", addyEditablePanel.type || "unknown", editCommand);
      return fn(editCommand);
    } else {
      console.warn("[SceneComposer] No editable panel or edit handler available for Addy.");
      return false;
    }
  }, [addyEditablePanel]);

  // Expose globally for Addy/LLM
  useEffect(() => {
    window.applyPanelEdit = applyPanelEdit;
  }, [applyPanelEdit]);

  // Global Addy Panel Registration
  useEffect(() => {
    if (panelData) {
      window.storydirectorAddyPanel = panelData;
    }
  }, [panelData]);

  // Enhanced Addy send: auto-executes applyPanelEdit if Addy outputs a command block
  const handleSend = async () => {
    if (!userInput.trim()) return;
    const updatedMessages = [...addyMessages, { role: "user", content: userInput }];
    setAddyMessages(updatedMessages);
    setUserInput("");

    try {
      const systemContent = panelData
        ? `You are Addy, the user's assistant director. Here is the current panel context:\n\n${JSON.stringify(panelData, null, 2)}`
        : "You are Addy, the user's assistant director. No panel data found.";

      const enrichedMessages = [
        { role: "system", content: systemContent },
        ...updatedMessages
      ];

      const { response } = await getAddyResponse({ input: userInput, panelData, apiKey });

      // Try to auto-execute an applyPanelEdit command if Addy outputs a code block or JSON
      let didAutoApply = false;
      // Look for a code block like window.applyPanelEdit({ ... }) or a JSON object
      const codeBlockMatch = response.match(/window\.applyPanelEdit\((\{[\s\S]*?\})\)/);
      if (codeBlockMatch) {
        try {
          // Use Function constructor instead of eval for safer parsing
          // eslint-disable-next-line no-new-func
          const editObj = Function('return ' + codeBlockMatch[1])();
          if (window.applyPanelEdit && typeof window.applyPanelEdit === 'function') {
            window.applyPanelEdit(editObj);
            didAutoApply = true;
          }
        } catch (e) {
          console.warn("[Addy] Failed to auto-execute applyPanelEdit from code block:", e);
        }
      } else {
        // Try to find a JSON object in the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const editObj = JSON.parse(jsonMatch[0]);
            if (editObj.type && window.applyPanelEdit && typeof window.applyPanelEdit === 'function') {
              window.applyPanelEdit(editObj);
              didAutoApply = true;
            }
          } catch (e) {
            // Not valid JSON, skip
          }
        }
      }

      setAddyMessages([
        ...updatedMessages,
        { role: "assistant", content: response + (didAutoApply ? "\n\n✅ Character edit applied!" : "") }
      ]);
    } catch (err) {
      console.error("Error calling LLM:", err);
      setAddyMessages([...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error." }]);
    }
  };

  const views = [
    { key: "projects", label: "Projects" },
    { key: "locations", label: "Locations" },
    { key: "characters", label: "Characters" },
    { key: "worldbuilding", label: "Worldbuilding" },
    { key: "community", label: "Community" },
    { key: "scene", label: "Scene Deck" },
    { key: "voice", label: "Voice Profiles" },
    { key: "profile", label: "Profile" },
    { key: "future", label: "Future Plans" }
  ];

  const PanelWrapper = useCallback(({ children }) => (
    <div className="pt-16 min-h-screen w-full flex flex-col">{children}</div>
  ), []);

  const panels = useMemo(() => ({
    canon: () => <PanelWrapper><div className="text-xl">Canon View Coming Soon...</div></PanelWrapper>,
    factions: () => <PanelWrapper><div className="text-xl">Factions View Coming Soon...</div></PanelWrapper>,
    characters: () => <PanelWrapper><CharactersView onPanelData={handlePanelData} /></PanelWrapper>,
    locations: () => <PanelWrapper><LocationsView onPanelData={handlePanelData} /></PanelWrapper>,
    worldbuilding: () => <PanelWrapper><WorldbuildingView onPanelData={handlePanelData} /></PanelWrapper>,
    worldedit: () => <PanelWrapper><WorldEditor onPanelData={handlePanelData} /></PanelWrapper>,
    community: () => <PanelWrapper><CommunityView onPanelData={handlePanelData} onSelect={(universe) => { setSelectedUniverse(universe); setActiveView("universeDashboard"); }} /></PanelWrapper>,
    scene: () => <PanelWrapper><div className="text-xl">Scene Deck Coming Soon...</div></PanelWrapper>,
    yournewview: () => <PanelWrapper><YourNewView onPanelData={handlePanelData} /></PanelWrapper>,
    profile: () => <PanelWrapper><EnhancedProfileView onPanelData={handlePanelData} /></PanelWrapper>,
    voice: () => <PanelWrapper><VoiceView onPanelData={handlePanelData} /></PanelWrapper>,
    projects: () => <PanelWrapper><ProjectsView renderMainPanel={setActiveView} onPanelData={handlePanelData} /></PanelWrapper>,
    createProject: () => <PanelWrapper><CreateProject renderMainPanel={setActiveView} onPanelData={handlePanelData} /></PanelWrapper>,
    projectOverview: () => <PanelWrapper><ProjectOverview renderMainPanel={setActiveView} onPanelData={handlePanelData} /></PanelWrapper>,
  }), [PanelWrapper, setActiveView, handlePanelData, setSelectedUniverse]);

  const renderMainPanel = useCallback(() => {
    if (activeView === "universeDashboard") {
      return <PanelWrapper><UniverseDashboard universe={selectedUniverse} goBack={() => setActiveView("community")} enterCommunity={(universe) => { setSelectedUniverse(universe); setActiveView("communityHub"); }} /></PanelWrapper>;
    }
    if (activeView === "communityHub") {
      return <PanelWrapper><CommunityHub universe={selectedUniverse} goBack={() => setActiveView("universeDashboard")} /></PanelWrapper>;
    }
    return panels[activeView]?.() || null;
  }, [activeView, selectedUniverse, setActiveView, panels, PanelWrapper]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-950 to-black text-gray-100 font-serif flex flex-row overflow-hidden shadow-2xl">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="w-full h-12 px-6 flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 text-sm text-gray-300 shadow-sm">
          <div>📣 Community Updates</div>
          <div className="flex gap-6">
            <span className="hover:text-white transition cursor-pointer">Top Stories</span>
            <span className="hover:text-white transition cursor-pointer">Library</span>
            <span className="hover:text-white transition cursor-pointer" onClick={() => setShowProfileSetupView(true)}>My Profile</span>
            <span className="hover:text-white transition cursor-pointer">🔔</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/20 overflow-hidden">
          {showProfileSetupView ? (
            <PanelWrapper>
              <ProfileSetupView onProfileComplete={(profile) => { setProfile(profile); setShowProfileSetupView(false); }} />
            </PanelWrapper>
          ) : showLocationEditor ? (
            <PanelWrapper>
              <LocationEditor location={selectedLocation} onSave={() => setShowLocationEditor(false)} />
            </PanelWrapper>
          ) : (
            renderMainPanel()
          )}
        </div>
      </div>

      {/* Addy Chat */}
      <div className="w-96 h-full border-l border-gray-800 p-6 bg-gradient-to-t from-gray-900 to-black shadow-inner flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Addy <br/> (Assistant Director)</h2>
          <button onClick={() => setShowSettings(true)} className="text-xs text-emerald-400 hover:underline">Settings</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 text-sm">
          {addyMessages.map((msg, i) => (
            <div key={i} className={`relative group p-2 rounded-md ${msg.role === "user" ? "bg-gray-800 text-right" : "bg-gray-700 text-left"}`}>
              {msg.content}
              {msg.role === "assistant" && (
                <button
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="absolute top-1 right-1 text-xs text-zinc-400 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition"
                  title="Copy to clipboard"
                >📋</button>
              )}
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
          <button onClick={handleSend} className="mt-2 w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm">
            Send
          </button>
        </div>
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
