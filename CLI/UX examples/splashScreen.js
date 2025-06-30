import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function WorldSelector() {
  const [hoveredWorld, setHoveredWorld] = useState(null);
  const audioRef = useRef(null);

  const worlds = [
    {
      id: "ashara",
      name: "Ashara",
      tagline: "Where memory is currency and fog speaks back",
      color: "from-gray-900 to-emerald-700",
      audio: "/sounds/ashara.mp3",
      voiceover: "/voiceovers/ashara.mp3",
    },
    {
      id: "nebulark",
      name: "Nebulark",
      tagline: "A shattered empire on the edge of sentient collapse",
      color: "from-gray-900 to-indigo-800",
      audio: "/sounds/nebulark.mp3",
      voiceover: "/voiceovers/nebulark.mp3",
    },
    {
      id: "marrowlight",
      name: "Marrowlight",
      tagline: "Gothic echoes in a city carved from bone",
      color: "from-gray-900 to-red-900",
      audio: "/sounds/marrowlight.mp3",
      voiceover: "/voiceovers/marrowlight.mp3",
    },
  ];

  const handleMouseEnter = (world) => {
    setHoveredWorld(world.id);
    // Stop previous audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    const voice = new Audio(world.voiceover);
    audioRef.current = voice;
    // Add error handling for play()
    voice.play().catch((err) => {
      // Optionally log or handle the error
      // console.warn('Audio playback failed:', err);
    });
  };

  const handleMouseLeave = () => {
    setHoveredWorld(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center justify-center font-serif">
      <motion.h1
        className="text-5xl mb-12 text-center tracking-wide"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        STORYDIRECTOR
      </motion.h1>

      <motion.p
        className="text-lg mb-20 text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Enter a living world and tell the story that was never finished.
      </motion.p>

      <div className="flex gap-10">
        {worlds.map((world, i) => (
          <motion.div
            key={world.id}
            className={`w-72 h-96 rounded-2xl shadow-lg bg-gradient-to-br ${world.color} p-6 cursor-pointer hover:scale-105 transition-all duration-300 flex flex-col justify-end`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + i * 0.2, duration: 0.6 }}
            onMouseEnter={() => handleMouseEnter(world)}
            onMouseLeave={handleMouseLeave}
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">{world.name}</h2>
              <p className="text-sm text-gray-200 italic">{world.tagline}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
