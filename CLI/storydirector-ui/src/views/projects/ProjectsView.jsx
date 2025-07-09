import React, { useState, useEffect } from "react";

export default function ProjectsView({ renderMainPanel }) {
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem("storydirector_projects");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("⚠️ Error parsing stored projects:", e);
      return [];
    }
  });

  useEffect(() => {
    console.log('ProjectsView mounted');
    return () => console.log('ProjectsView unmounted');
  }, []);

  return (
    <div className="w-full max-w-6xl min-h-[80vh] mx-auto p-8 bg-gray-950 rounded-lg flex flex-col justify-start overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-emerald-400">Your Projects</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Create New Project Button */}
        <div
          className="flex items-center justify-center border-dashed border-2 border-zinc-400 rounded-2xl p-4 cursor-pointer hover:border-emerald-500 transition min-h-[200px]"
          onClick={() => renderMainPanel("createProject")}
        >
          <div className="text-center text-zinc-500 hover:text-emerald-400">
            <div className="text-3xl font-bold">+</div>
            <div className="text-sm mt-1">Create New Project</div>
          </div>
        </div>

        {/* Existing Projects */}
        {projects.map((project, idx) => (
          <div
            key={idx}
            className="border rounded-2xl shadow-md p-4 bg-white dark:bg-zinc-800 hover:shadow-lg transition flex flex-col justify-between min-h-[200px]"
          >
            <div>
              <h3 className="text-xl font-bold mb-1">{project.title}</h3>
              {project.tagline && (
                <p className="text-sm italic text-zinc-400 mb-1">“{project.tagline}”</p>
              )}
              {project.genres && project.genres.length > 0 && (
                <div className="text-xs text-emerald-400 mb-2">{project.genres.join(" | ")}</div>
              )}
              {project.description && (
                <p className="text-sm text-zinc-300 mb-2 line-clamp-3">{project.description}</p>
              )}
            </div>
            <div className="mt-2">
              <div className="text-xs text-zinc-400 mb-3">
                Last opened: {new Date(project.lastOpened).toLocaleDateString()}
              </div>
              <button
                className="px-4 py-1 text-sm rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => {
                    localStorage.setItem("storydirector_active_project", project.title);
                    renderMainPanel("projectOverview");
                }}
              >
                Open Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
