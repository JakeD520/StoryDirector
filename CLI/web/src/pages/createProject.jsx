import { useState } from "react";

export default function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [created, setCreated] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError("Project name cannot be empty.");
      return;
    }

    setError(null);
    setCreated(false);

    const res = await fetch("/api/createProject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName })
    });

    if (res.ok) {
      setCreated(true);
      setProjectName("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create project.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 bg-[#1e1e1e] text-white">
      <h2 className="text-2xl font-semibold">Create New Project</h2>
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Enter your project name"
        className="w-full px-4 py-2 bg-[#121212] text-white border border-gray-600 rounded"
      />
      <button
        onClick={handleCreate}
        className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded"
      >
        Create Project
      </button>
      {created && <p className="text-green-400">✅ Project created successfully!</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
