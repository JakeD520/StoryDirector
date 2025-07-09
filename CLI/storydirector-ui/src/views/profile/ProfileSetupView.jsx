import React, { useState, useEffect } from "react";

export default function ProfileSetupView({ onProfileComplete }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [genres, setGenres] = useState([]);
  const [joined, setJoined] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const genreOptions = ["Fantasy", "Sci-Fi", "Drama", "Mystery", "Action", "Romance"];

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_user_profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      setDisplayName(parsed.displayName || "");
      setBio(parsed.bio || "");
      setAvatarUrl(parsed.avatarUrl || "");
      setGenres(parsed.genres || []);
      setJoined(parsed.joined || null);
    }
  }, []);

  const handleGenreToggle = (genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result); // base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const profile = {
      displayName,
      bio,
      avatarUrl,
      genres,
      joined: joined || new Date().toISOString()
    };
    localStorage.setItem("storydirector_user_profile", JSON.stringify(profile));
    setSaveMessage("Profile saved successfully.");
    setTimeout(() => setSaveMessage(""), 3000);
    onProfileComplete(profile);
  };

  return (
    <div className="max-w-xl w-full bg-gray-800 p-8 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-emerald-400">{joined ? "Edit Your Profile" : "Create Your Profile"}</h2>

      <label className="block mb-4">
        <span className="text-sm text-gray-300">Display Name</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full mt-1 p-2 rounded bg-gray-900 border border-gray-700 text-white"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-gray-300">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full mt-1 p-2 rounded bg-gray-900 border border-gray-700 text-white"
        />
      </label>

      <div className="mb-4">
        <span className="text-sm text-gray-300 block mb-2">Upload Avatar</span>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full mb-2 border-2 border-emerald-400 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="text-sm text-gray-300"
        />
      </div>

      <div className="mb-4">
        <span className="text-sm text-gray-300 block mb-2">Favorite Genres</span>
        <div className="flex flex-wrap gap-2">
          {genreOptions.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreToggle(genre)}
              className={`px-3 py-1 rounded text-sm ${genres.includes(genre) ? "bg-emerald-500 text-black" : "bg-gray-700 text-gray-300"}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {saveMessage && <div className="text-emerald-400 text-sm mb-2">{saveMessage}</div>}

      <button
        onClick={handleSubmit}
        className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
      >
        {joined ? "Update Profile" : "Save Profile"}
      </button>
    </div>
  );
}
