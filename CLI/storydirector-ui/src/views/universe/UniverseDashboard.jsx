import React, { useEffect, useState } from "react";
import { getUniverseCanon } from "../../utils/canonLoader";

export default function UniverseDashboard({ universe, goBack, enterCommunity }) {
  const [mythEvents, setMythEvents] = useState([]);

  useEffect(() => {
    if (universe?.id) {
      const canon = getUniverseCanon(universe.id);
      setMythEvents(canon?.mythEvents || []);
    }
  }, [universe?.id]);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-6">
      <button
        onClick={goBack}
        className="text-sm text-blue-400 hover:underline"
      >
        ← Back to Communities
      </button>

      <h1 className="text-3xl font-bold text-white">{universe.name}</h1>
      <p className="text-gray-400 text-sm mb-4 max-w-prose">
        {universe.description || universe.tagline || "A world in progress..."}
      </p>

      <div className="border border-gray-700 rounded p-4 bg-gray-900">
        <h2 className="text-xl font-semibold mb-2 text-purple-400">🌀 Myth Events</h2>
        {mythEvents.length > 0 ? (
          <ul className="list-disc pl-6 text-gray-300">
            {mythEvents.map((event, i) => (
              <li key={i}>
                <strong>{event.name}</strong> — {event.status}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No myth events recorded.</p>
        )}
      </div>

      <div className="border border-gray-700 rounded p-4 bg-gray-900">
        <h2 className="text-xl font-semibold mb-2 text-cyan-400">🧭 Visit Community Hub</h2>
        <p className="text-sm text-gray-400 mb-4">
          Join discussions, explore proposals, collaborate with other storytellers, and help shape this storyworld.
        </p>
        <button
          onClick={() => enterCommunity(universe)}
          className="px-4 py-2 text-sm rounded bg-cyan-700 hover:bg-cyan-600 text-white"
        >
          🌐 Enter {universe.name} Community
        </button>
      </div>
    </div>
  );
}
