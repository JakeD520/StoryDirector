import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProfileSetupView from "./ProfileSetupView";
import callLLM from "../utils/callLLM";
import YourNewView from "./YourNewView";
import EnhancedProfileView from "./EnhancedProfileView";
import VoiceView from "./VoiceView";  // ✅ or adjust path if needed





export default function SceneComposer() {
  const [addyMessages, setAddyMessages] = useState([
    { role: "system", content: "Hi, I'm Addy. How can I assist with your story today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeView, setActiveView] = useState("profile");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_user_profile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const storedKey = localStorage.getItem("openrouter_api_key");
    if (storedKey) setApiKey(storedKey);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [addyMessages]);

  const handleSaveKey = () => {
    localStorage.setItem("openrouter_api_key", apiKey);
    setShowSettings(false);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const updatedMessages = [...addyMessages, { role: "user", content: userInput }];
    setAddyMessages(updatedMessages);
    setUserInput("");

    try {
      const response = await callLLM(updatedMessages, apiKey);
      setAddyMessages([...updatedMessages, { role: "assistant", content: response }]);
    } catch (err) {
      console.error("Error calling LLM:", err);
      setAddyMessages([...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error." }]);
    }
  };

  if (!profile && !showProfileEditor) {
    return <ProfileSetupView onProfileComplete={(data) => setProfile(data)} />;
  }

  if (showProfileEditor) {
    return (
      <ProfileSetupView
        onProfileComplete={(data) => {
          setProfile(data);
          setShowProfileEditor(false);
        }}
      />
    );
  }

  const renderMainPanel = () => {
    switch (activeView) {
      case "canon":
        return <div className="text-xl">Canon View Coming Soon...</div>;
      case "factions":
        return <div className="text-xl">Factions View Coming Soon...</div>;
      case "characters":
        return <div className="text-xl">Characters View Coming Soon...</div>;
      case "timelines":
        return <div className="text-xl">Timelines View Coming Soon...</div>;
      case "scene":
        return <div className="text-xl">Scene Deck Coming Soon...</div>;
       case "yournewview":
        return <YourNewView />;
      case "profile":
        return <EnhancedProfileView />;
      case "voice":
        return <VoiceView />;
        return <VoiceView />;
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-950 to-black text-gray-100 font-serif flex flex-row overflow-hidden shadow-2xl">
      {/* Left Sidebar */}
      <div className="w-64 h-full border-r border-gray-800 p-6 flex flex-col justify-start bg-gradient-to-b from-gray-900 to-black shadow-inner rounded-tr-2xl rounded-br-2xl">
        <h2 className="text-2xl font-semibold mb-6">StoryDirector</h2>
        <nav className="flex flex-col gap-4 text-base text-gray-400">
          <button className="hover:text-white transition" onClick={() => setActiveView("canon")}>Canon View</button>
          <button className="hover:text-white transition" onClick={() => setActiveView("factions")}>Factions</button>
          <button className="hover:text-white transition" onClick={() => setActiveView("characters")}>Characters</button>
          <button className="hover:text-white transition" onClick={() => setActiveView("timelines")}>Timelines</button>
          <button className="hover:text-white transition" onClick={() => setActiveView("scene")}>Scene Deck</button>
          <button className="hover:text-white transition" onClick={() => setActiveView("voice")}>Voice Profiles</button>
          <button className="hover:text-white transition" onClick={() => setActiveView("profile")}>Profile</button>

        </nav>
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="w-full h-12 px-6 flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 text-sm text-gray-300 shadow-sm">
          <div>📣 Community Updates</div>
          <div className="flex gap-6">
            <span className="hover:text-white transition cursor-pointer">Top Stories</span>
            <span className="hover:text-white transition cursor-pointer">Library</span>
            <span
              className="hover:text-white transition cursor-pointer"
              onClick={() => setShowProfileEditor(true)}
            >
              My Profile
            </span>
            <span className="hover:text-white transition cursor-pointer">🔔</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 p-12 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/20 overflow-hidden">
          {renderMainPanel()}
        </div>
      </div>

      {/* Addy Chat */}
      <div className="w-96 h-full border-l border-gray-800 p-6 bg-gradient-to-t from-gray-900 to-black shadow-inner flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Addy <br/> (Assistant Director)</h2>
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs text-emerald-400 hover:underline"
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 text-sm">
          {addyMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-md ${msg.role === "user" ? "bg-gray-800 text-right" : "bg-gray-700 text-left"}`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask Addy something..."
            className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="mt-2 w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm"
          >
            Send
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded shadow-xl w-full max-w-md">
              <h3 className="text-lg font-bold mb-4 text-white">OpenRouter API Key</h3>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white mb-4"
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={handleSaveKey} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded text-sm">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
