import React, { useState } from "react";

export default function CreateStoryverse({ onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const storyverse = { id, name, tagline, description };
    onCreate(storyverse);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white">✍️ Create New Storyverse</h1>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Storyverse Name"
        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Short Tagline"
        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
      />

      <textarea
        rows={5}
        placeholder="Describe your Storyverse, its purpose, its vibe..."
        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex justify-between pt-4">
        <button
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500 text-sm"
          onClick={handleSubmit}
        >
          Create
        </button>
        <button
          className="text-sm text-gray-400 hover:underline"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
