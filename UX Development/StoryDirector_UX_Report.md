# StoryDirector Interface UX Report
**Version:** `Scene Composer Chamber – Stable Layout Baseline`

---

## 🎯 Purpose
A clean, sharp, and immersive writing tool interface for contributing to a collaborative storytelling canon. Prioritizes clarity, tone, and stylized direction without prose burden.

---

## 🧱 Structural Layout Overview

### 1. Three-Panel Grid System
- **Left Sidebar (`w-64`)**: Navigation and world tools
- **Main Panel (`flex-1`)**: Primary creative workspace
- **Right Sidebar (`w-64`)**: AI assistant labeled *“Assistant Director (Addy)”*

Each panel has clearly scoped roles and soft contrast using gradients, shadows, and rounded internal edges.

---

## 🖼️ Visual Design

### 🎨 Theme
- Dark, theatrical: `from-black via-gray-950 to-black`
- Typography: `font-serif` for a literary feel
- Rounded corners: `rounded-2xl` selectively applied to sidebars and content cards
- Background gradients: used subtly to define foreground layers

### 🌓 Contrast
- Uses layered opacities (`bg-black/30`, `from-gray-900/50`) and blur (`backdrop-blur-lg`)
- Panel contrast guided by inner border and soft shadows (`shadow-inner`, `shadow-xl`)

---

## 📍 Component Details

### 🔹 Left Sidebar: “StoryDirector”
- **Purpose**: Navigation to core tools
- **Header**: Enlarged `text-2xl` for brand identity
- **Items**:
  - Canon View
  - Factions
  - Characters
  - Timelines
  - Scene Deck
  - Voice Profiles

### 🔹 Top Bar (inside Main Panel)
- **Purpose**: Community access
- **Height**: `h-12`
- **Content**:
  - 📣 Community Updates (left)
  - [Top Stories], [Library], [My Profile], 🔔 Notification bell (right)
- Styled with `border-b` and subtle gradient for separation

### 🔹 Main Workspace Panel
- Placeholder for content staging
- Uses `motion.div` from Framer Motion for animated entry
- Framed in a `rounded-2xl` container with soft shadow and blur

### 🔹 Right Sidebar: “Assistant Director (Addy)”
- **Role**: AI tools for creative support
- **Header**: Stylized with character and function
- **Description**: Guidance copy explaining voice/tone support
- **Buttons**:
  - Generate directional hook
  - Scan for tonal inconsistencies
  - Suggest rhythm or pacing shift

Each button uses subtle arrow glyphs and hover transitions.

---

## 🔧 Interaction Model

### Not implemented yet:
- AI logic triggering on button click
- Scene editor / character tool injection
- Top bar routing or popouts (e.g. notifications, profile modal)

---

## 🧠 UX Philosophy Summary

| Trait               | Expression in UI                                      |
|---------------------|-------------------------------------------------------|
| Minimal but evocative | Focused panels, no clutter, consistent shadows       |
| Functional clarity   | Clean division of panel roles, topbar utility         |
| Tone alignment       | All elements reflect the StoryDirector metaphor       |
| Expandable           | Layout supports modular additions without refactor    |