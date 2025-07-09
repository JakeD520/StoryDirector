import React, { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export function GlobalStateProvider({ children }) {
  const [apiKey, setApiKey] = useState("");
  const [profile, setProfile] = useState(null);
  const [panelData, setPanelData] = useState(null);
  const [selectedUniverse, setSelectedUniverse] = useState(null);
  const [showProfileSetupView, setShowProfileSetupView] = useState(false);
  const [activeView, setActiveView] = useState("profile");
  const [addyEditablePanel, setAddyEditablePanel] = useState(null);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <GlobalStateContext.Provider value={{
      apiKey, setApiKey,
      profile, setProfile,
      panelData, setPanelData,
      selectedUniverse, setSelectedUniverse,
      showProfileSetupView, setShowProfileSetupView,
      activeView, setActiveView,
      addyEditablePanel, setAddyEditablePanel,
      showLocationEditor, setShowLocationEditor,
      selectedLocation, setSelectedLocation,
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  return useContext(GlobalStateContext);
}
