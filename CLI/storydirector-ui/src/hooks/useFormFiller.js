import { useCallback } from "react";

/**
 * useFormFiller - a hook to allow programmatic filling of form fields (for Addy or automation)
 * @param {object} form - the form state object
 * @param {function} setForm - the setState function for the form
 * @returns {object} { fillField, fillFields }
 */
export function useFormFiller(form, setForm) {
  // Fill a single field
  const fillField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, [setForm]);

  // Fill multiple fields at once
  const fillFields = useCallback((fields) => {
    setForm(prev => ({ ...prev, ...fields }));
  }, [setForm]);

  return { fillField, fillFields };
}
