import React, { useState, useEffect } from "react";

export default function CreateProject({ renderMainPanel }) {
  const [title, setTitle] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    console.log("🟢 CreateProject mounted");
    fetch("/glossary/genreGlossary.json")
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(err => console.error("Failed to load genre glossary:", err));
  }, []);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const saveProject = () => {
    if (!title.trim()) return;

    const newProject = {
      title: title.trim(),
      genres: selectedGenres,
      tagline: tagline.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      lastOpened: new Date().toISOString()
    };

    const existing = localStorage.getItem("storydirector_projects");
    const parsed = existing ? JSON.parse(existing) : [];
    const updated = [newProject, ...parsed];
    localStorage.setItem("storydirector_projects", JSON.stringify(updated));
    localStorage.setItem("storydirector_active_project", title.trim());

    renderMainPanel("projects");
  };

  return (
    <div className="w-3/4 min-h-[80vh] mx-auto p-8 bg-gray-950 rounded-lg flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-gray-800">
      <h2 className="text-2xl font-bold text-emerald-400">Create New Project</h2>

      <input
        className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        placeholder="Project Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <div>
        <label className="text-white text-sm mb-1 block">Genre</label>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, idx) => (
            <button
              key={idx}
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-1 text-sm rounded-full border ${selectedGenres.includes(genre)
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-gray-800 text-zinc-400 border-zinc-600"}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <input
        className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        placeholder="Optional Tagline"
        value={tagline}
        onChange={e => setTagline(e.target.value)}
      />

      <textarea
        rows={5}
        className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        placeholder="Project Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <div className="flex gap-4 mt-4">
        <button
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2"
          onClick={saveProject}
        >
          Save Project
        </button>
        <button
          className="bg-zinc-700 hover:bg-zinc-600 text-white rounded px-4 py-2"
          onClick={() => renderMainPanel("projects")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
