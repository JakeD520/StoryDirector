import React from "react";

export default function TextField({ id, label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="font-semibold mb-1">{label}</label>
      <input
        id={id}
        type="text"
        className="border rounded p-2"
        value={value}
        onChange={e => onChange(id, e.target.value)}
      />
    </div>
  );
}
