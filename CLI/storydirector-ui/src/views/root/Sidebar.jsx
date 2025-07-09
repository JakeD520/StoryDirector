import React from "react";

export default function Sidebar({ views, setActiveView }) {
  return (
    <div className="w-64 h-full border-r border-gray-800 p-6 flex flex-col justify-start bg-gradient-to-b from-gray-900 to-black shadow-inner rounded-tr-2xl rounded-br-2xl">
      <h2 className="text-2xl font-semibold mb-6">StoryDirector</h2>
      <nav className="flex flex-col gap-4 text-base text-gray-400">
        {views.map(({ key, label }) => (
          <button
            key={key}
            className="hover:text-white transition"
            onClick={() => setActiveView(key)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
