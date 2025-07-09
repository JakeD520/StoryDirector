import React, { useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import ProfileSetupView from "../profile/ProfileSetupView";
import callLLM from "../../utils/callLLM";
import storyDirectorAPI from "../../utils/storyDirectorAPI";
import PanelRouter from "./PanelRouter";
import LocationEditor from "../locations/LocationsEditor";
import { views } from "./viewsConfig";
import { getAddyResponse } from "../../utils/addy/addyResponder";

import AddyChat from "./AddyChat";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useGlobalState } from "./GlobalStateContext";
import CharacterEdit from "../CharacterEdit";

export default function SceneComposer() {
  const {
    apiKey, setApiKey,
    profile, setProfile,
    panelData, setPanelData,
    selectedUniverse, setSelectedUniverse,
    showProfileSetupView, setShowProfileSetupView,
    activeView, setActiveView,
    addyEditablePanel, setAddyEditablePanel,
    showLocationEditor, setShowLocationEditor,
    selectedLocation, setSelectedLocation,
  } = useGlobalState();

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_user_profile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const storedKey = localStorage.getItem("openrouter_api_key");
    if (storedKey) setApiKey(storedKey);
  }, []);




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
  }, [setPanelData, setAddyEditablePanel]);

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
    devPanel: () => <PanelWrapper><CharacterEdit /></PanelWrapper>,
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
      <Sidebar views={views} setActiveView={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar onShowProfile={() => setShowProfileSetupView(true)} />

        {/* Floating Dev Button */}
        <button
          onClick={() => setActiveView("devPanel")}
          className="fixed bottom-6 right-6 z-50 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold"
        >
          Dev Panel
        </button>

        {/* Main Panel */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/20 overflow-hidden">
          {showProfileSetupView ? (
            <div className="pt-16 min-h-screen w-full flex flex-col">
              <ProfileSetupView onProfileComplete={(profile) => { setProfile(profile); setShowProfileSetupView(false); }} />
            </div>
          ) : showLocationEditor ? (
            <div className="pt-16 min-h-screen w-full flex flex-col">
              <LocationEditor location={selectedLocation} onSave={() => setShowLocationEditor(false)} />
            </div>
          ) : (
            activeView === "devPanel"
              ? panels.devPanel()
              : <PanelRouter
                  activeView={activeView}
                  setActiveView={setActiveView}
                  handlePanelData={handlePanelData}
                  selectedUniverse={selectedUniverse}
                  setSelectedUniverse={setSelectedUniverse}
                />
          )}
        </div>
      </div>

      {/* Addy Chat */}
      <AddyChat panelData={panelData} applyPanelEdit={applyPanelEdit} apiKey={apiKey} />
    </div>
  );
}
