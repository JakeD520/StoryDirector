import React from "react";

export default function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="font-semibold mb-1">{label}</label>
      <select
        id={id}
        className="border rounded p-2"
        value={value}
        onChange={e => onChange(id, e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
    </div>
  );
}
