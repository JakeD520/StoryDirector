import React, { useState } from "react";

export default function SignupView({ onSignup }) {
  const [signupName, setSignupName] = useState("");

  const handleSignup = () => {
    if (signupName.trim()) {
      const profile = {
        username: signupName.trim(),
        joined: new Date().toISOString(),
        role: "Contributor"
      };
      localStorage.setItem("storydirector_user_profile", JSON.stringify(profile));
      onSignup();
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-emerald-400">Welcome to StoryDirector</h1>
        <p className="mb-4 text-sm text-gray-400">Please create your account to begin:</p>
        <input
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          placeholder="Enter your display name"
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-4"
        />
        <button
          onClick={handleSignup}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
        >
          Create Profile
        </button>
      </div>
    </div>
  );
}
