# 🧠 Addy Assistant – TODO

This file tracks the design and implementation plan for Addy's standalone assistant logic.

## ✅ GOAL

Move Addy out of `SceneComposer.jsx` and into her own dedicated brain module at `src/utils/addy/`.

---

## 📁 FILE STRUCTURE

```
src/utils/addy/
├── addyEngine.js          # Addy's core logic router
├── characterSkills.js     # Character-specific generation/editing
├── locationSkills.js      # Location-specific generation/editing
├── voiceSkills.js         # VoiceDNA generation and analysis
├── memory.js              # (Future) contextual memory for continuity
└── todo.md                # This file
```

---

## 🛠️ STEP-BY-STEP PLAN

### 1. 🎯 Create Addy Engine Entry

* [ ] `getAddyCommand({ input, panelData })`
* [ ] Route to skill modules based on `panelData.type`

### 2. 🧬 Character Skill Module

* [ ] Handle full character generation (`addCharacter`)
* [ ] Handle targeted field updates (e.g., just `bio`)
* [ ] Map `focusFields` to fields like `bio`, `appearance`, etc.

### 3. 🌍 Location Skill Module

* [ ] Handle full location generation (`addLocation`)
* [ ] Handle field-specific logic (e.g., description only)

### 4. 🔊 Voice Skill Module

* [ ] Generate or revise VoiceDNA
* [ ] Possibly integrate with radar chart updates

### 5. 🔄 SceneComposer Integration

* [ ] Replace Addy LLM logic in `SceneComposer.jsx` with call to `addyEngine`
* [ ] Handle returned `editCommand` and pipe it to `applyPanelEdit`

### 6. 🎙️ Future Voice Activation

* [ ] Add toggle button for voice input
* [ ] Route spoken input through `addyEngine`

---

## 🧪 TEST CASES

* [ ] “Addy, create a half-orc bard named Varnak who plays the harp.”
* [ ] “Give Tweedy McFucksticks a tragic backstory.” (only `bio`)
* [ ] “Make a spooky graveyard in a misty town square.” (location)
* [ ] “Add a new character with only a cool appearance and name.”
* [ ] “Make her voice more erratic and lyrical.” (VoiceDNA)

---

## ✨ IDEAS

* Addy could offer `[Save]`, `[Try Again]`, or `[Customize]` buttons after generating content.
* Addy could store session memory or references to past characters.
* Could support a sandbox mode: “Just draft without saving yet.”

---

## 🧹 CLEANUP

* [ ] Remove LLM parsing from `SceneComposer.jsx`
* [ ] Convert `handleSend` to dispatch input to `addyEngine`
* [ ] Move prompt templates into skill modules (centralize)

---

## 👁️‍🗨️ NOTES

* All LLM calls still route through `callLLM()`
* Output must always return an `editCommand` object consumable by `applyPanelEdit()`
* Panel must expose a valid `handleEdit()` for Addy to interact
