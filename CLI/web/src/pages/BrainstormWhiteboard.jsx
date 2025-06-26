import { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function BrainstormWhiteboard() {
  const [project, setProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newCategory, setNewCategory] = useState("Notes");
  const refs = useRef({});

  const categoryColorMap = {
    Themes:    { border: "border-yellow-400", bg: "bg-yellow-100 text-black" },
    Characters: { border: "border-purple-400", bg: "bg-purple-100 text-black" },
    "Plot Points": { border: "border-pink-400", bg: "bg-pink-100 text-black" },
    Settings:  { border: "border-blue-400", bg: "bg-blue-100 text-black" },
    Genres:    { border: "border-green-400", bg: "bg-green-100 text-black" },
    "Key Items or Objects": { border: "border-orange-400", bg: "bg-orange-100 text-black" },
    Notes:     { border: "border-gray-400", bg: "bg-gray-100 text-black" },
    User:      { border: "border-teal-500", bg: "bg-teal-100 text-black" },
    Default:   { border: "border-teal-500", bg: "bg-white text-black" },
  };

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
      .then((res) => {
        if (!res.ok) throw new Error("Pitch not found");
        return res.json();
      })
      .then((data) => {
        const structured = data.structured;
        if (typeof structured !== "string") {
          console.error("❌ Malformed structured pitch:", structured);
          setNotes([]);
          return;
        }

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

        let index = 0;
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
              const id = uuidv4();
              loaded.push({
                id,
                category: currentKey,
                text: `${emoji} ${currentKey}: ${content}`,
                defaultPosition: {
                  x: 30 + (index % 5) * 180,
                  y: 30 + Math.floor(index / 5) * 180,
                },
              });
              refs.current[id] = React.createRef();
              index++;
            }
          }
        }

        setNotes(loaded);
      })
      .catch((err) => {
        console.error("⚠️ Failed to load pitch: ", err);
        setNotes([]);
      });
  }, [project]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const id = uuidv4();
    refs.current[id] = React.createRef();
    setNotes([
      ...notes,
      {
        id,
        category: newCategory,
        text: newNote,
        defaultPosition: { x: 100, y: 100 },
      },
    ]);
    setNewNote("");
  };

  const removeNote = (id) => {
    delete refs.current[id];
    setNotes(notes.filter((n) => n.id !== id));
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
    if (res.ok) alert("Notes saved!");
    else alert("Save failed");
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <h2 className="text-2xl font-bold mb-4">🧠 Brainstorm Whiteboard</h2>

      <select
        className="bg-[#1e1e1e] border border-gray-600 px-3 py-2 rounded mb-4"
        value={project}
        onChange={(e) => setProject(e.target.value)}
      >
        {projects.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Add a new note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#1e1e1e] border border-gray-600 rounded"
        />
        <select
          className="bg-[#1e1e1e] border border-gray-600 px-3 py-2 rounded"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          {Object.keys(categoryColorMap).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={addNote}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 rounded"
        >
          Add
        </button>
      </div>

      <div className="relative min-h-[600px] border border-gray-700 bg-[#181818] rounded p-4">
        {notes.map((note) => {
          const nodeRef = refs.current[note.id] || React.createRef();
          refs.current[note.id] = nodeRef;
          const { border, bg } = categoryColorMap[note.category] || categoryColorMap.Default;

          return (
            <Draggable key={note.id} nodeRef={nodeRef} defaultPosition={note.defaultPosition}>
              <div
                ref={nodeRef}
                className={`absolute z-10 rounded-lg shadow-lg border-2 ${border} ${bg} cursor-move hover:scale-105 transition-transform duration-150 ease-in-out`}
                style={{ width: '160px', height: '160px', padding: '16px' }}
              >
                <button
                  className="absolute top-1 right-1 text-red-400"
                  onClick={() => removeNote(note.id)}
                >
                  ✕
                </button>
                <p
                  className="text-sm leading-snug"
                  style={{
                    paddingTop: '20px',
                    height: 'calc(100% - 20px)',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {note.text}
                </p>
              </div>
            </Draggable>
          );
        })}
      </div>

      <button
        onClick={saveNotes}
        className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded"
      >
        Save Brainstorm
      </button>
    </div>
  );
}