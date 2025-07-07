import React, { useState } from "react";
import { Plus, Bot, User, ThumbsUp, ThumbsDown } from "lucide-react";
import callLLM from "../utils/callLLM";

export default function BrainstormTab({ onPanelData }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  // Expose brainstorm data to parent (ProjectOverview)
  React.useEffect(() => {
    if (onPanelData) {
      onPanelData({
        type: "BrainstormTab",
        ideas
      });
    }
  }, [onPanelData, ideas]);

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
    const raw = localStorage.getItem("storydirector_active_project_data");
    const apiKey = localStorage.getItem("openrouter_api_key");
    if (!raw || !apiKey) {
      alert("Missing project data or API key.");
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(raw);
      const {
        title,
        genres = [],
        characters = [],
        locations = [],
        worldbuilding = "",
        pitchIdeas = [],
      } = data;

      const messages = [
        {
          role: "user",
          content: `
You are helping a screenwriter develop modular story beats.

Project Title: ${title}
Genre: ${genres.join(", ")}
Worldbuilding Summary: ${worldbuilding}

Known Characters:
${characters.map((c) => `- ${c}`).join("\n")}

Key Locations:
${locations.map((l) => `- ${l}`).join("\n")}

Existing Pitch Ideas:
${pitchIdeas.map((p) => `- ${p}`).join("\n")}

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
            };

            const existing = localStorage.getItem("brainstorm_sessions");
            const sessions = existing ? JSON.parse(existing) : [];
            sessions.push(sessionData);

            localStorage.setItem("brainstorm_sessions", JSON.stringify(sessions));
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
