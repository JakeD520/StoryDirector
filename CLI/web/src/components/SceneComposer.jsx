import React from "react";
import { motion } from "framer-motion";

export default function SceneComposer() {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-950 to-black text-gray-100 font-serif flex flex-row overflow-hidden shadow-2xl">
      {/* Left Sidebar */}
      <div className="w-64 h-full border-r border-gray-800 p-6 flex flex-col justify-start bg-gradient-to-b from-gray-900 to-black shadow-inner rounded-tr-2xl rounded-br-2xl">
        <h2 className="text-2xl font-semibold mb-6">StoryDirector</h2>
        <nav className="flex flex-col gap-4 text-base text-gray-400">
          <button className="hover:text-white transition">Canon View</button>
          <button className="hover:text-white transition">Factions</button>
          <button className="hover:text-white transition">Characters</button>
          <button className="hover:text-white transition">Timelines</button>
          <button className="hover:text-white transition">Scene Deck</button>
          <button className="hover:text-white transition">Voice Profiles</button>
        </nav>
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="w-full h-12 px-6 flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 text-sm text-gray-300 shadow-sm">
          <div>📣 Community Updates</div>
          <div className="flex gap-6">
            <span className="hover:text-white transition cursor-pointer">Top Stories</span>
            <span className="hover:text-white transition cursor-pointer">Chat</span>
            <span className="hover:text-white transition cursor-pointer">My Profile</span>
            <span className="hover:text-white transition cursor-pointer">🔔</span>
          </div>
        </div>

        {/* Main Panel Placeholder */}
        <div className="flex-1 p-12 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/20 overflow-hidden">
          <motion.div
            className="w-full h-full max-w-5xl rounded-2xl border border-gray-700 bg-gradient-to-bl from-gray-800/60 to-black/30 shadow-xl backdrop-blur-lg flex items-center justify-center text-gray-400 text-lg italic"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Select a tool or component to begin crafting the canon.
          </motion.div>
        </div>
      </div>

      {/* AI Assist Sidebar */}
      <div className="w-64 h-full border-l border-gray-800 p-6 bg-gradient-to-t from-gray-900 to-black shadow-inner rounded-tl-2xl rounded-bl-2xl">
        <h2 className="text-xl font-semibold mb-4">Contextual AI</h2>
        <div className="text-sm text-gray-400 mb-4">
          Refine tone, generate scene scaffolds, align with canon voice, or review VoiceDNA profiles.
        </div>
        <div className="flex flex-col gap-3">
          <button className="text-emerald-500 hover:text-emerald-300 text-sm text-left">➤ Generate directional hook</button>
          <button className="text-emerald-500 hover:text-emerald-300 text-sm text-left">➤ Scan for tonal inconsistencies</button>
          <button className="text-emerald-500 hover:text-emerald-300 text-sm text-left">➤ Suggest rhythm or pacing shift</button>
        </div>
      </div>
    </div>
  );
}
