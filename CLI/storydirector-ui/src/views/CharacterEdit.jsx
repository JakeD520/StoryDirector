import React, { useRef, useEffect, useState } from "react";
import FormEditor from "../components/forms/FormEditor";

export default function CharacterEdit() {
  const schemaPath = "/glossary/forms/character.json";
  const formFillerRef = useRef(null);
  const [fieldIds, setFieldIds] = useState([]);

  const handleSubmit = (formData) => {
    console.log("[CharacterEdit] Submitted formData:", formData);
    alert("Submitted! Check the console for formData.");
  };

  // This will be called by FormEditor when the form filler is ready
  const handleFormFillerReady = (filler) => {
    formFillerRef.current = filler;
    // Wire up Addy/LLM automation: allow AddyResponder to call form filler
    window.applyPanelEdit = (fields) => {
      // Filter fields to only those in the schema
      const filtered = Object.fromEntries(
        Object.entries(fields).filter(([key]) => fieldIds.includes(key))
      );
      if (formFillerRef.current && typeof formFillerRef.current.fillFields === 'function') {
        formFillerRef.current.fillFields(filtered);
      } else {
        console.warn("[CharacterEdit] Form filler not ready or fillFields not available.");
      }
    };
  };

  // Dynamically load schema and extract field IDs for Addy prompt and filtering
  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await fetch(schemaPath);
        const schema = await res.json();
        const ids = (schema.fields || []).map(f => f.id);
        setFieldIds(ids);
        // Optionally, expose to window or context for Addy system prompt
        window.currentCharacterFieldIds = ids;
        window.currentCharacterSchema = schema.fields || [];
      } catch (e) {
        setFieldIds([]);
      }
    }
    fetchSchema();
  }, [schemaPath]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Character Editor (Schema-Driven)</h1>
      <FormEditor
        schemaPath={schemaPath}
        onSubmit={handleSubmit}
        onFormFillerReady={handleFormFillerReady}
      />
    </div>
  );
}