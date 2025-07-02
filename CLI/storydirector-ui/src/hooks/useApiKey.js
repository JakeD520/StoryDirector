import { useState, useEffect } from "react";

export default function useApiKey() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("openrouter_api_key");
    if (stored) setApiKey(stored);
  }, []);

  const saveApiKey = (key) => {
    localStorage.setItem("openrouter_api_key", key);
    setApiKey(key); // this line ensures state updates too
  };

  return { apiKey, saveApiKey };
}
