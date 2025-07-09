import React, { useMemo, useCallback } from "react";
import CharactersView from "../characters/CharactersView";
import LocationsView from "../locations/LocationsView";
import WorldbuildingView from "../worldbuilding/WorldbuildingView";
import WorldEditor from "../worldbuilding/WorldEdit";
import CommunityView from "../community/CommunityView";
import UniverseDashboard from "../universe/UniverseDashboard";
import CommunityHub from "../community/CommunityHub";
import YourNewView from "../YourNewView";
import EnhancedProfileView from "../profile/EnhancedProfileView";
import VoiceView from "../voice/VoiceView";
import ProjectsView from "../projects/ProjectsView";
import CreateProject from "../projects/CreateProject";
import ProjectOverview from "../projects/ProjectOverview";

export default function PanelRouter({
  activeView,
  setActiveView,
  handlePanelData,
  selectedUniverse,
  setSelectedUniverse
}) {
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

  return renderMainPanel();
}
