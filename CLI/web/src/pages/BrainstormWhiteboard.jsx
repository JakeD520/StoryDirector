import { useEffect, useState } from "react";
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function BrainstormWhiteboard() {
  const [project, setProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newCategory, setNewCategory] = useState("Notes");

  const categories = [
    "Themes", "Characters", "Plot Points", "Settings",
    "Genres", "Key Items or Objects", "Notes", "User"
  ];

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        if (data.length > 0) setProject(data[0]);
      });
  }, []);

  useEffect(() => {
    if (!project) return;
    fetch(`/api/load?project=${project}&type=pitch&file=pitch.json`)
      .then((res) => res.ok ? res.json() : Promise.reject("Pitch not found"))
      .then((data) => {
        const structured = data.structured;
        if (typeof structured !== "string") return setNotes([]);

        const loaded = [];
        const lines = structured.split(/\r?\n/);
        let currentKey = "";
        let emoji = "📝";

        const emojiMap = {
          Themes: "🧵",
          Characters: "🎭",
          "Plot Points": "🧩",
          Settings: "🌍",
          Genres: "🎬",
          "Key Items or Objects": "🪙",
          Notes: "📌",
        };

        for (const line of lines) {
          const trimmed = line.trim();
          if (/^[A-Z][A-Z\s/]+$/.test(trimmed) || /^([A-Z][A-Za-z\s]+):$/.test(trimmed)) {
            const cleanKey = trimmed.replace(/:$/, '').trim();
            const titleCaseKey = cleanKey.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            currentKey = titleCaseKey === 'Key Items/Objects' ? 'Key Items or Objects' : titleCaseKey;
            emoji = emojiMap[currentKey] || "📝";
          } else if (/^[-\u2022*]/.test(trimmed)) {
            const content = trimmed.replace(/^[-\u2022*]\s*/, "").trim();
            if (content && currentKey) {
              loaded.push({
                id: uuidv4(),
                category: currentKey,
                text: `${emoji} ${currentKey}: ${content}`,
              });
            }
          }
        }

        setNotes(loaded);
      })
      .catch(() => setNotes([]));
  }, [project]);

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([
      ...notes,
      {
        id: uuidv4(),
        category: newCategory,
        text: `${newCategory}: ${newNote}`,
      },
    ]);
    setNewNote("");
  };

  const removeNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const editNote = (id) => {
    const current = notes.find(n => n.id === id);
    const newText = window.prompt("Edit note:", current.text);
    if (newText) {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, text: newText } : n));
    }
  };

  const saveNotes = async () => {
    const res = await fetch(
      `/api/save?project=${project}&type=brainstorm&file=brainstorm.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notes, null, 2),
      }
    );
    alert(res.ok ? "Notes saved!" : "Save failed");
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <h2 className="text-2xl font-bold mb-4">🧠 Brainstorm Whiteboard</h2>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          className="bg-[#1e1e1e] border border-gray-600 px-3 py-2 rounded"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          className="bg-[#1e1e1e] border border-gray-600 px-3 py-2 rounded"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Add a new note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#1e1e1e] border border-gray-600 rounded"
        />

        <button
          onClick={addNote}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 rounded"
        >
          Add
        </button>

        <button
          onClick={saveNotes}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded"
        >
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category} className="bg-[#181818] border border-gray-700 rounded p-4">
            <h3 className="text-lg font-semibold mb-2">{category}</h3>
            {notes.filter(note => note.category === category).map(note => (
              <div
                key={note.id}
                className="mb-2 p-3 rounded shadow border text-black bg-white"
              >
                <p className="text-sm leading-snug break-words mb-1">{note.text}</p>
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => editNote(note.id)}
                    className="text-[10px] bg-yellow-200 text-black px-1.5 py-0.5 rounded hover:bg-yellow-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded hover:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
