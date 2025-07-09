import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import callLLM from "../utils/callLLM";

function SortableStoryCard({ id, content, onDelete, onChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [text, setText] = useState(content);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setText(content);
  }, [content]);

  const handleSave = () => {
    setEditing(false);
    onChange(text);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-md text-white w-full flex gap-4"
    >
      <div {...attributes} {...listeners} className="cursor-move text-zinc-400 pt-1">
        <GripVertical size={16} />
      </div>
      <div className="flex-1">
        {editing ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-zinc-900 text-white p-2 rounded border border-zinc-600 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleSave}
                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs px-2 py-1 bg-zinc-600 hover:bg-zinc-700 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">
              {text || "(Empty scene)"}
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OutlineTab({ onPanelData }) {
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [structureKey, setStructureKey] = useState("three_act");
  const [structureData, setStructureData] = useState({});
  const [activeProject, setActiveProject] = useState(null);
  const [outlineError, setOutlineError] = useState("");

  // Expose outline data to parent (ProjectOverview)
  useEffect(() => {
    if (onPanelData) {
      onPanelData({
        type: "OutlineTab",
        outline,
        structureKey
      });
    }
  }, [onPanelData, outline, structureKey]);

  const structure = structureData[structureKey] || {};

  // Load active project and outline draft for that project
  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const res = await fetch("/glossary/outlineStructures.json");
        const json = await res.json();
        setStructureData(json);
      } catch (err) {
        console.error("Failed to load outline structures:", err);
      }
    };
    fetchStructures();

    const projectKey = localStorage.getItem("storydirector_active_project");
    setActiveProject(projectKey);
    if (!projectKey) {
      setOutlineError("No active project selected. Please select or create a project to use the outline feature.");
      setOutline(null);
      return;
    }
    setOutlineError("");
    const saved = localStorage.getItem(`storydirector_outline_draft_${projectKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOutline(parsed);
      } catch {
        console.warn("⚠️ Could not parse saved outline session");
      }
    } else {
      setOutline(null);
    }
  }, []);

  // Save outline to project-specific key
  useEffect(() => {
    if (!activeProject || !outline) return;
    localStorage.setItem(`storydirector_outline_draft_${activeProject}`, JSON.stringify(outline));
  }, [outline, activeProject]);

  const generateOutline = async () => {
    setLoading(true);
    setOutlineError(""); // Clear previous error
    try {
      // Use project-specific key for brainstorm sessions
      const brainstormKey = activeProject ? `brainstorm_sessions_${activeProject}` : "brainstorm_sessions";
      const brainstormRaw = localStorage.getItem(brainstormKey);
      const brainstormSessions = brainstormRaw ? JSON.parse(brainstormRaw) : [];

      // Always load project data from the project-specific key
      if (!activeProject) {
        setOutlineError("No active project selected.");
        setLoading(false);
        return;
      }
      const raw = localStorage.getItem(`project_data_${activeProject}`);
      const apiKey = localStorage.getItem("openrouter_api_key");
      let data;
      if (raw) {
        data = JSON.parse(raw);
      } else {
        // Fallback: try to find project in storydirector_projects
        const projectsRaw = localStorage.getItem("storydirector_projects");
        let fallback = null;
        if (projectsRaw) {
          try {
            const projects = JSON.parse(projectsRaw);
            fallback = projects.find(p => (p.title || "").toUpperCase() === (activeProject || "").toUpperCase());
          } catch {}
        }
        if (fallback) {
          data = fallback;
          // Save for future use
          localStorage.setItem(`project_data_${activeProject}`, JSON.stringify(fallback));
        } else {
          setOutlineError("Missing project data for this project. Please check your project setup or run a brainstorm session.");
          setLoading(false);
          return;
        }
      }
      if (!apiKey) {
        setOutlineError("Missing OpenRouter API key. Please set your API key in settings.");
        setLoading(false);
        return;
      }

      // If brainstorm sessions are missing, block generation
      if (!brainstormSessions.length) {
        setOutlineError("No brainstorm sessions found for this project. Please run a brainstorm session first.");
        setLoading(false);
        return;
      }

      // Use defaults for missing fields
      const { title = activeProject, genres = [], characters = [], locations = [], worldbuilding = "", pitchIdeas = [] } = data || {};

      const brainstormBeats = brainstormSessions.flatMap(s => s.ideas.filter(i => i.liked !== false).map(i => `- ${i.content}`));

      const outlineSteps = structure.acts?.map((a, i) => `${i + 1}. ${a.label}`).join("\n") || "";

      const messages = [
        {
          role: "user",
          content: `
You are a screenwriter assistant.

Using the following project data, generate a structured story outline in the style of "${structure.name}".

Project Title: ${title}
Genre(s): ${genres.join(", ")}
World Summary: ${worldbuilding}

Characters:
${characters.map(c => `- ${c.name || c}`).join("\n")}

Key Locations:
${locations.map(l => `- ${l.name || l}`).join("\n")}

Pitch Ideas:
${pitchIdeas.map(p => `- ${p}`).join("\n")}

Preferred Outline Format:
${outlineSteps}

Brainstormed Scene Beats:
${brainstormBeats.join("\n")}

Respond with the full outline organized by the selected structure. For each section, begin with the section title (e.g. "${structure.acts?.[0]?.label}") and then list 3–6 scene summaries beneath it as bullet points.
`.trim()
        }
      ];

      const result = await callLLM(messages, apiKey);
      console.log("[OutlineTab] LLM result:", result);

      const parsed = {};
      if (structure.acts && structure.acts.length) {
        structure.acts.forEach((act, idx) => {
          const start = result.indexOf(act.label);
          if (start !== -1) {
            const nextAct = structure.acts[idx + 1]?.label;
            const end = nextAct ? result.indexOf(nextAct) : result.length;
            const section = result.substring(start, end);
            parsed[act.id] = section
              .split("\n")
              .slice(1)
              .map(s => ({ id: uuidv4(), content: s.replace(/^[-*]\s*/, "").trim() }))
              .filter(item => item.content);
          } else {
            // Fallback: try to extract bullet points or numbered scenes for this act
            const regex = new RegExp(`${act.label}[\s\S]*?(?=^\w|$)`, "mi");
            const match = result.match(regex);
            if (match) {
              parsed[act.id] = match[0]
                .split("\n")
                .slice(1)
                .map(s => ({ id: uuidv4(), content: s.replace(/^[-*\d.]+\s*/, "").trim() }))
                .filter(item => item.content);
            } else {
              parsed[act.id] = [];
            }
          }
        });
      }
      // If all acts are empty, fallback: try to parse any bullet/numbered list in the result
      const allEmpty = Object.values(parsed).every(arr => !arr.length);
      if (allEmpty) {
        const fallbackScenes = result
          .split(/\n/)
          .map(s => s.replace(/^[-*\d.]+\s*/, "").trim())
          .filter(line => line.length > 0);
        if (structure.acts && structure.acts.length) {
          parsed[structure.acts[0].id] = fallbackScenes.map(content => ({ id: uuidv4(), content }));
        }
      }
      setOutline(parsed);
    } catch (err) {
      console.error("Error generating outline:", err);
      setOutlineError("Failed to generate outline. " + (err?.message || "Unknown error."));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (actId, cardId) => {
    const updated = { ...outline };
    updated[actId] = updated[actId].filter(c => c.id !== cardId);
    setOutline(updated);
  };

  const handleEdit = (actId, cardId, newText) => {
    const updated = { ...outline };
    updated[actId] = updated[actId].map(c => c.id === cardId ? { ...c, content: newText } : c);
    setOutline(updated);
  };

  const addScene = (actId) => {
    const updated = { ...outline };
    updated[actId] = [{ id: uuidv4(), content: "" }, ...(updated[actId] || [])];
    setOutline(updated);
  };

  const handleDragEnd = (event, actId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = outline[actId].findIndex(i => i.id === active.id);
    const newIndex = outline[actId].findIndex(i => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(outline[actId], oldIndex, newIndex);
    setOutline({ ...outline, [actId]: reordered });
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-6">
        <label className="text-sm text-zinc-400">Select Outline Structure:</label>
        <select
          value={structureKey}
          onChange={(e) => setStructureKey(e.target.value)}
          className="bg-zinc-800 text-white px-4 py-2 rounded border border-zinc-600"
          disabled={!!outlineError}
        >
          {Object.entries(structureData).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>

        {structure.description && (
          <div className="text-sm text-zinc-300 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
            <p className="mb-2"><span className="text-emerald-400 font-semibold">Description:</span> {structure.description}</p>
            {structure.acts && (
              <>
                <p className="text-emerald-400 font-semibold mb-1">Outline Steps:</p>
                <ul className="list-disc list-inside space-y-1 text-white text-sm">
                  {structure.acts.map((act, idx) => (
                    <li key={act.id}><strong>{act.label}</strong>: {act.description}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {outlineError && (
          <div className="bg-red-900 text-red-200 border border-red-700 rounded p-4 my-2">
            <strong>Error:</strong> {outlineError}
          </div>
        )}

        <button
          onClick={generateOutline}
          disabled={loading || !!outlineError}
          className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? "⏳ Generating..." : "✨ Generate Outline"}
        </button>
      </div>

      {outline && !outlineError && (
        <div className="space-y-8">
          {structure.acts?.map(act => (
            <div key={act.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xl text-emerald-400 font-bold mb-2">{act.label}</h3>
                <button
                  onClick={() => addScene(act.id)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                >
                  ➕ Add Scene
                </button>
              </div>
              <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, act.id)}>
                <SortableContext
                  items={(outline[act.id] || []).map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-4">
                    {(outline[act.id] || []).map((item) => (
                      <SortableStoryCard
                        key={item.id}
                        id={item.id}
                        content={item.content}
                        onDelete={() => handleDelete(act.id, item.id)}
                        onChange={(text) => handleEdit(act.id, item.id, text)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
