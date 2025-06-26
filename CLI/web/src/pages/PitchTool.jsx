// Location: /web/src/pages/PitchTool.jsx

import { useState, useEffect } from "react";

export default function PitchTool() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]);
      } catch (err) {
        setError("Failed to load projects");
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async () => {
    if (!story.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: selectedProject, story }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4 text-white">
      <h2 className="text-2xl font-bold">🎬 StoryDirector: Pitch Breakdown</h2>

      <div className="space-y-2">
        <label>Choose a project:</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full bg-[#1e1e1e] border border-gray-600 p-2 rounded"
        >
          {projects.map((proj) => (
            <option key={proj} value={proj}>{proj}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label>Enter your stream-of-thought story idea:</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={8}
          className="w-full bg-[#121212] text-white p-3 border border-gray-600 rounded"
          placeholder="e.g. A woman finds a suitcase full of blueprints in a burned-down diner..."
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-teal-500 hover:bg-teal-400 px-4 py-2 rounded"
        disabled={loading || !story.trim()}
      >
        {loading ? "Analyzing..." : "Analyze Pitch"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="mt-6 bg-[#1e1e1e] p-4 rounded border border-gray-700">
          <h3 className="text-xl font-semibold mb-2">🧠 Structured Pitch Elements</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">{result}</pre>
        </div>
      )}
    </div>
  );
}
