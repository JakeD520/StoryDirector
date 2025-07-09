import React from "react";

export default function TopBar({ onShowProfile }) {
  return (
    <div className="w-full h-12 px-6 flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 text-sm text-gray-300 shadow-sm">
      <div>📣 Community Updates</div>
      <div className="flex gap-6">
        <span className="hover:text-white transition cursor-pointer">Top Stories</span>
        <span className="hover:text-white transition cursor-pointer">Library</span>
        <span className="hover:text-white transition cursor-pointer" onClick={onShowProfile}>My Profile</span>
        <span className="hover:text-white transition cursor-pointer">🔔</span>
      </div>
    </div>
  );
}
