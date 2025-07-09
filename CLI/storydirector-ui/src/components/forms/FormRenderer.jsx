import React from "react";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SelectField from "./SelectField";

/**
 * FormRenderer - Generic form renderer for schema-driven forms
 * @param {Array} fields - Array of field schema objects
 * @param {Object} formData - Current form values
 * @param {Function} onChange - (id, value) => void
 */
export default function FormRenderer({ fields, formData, onChange }) {
  return (
    <div className="space-y-4">
      {fields.map(field => {
        const value = formData[field.id] ?? "";
        switch (field.type) {
          case "text":
            return (
              <TextField
                key={field.id}
                id={field.id}
                label={field.label}
                value={value}
                onChange={onChange}
              />
            );
          case "textarea":
            return (
              <TextAreaField
                key={field.id}
                id={field.id}
                label={field.label}
                value={value}
                onChange={onChange}
              />
            );
          case "select":
            return (
              <SelectField
                key={field.id}
                id={field.id}
                label={field.label}
                value={value}
                options={field.options || []}
                onChange={onChange}
              />
            );
          // Add more field types as needed
          default:
            return null;
        }
      })}
    </div>
  );
}
