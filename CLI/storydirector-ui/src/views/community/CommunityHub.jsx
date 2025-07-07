import React, { useEffect, useState } from "react";
import { getUniverseCanon } from "../../utils/canonLoader";

export default function CommunityHub({ universe, goBack }) {
  const [canon, setCanon] = useState(null);

  useEffect(() => {
    if (universe?.id) {
      const data = getUniverseCanon(universe.id);
      setCanon(data);
    }
  }, [universe?.id]);

  if (!canon) return <div className="p-6 text-white">Loading {universe.name}...</div>;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto p-6">
      <button
        onClick={goBack}
        className="text-sm text-blue-400 hover:underline"
      >
        ← Back to {universe.name} Overview
      </button>

      <h1 className="text-4xl font-bold text-white">🌌 {canon.name}</h1>
      <p className="text-gray-400 text-lg italic mb-4 max-w-prose">
        {canon.tagline}
      </p>
      <p className="text-gray-300 mb-8 max-w-3xl leading-relaxed">
        {canon.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
          <h2 className="text-lg font-semibold text-emerald-400 mb-2">📚 Latest Library Entries</h2>
          <p className="text-gray-400 text-sm mb-2">Most recent additions to the storyworld.</p>
          <ul className="list-disc pl-6 text-gray-300">
            {(canon.library || []).map((item, i) => (
              <li key={i}>{item.title} ({item.type}) — {item.date}</li>
            ))}
            {(!canon.library || canon.library.length === 0) && <li className="text-gray-500">No entries yet.</li>}
          </ul>
        </div>

        <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
          <h2 className="text-lg font-semibold text-purple-400 mb-2">📜 Canon Updates</h2>
          <p className="text-gray-400 text-sm mb-2">Recent changes to the myth canon (spoilers hidden by default).</p>
          <ul className="list-disc pl-6 text-gray-300">
            {(canon.canonUpdates || []).map((update, i) => (
              <li key={i}>{update.title} — {update.date}</li>
            ))}
            {(!canon.canonUpdates || canon.canonUpdates.length === 0) && <li className="text-gray-500">No updates yet.</li>}
          </ul>
        </div>

        <div className="border border-gray-700 rounded-lg p-4 bg-gray-900 col-span-full">
          <h2 className="text-lg font-semibold text-cyan-400 mb-2">🧬 Featured Lore & Codex</h2>
          <p className="text-gray-400 text-sm mb-2">Key characters, locations, and concepts in this world.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300">
            <div>
              <h3 className="text-sm text-emerald-300">Characters</h3>
              <ul className="list-disc pl-4">
                {(canon.featuredLore?.characters || []).map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-sm text-sky-300">Locations</h3>
              <ul className="list-disc pl-4">
                {(canon.featuredLore?.locations || []).map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-sm text-violet-300">Codex</h3>
              <ul className="list-disc pl-4">
                {(canon.featuredLore?.codex || []).map((cx, i) => <li key={i}>{cx}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
          <h2 className="text-lg font-semibold text-pink-400 mb-2">👥 Members</h2>
          <p className="text-gray-400 text-sm mb-2">{(canon.members || []).length} participants</p>
          <ul className="flex flex-wrap gap-2 text-gray-300">
            {(canon.members || []).map((m, i) => <li key={i} className="bg-gray-800 px-2 py-1 rounded text-xs">{m}</li>)}
          </ul>
        </div>

        <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">💬 Community Threads</h2>
          <p className="text-gray-400 text-sm mb-2">(Coming soon: discussion threads powered by localStorage)</p>
          <ul className="text-gray-500 italic text-sm">
            <li>"Proposal: Rewrite the Masquerade Pact"</li>
            <li>"Scene Draft: Night at Thornspire"</li>
            <li>"Lore Q&A: Wyrmkin feeding rites"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
