import React, { useState, useRef, useEffect } from "react";
import { getAddyResponse } from "../../utils/addy/addyResponder";
import { ErrorBoundary } from "./ErrorBoundary";

function AddyChatInner({ panelData, applyPanelEdit, apiKey: initialApiKey }) {
  const [addyMessages, setAddyMessages] = useState([
    { role: "system", content: "Hi, I'm Addy. How can I assist with your story today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [addyMessages]);

  useEffect(() => {
    if (initialApiKey) setApiKey(initialApiKey);
  }, [initialApiKey]);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const updatedMessages = [...addyMessages, { role: "user", content: userInput }];
    setAddyMessages(updatedMessages);
    setUserInput("");

    try {
      const systemContent = panelData
        ? `You are Addy, the user's assistant director. Here is the current panel context:\n\n${JSON.stringify(panelData, null, 2)}`
        : "You are Addy, the user's assistant director. No panel data found.";

      const enrichedMessages = [
        { role: "system", content: systemContent },
        ...updatedMessages
      ];

      const { response } = await getAddyResponse({ input: userInput, panelData, apiKey });

      let didAutoApply = false;
      const codeBlockMatch = response.match(/window\.applyPanelEdit\((\{[\s\S]*?\})\)/);
      if (codeBlockMatch) {
        try {
          // eslint-disable-next-line no-new-func
          const editObj = Function('return ' + codeBlockMatch[1])();
          if (applyPanelEdit && typeof applyPanelEdit === 'function') {
            applyPanelEdit(editObj);
            didAutoApply = true;
          }
        } catch (e) {
          console.warn("[Addy] Failed to auto-execute applyPanelEdit from code block:", e);
        }
      } else {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const editObj = JSON.parse(jsonMatch[0]);
            if (editObj.type && applyPanelEdit && typeof applyPanelEdit === 'function') {
              applyPanelEdit(editObj);
              didAutoApply = true;
            }
          } catch (e) {
            // Not valid JSON, skip
          }
        }
      }

      setAddyMessages([
        ...updatedMessages,
        { role: "assistant", content: response + (didAutoApply ? "\n\n✅ Character edit applied!" : "") }
      ]);
    } catch (err) {
      console.error("Error calling LLM:", err);
      setAddyMessages([...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error." }]);
    }
  };

  const handleSaveKey = () => {
    localStorage.setItem("openrouter_api_key", apiKey);
    setShowSettings(false);
  };

  return (
    <div className="w-96 h-full border-l border-gray-800 p-6 bg-gradient-to-t from-gray-900 to-black shadow-inner flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Addy <br/> (Assistant Director)</h2>
        <button onClick={() => setShowSettings(true)} className="text-xs text-emerald-400 hover:underline">Settings</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 text-sm">
        {addyMessages.map((msg, i) => (
          <div key={i} className={`relative group p-2 rounded-md ${msg.role === "user" ? "bg-gray-800 text-right" : "bg-gray-700 text-left"}`}>
            {msg.content}
            {msg.role === "assistant" && (
              <button
                onClick={() => navigator.clipboard.writeText(msg.content)}
                className="absolute top-1 right-1 text-xs text-zinc-400 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition"
                title="Copy to clipboard"
              >📋</button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask Addy something..."
          className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white resize-none"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className="mt-2 w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm">
          Send
        </button>
      </div>
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-white">OpenRouter API Key</h3>
            <input
              type="text"
              name="openrouter_api_key"
              id="openrouter_api_key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here"
              className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white mb-4"
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
              <button onClick={handleSaveKey} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddyChat(props) {
  return (
    <ErrorBoundary fallback={<div>Sorry, Addy encountered an error. Please try again or reload.</div>}>
      <AddyChatInner {...props} />
    </ErrorBoundary>
  );
}
