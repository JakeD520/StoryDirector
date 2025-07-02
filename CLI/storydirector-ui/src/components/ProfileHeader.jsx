import React from "react";

export default function ProfileHeader({ profile }) {
  if (!profile) return null;

  return (
    <div className="flex items-center gap-6 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
      {/* Avatar placeholder */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-gray-700 flex items-center justify-center">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt="User Avatar"
            className="object-cover w-full h-full"
    />
  ) : (
    <span className="text-white text-3xl font-bold">
      {profile.displayName?.[0] || "?"}
    </span>
  )}
</div>


      {/* Text info */}
      <div className="text-gray-200">
        <h2 className="text-3xl font-bold text-emerald-400">{profile.displayName}</h2>
        <p className="text-sm text-gray-400 italic mb-1">{profile.bio || "No bio yet."}</p>
        <p className="text-xs text-gray-500">Joined: {profile.joined?.split("T")[0]}</p>
      </div>
    </div>
  );
}

