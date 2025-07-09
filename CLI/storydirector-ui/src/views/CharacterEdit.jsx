import React from "react";
import FormEditor from "../components/forms/FormEditor";

export default function CharacterEdit() {
  // Path is relative to public folder
  const schemaPath = "/glossary/forms/character.json";

  const handleSubmit = (formData) => {
    console.log("[CharacterEdit] Submitted formData:", formData);
    alert("Submitted! Check the console for formData.");
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Character Editor (Schema-Driven)</h1>
      <FormEditor schemaPath={schemaPath} onSubmit={handleSubmit} />
    </div>
  );
}
