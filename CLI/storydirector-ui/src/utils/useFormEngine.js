import { useState, useCallback } from "react";

/**
 * useFormEngine - manages flat form state and LLM/AI updates
 * @param {Array} fields - schema array (with id for each field)
 * @param {Object} [initial] - initial values (optional)
 * @returns {Object} { formData, setFormData, updateFromAI }
 */
export function useFormEngine(fields, initial = {}) {
  // Flatten initial values to match field ids (e.g., { appearance: { eyes: "Blue" } } => { "appearance.eyes": "Blue" })
  const flatten = (obj, prefix = "") => {
    let out = {};
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(out, flatten(obj[key], prefix ? `${prefix}.${key}` : key));
      } else {
        out[prefix ? `${prefix}.${key}` : key] = obj[key];
      }
    }
    return out;
  };

  const [formData, setFormData] = useState(() => {
    return { ...flatten(initial) };
  });

  // Update from LLM/AI (accepts nested or flat)
  const updateFromAI = useCallback((obj) => {
    setFormData(prev => ({ ...prev, ...flatten(obj) }));
  }, []);

  return { formData, setFormData, updateFromAI };
}
