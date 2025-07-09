import React from "react";

export default function TextAreaField({ id, label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="font-semibold mb-1">{label}</label>
      <textarea
        id={id}
        className="border rounded p-2"
        value={value}
        onChange={e => onChange(id, e.target.value)}
        rows={4}
      />
    </div>
  );
}
