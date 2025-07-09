import React, { useState, useEffect } from "react";
import PitchTab from "../../components/PitchTab";
import BrainstormTab from "../../components/BrainstormTab";  
import OutlineTab from "../../components/OutlineTab";


export default function ProjectOverview({ renderMainPanel, onPanelData }) {
  console.log('ProjectOverview: render');
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [tabData, setTabData] = useState(null);

  useEffect(() => {
    console.log('ProjectOverview: useEffect[mount]');
    function getKey() {
      return localStorage.getItem("storydirector_active_project") || "";
    }
    function getProjects() {
      const all = localStorage.getItem("storydirector_projects");
      return all ? JSON.parse(all) : [];
    }
    function findProject() {
      const stored = getKey();
      const allProjects = getProjects();
      return allProjects.find(
        (p) => p.title.trim().toLowerCase() === stored.trim().toLowerCase()
      ) || null;
    }

    // On mount, set project from localStorage
    const found = findProject();
    setProject(found);
    console.log('ProjectOverview: setProject on mount', found);

    const onStorage = (e) => {
      if (
        e.key === "storydirector_active_project" ||
        e.key === "storydirector_projects"
      ) {
        const updated = findProject();
        setProject((prev) => {
          if (!updated && prev !== null) return null;
          if (updated && (!prev || updated.title !== prev.title)) return updated;
          return prev;
        });
        console.log('ProjectOverview: setProject from storage event', updated);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      console.log('ProjectOverview: unmount');
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (onPanelData && project) {
      onPanelData({
        type: "ProjectOverview",
        tab: activeTab,
        project,
        tabData
      });
    }
  }, [onPanelData, project, activeTab, tabData]);

  const renderTab = () => {
    const contentWrapper = (children) => (
      <div className="flex-1 flex flex-col gap-6 text-white">
        {children}
      </div>
    );
    switch (activeTab) {
      case "overview":
        return contentWrapper(
          <>
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">{project.title}</h2>
            {project.tagline && <p className="italic text-zinc-400 mb-2">“{project.tagline}”</p>}
            {project.genres && project.genres.length > 0 && (
              <div className="text-xs text-emerald-400 mb-2">{project.genres.join(" | ")}</div>
            )}
            {project.description && <p className="text-sm text-zinc-200 mb-4 whitespace-pre-wrap">{project.description}</p>}
          </>
        );
      case "pitch":
        return contentWrapper(<PitchTab onPanelData={setTabData} />);
      case "brainstorm":
        return contentWrapper(<BrainstormTab onPanelData={setTabData} />);
      case "outline":
        return contentWrapper(<OutlineTab onPanelData={setTabData} />);
      case "script":
      case "revise":
        return contentWrapper(<div className="text-zinc-300 italic">Coming soon: {activeTab}</div>);
    }
  };

  const tabs = ["overview", "pitch", "brainstorm", "outline", "script", "revise"];

  if (!project) {
    const stored = localStorage.getItem("storydirector_active_project");
    const allProjects = localStorage.getItem("storydirector_projects");
    let errorMsg = "Loading project...";
    if (stored && allProjects) {
      const parsed = JSON.parse(allProjects);
      const found = parsed.find(
        p => p.title.trim().toLowerCase() === stored.trim().toLowerCase()
      );
      if (!found) {
        errorMsg = `No project found for: ${stored}`;
      }
    } else if (!stored) {
      errorMsg = "No active project selected.";
    }
    return (
      <div className="w-full max-w-6xl mx-auto min-h-[80vh] px-4 py-6 text-zinc-400 flex flex-col items-center justify-center gap-6">
        <div>{errorMsg}</div>
        <button
          className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow text-base"
          onClick={() => renderMainPanel && renderMainPanel("projects")}
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[80vh] px-4 py-6 flex flex-col" style={{height: "80vh"}}>
      <div className="flex gap-4 mb-6 border-b border-zinc-700 pb-2 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-4 py-1 rounded-full text-sm transition ${
              activeTab === tab
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 bg-gray-950 rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-gray-800 p-8 flex flex-col">
        {renderTab()}
      </div>
    </div>
  );
}
