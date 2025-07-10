import React, { useEffect, useState } from "react";
import FormRenderer from "./FormRenderer";
import { useFormEngine } from "../../utils/useFormEngine";
import { useFormFiller } from "../../hooks/useFormFiller";

/**
 * FormEditor - Generic form editor that loads a schema and renders a form
 * @param {string} schemaPath - Path to the JSON schema file (relative to public or src)
 * @param {Object} [initial] - Optional initial values
 * @param {Function} [onChange] - Optional callback when formData changes
 * @param {Function} [onSubmit] - Optional callback for form submission
 * @param {Function} [onFormFillerReady] - Optional callback to expose form filler methods
 */
export default function FormEditor({ schemaPath, initial = {}, onChange, onSubmit, onFormFillerReady }) {
  const [fields, setFields] = useState([]);
  const { formData, setFormData, updateFromAI } = useFormEngine(fields, initial);
  const formFiller = useFormFiller(formData, setFormData);

  // Load schema
  useEffect(() => {
    async function loadSchema() {
      let schema;
      if (schemaPath.startsWith("/")) {
        // Try to fetch from public folder
        const res = await fetch(schemaPath);
        schema = await res.json();
      } else {
        // Try to import from src (dynamic import)
        schema = (await import(schemaPath)).default;
      }
      setFields(schema.fields || schema);
    }
    loadSchema();
  }, [schemaPath]);

  // Expose form filler methods to parent (for Addy/automation)
  useEffect(() => {
    if (onFormFillerReady) {
      onFormFillerReady(formFiller);
    }
    // Only call when formFiller or onFormFillerReady changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFiller, onFormFillerReady]);

  // Notify parent on change
  useEffect(() => {
    if (onChange) onChange(formData);
  }, [formData, onChange]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
      }}
      className="space-y-6"
    >
      <FormRenderer fields={fields} formData={formData} onChange={(id, value) => setFormData(f => ({ ...f, [id]: value }))} />
      {onSubmit && (
        <div className="flex justify-end">
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm">Save</button>
        </div>
      )}
    </form>
  );
}
