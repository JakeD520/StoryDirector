
import React, { useState, useEffect } from "react";
import { Bot, User, ThumbsUp, ThumbsDown } from "lucide-react";
import callLLM from "../utils/callLLM";

export default function BrainstormTab({ onPanelData }) {
  // Get active project title for project-specific brainstorm ideas
  const activeProject = localStorage.getItem("storydirector_active_project");
  const getBrainstormKey = () => activeProject ? `brainstorm_ideas_${activeProject}` : "brainstorm_ideas";

  const [ideas, setIdeas] = useState(() => {
    const key = getBrainstormKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.warn(`⚠️ Could not parse saved ${key}`);
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  // Expose brainstorm data to parent (ProjectOverview)

  useEffect(() => {
    if (onPanelData) {
      onPanelData({
        type: "BrainstormTab",
        ideas
      });
    }
  }, [onPanelData, ideas]);

  // Save ideas to localStorage whenever they change
  useEffect(() => {
    const key = getBrainstormKey();
    localStorage.setItem(key, JSON.stringify(ideas));
  }, [ideas, activeProject]);

  const addUserIdea = () => {
    const idea = prompt("Enter your story idea:");
    if (!idea) return;
    setIdeas([
      {
        id: Date.now(),
        content: idea,
        source: "user",
        liked: null,
      },
      ...ideas,
    ]);
  };

  const addLLMIdea = async () => {
    setLoading(true);
    // Fetch pitch data for the active project
    const apiKey = localStorage.getItem("openrouter_api_key");
    const activeProject = localStorage.getItem("storydirector_active_project");
    const pitchKey = activeProject ? `pitch_results_${activeProject}` : "pitch_results";
    const pitchRaw = localStorage.getItem(pitchKey);
    if (!pitchRaw || !apiKey) {
      alert("Missing pitch analysis or API key.");
      setLoading(false);
      return;
    }

    try {
      const pitch = JSON.parse(pitchRaw);
      // Fallbacks for prompt
      const title = activeProject || "Untitled Project";
      const genres = pitch["genreGuesses"] || [];
      const characters = pitch["characters"] || [];
      const locations = pitch["locations"] || [];
      const themes = pitch["themes"] || [];
      const items = pitch["items"] || [];
      const conflicts = pitch["conflicts"] || [];

      const messages = [
        {
          role: "user",
          content: `
You are helping a screenwriter develop modular story beats.

Project Title: ${title}
Genre: ${genres.join(", ")}

Known Characters:
${characters.map((c) => `- ${c}`).join("\n")}

Key Locations:
${locations.map((l) => `- ${l}`).join("\n")}

Themes:
${themes.map((t) => `- ${t}`).join("\n")}

Items:
${items.map((i) => `- ${i}`).join("\n")}

Conflicts:
${conflicts.map((c) => `- ${c}`).join("\n")}

👉 Generate 5 distinct beat-sized scene ideas (1–2 sentence summaries each).
Focus on themes like deception, shame, identity, or redemption.
Respond with only the beat ideas in a numbered list.`.trim(),
        },
      ];

      const result = await callLLM(messages, apiKey);
      const parsed = result
        .split(/\n+/)
        .map((line) => line.replace(/^\d+\.\s*/, ""))
        .filter((line) => line.trim().length > 0);

      const newIdeas = parsed.map((content, index) => ({
        id: Date.now() + index,
        content,
        source: "llm",
        liked: null,
      }));

      setIdeas([...newIdeas, ...ideas]);
    } catch (e) {
      console.error("❌ LLM generation failed:", e);
      alert("Failed to generate ideas from LLM.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = (id, value) => {
    setIdeas(ideas.map(idea =>
      idea.id === id ? { ...idea, liked: idea.liked === value ? null : value } : idea
    ));
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-emerald-400">Brainstorm</h2>

      <p className="text-sm text-zinc-400 max-w-xl">
        Use this space to generate and collect beat ideas. You can add your own or let the LLM hallucinate freely. This helps build a large pool of scenes for outlining later.
      </p>

      <div className="flex gap-4 items-center">
        <button
          onClick={addLLMIdea}
          className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={loading}
        >
          {loading ? "✨ Generating..." : "✨ Add LLM Idea"}
        </button>
        <button
          onClick={addUserIdea}
          className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          ➕ Add Your Idea
        </button>
        <button
          onClick={() => {
            const sessionId = Date.now();
            const sessionData = {
              id: sessionId,
              timestamp: new Date().toISOString(),
              ideas,
              project: activeProject || null,
            };

            const sessionKey = activeProject ? `brainstorm_sessions_${activeProject}` : "brainstorm_sessions";
            const existing = localStorage.getItem(sessionKey);
            const sessions = existing ? JSON.parse(existing) : [];
            sessions.push(sessionData);

            localStorage.setItem(sessionKey, JSON.stringify(sessions));
            alert("✅ Session saved.");
          }}
          className="px-6 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          📦 End Brainstorm Session
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mt-6">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-zinc-800 p-4 rounded-lg shadow-md text-white flex flex-col justify-between self-stretch h-full min-h-[200px] gap-2"
          >
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              {idea.source === "llm" ? <Bot size={16} /> : <User size={16} />} 
              <span>{idea.source === "llm" ? "AI Suggestion" : "User Idea"}</span>
            </div>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{idea.content}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => toggleLike(idea.id, true)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700"
                title="Like"
              >
                <ThumbsUp size={16} className={idea.liked === true ? "text-green-400" : "text-zinc-500"} />
              </button>
              <button
                onClick={() => toggleLike(idea.id, false)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700"
                title="Dislike"
              >
                <ThumbsDown size={16} className={idea.liked === false ? "text-red-400" : "text-zinc-500"} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
