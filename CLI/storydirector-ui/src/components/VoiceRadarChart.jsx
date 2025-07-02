import React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function VoiceRadarChart({ data }) {
  if (!data) return null;

  // Transform data into chart format
  const chartData = Object.entries(data).map(([key, value]) => ({
    trait: key,
    score: value
  }));

  return (
    <div className="w-full h-96 bg-gray-900 p-4 rounded border border-gray-700 mt-4">
      <h3 className="text-lg font-bold mb-2 text-emerald-300">VoiceDNA Radar</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="trait" stroke="#aaa" fontSize={10} />
          <PolarRadiusAxis angle={30} domain={[0, 4]} stroke="#555" />
          <Radar name="Voice" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
