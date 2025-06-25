// web/server.js
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import { callLLM } from "./lib/openRouterClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3001;
const storagePath = path.resolve(__dirname, "../storage");

dotenv.config();
app.use(cors());
app.use(express.json());

app.get("/projects", (req, res) => {
  const projects = fs.readdirSync(storagePath).filter((name) => {
    const fullPath = path.join(storagePath, name);
    return fs.statSync(fullPath).isDirectory();
  });
  res.json(projects);
});

app.post("/generate", async (req, res) => {
  const { project, customPrompt } = req.body;
  const readJson = (file) => {
    const filePath = path.join(storagePath, project, file);
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : null;
  };

  const pitch = readJson("pitch.json");
  const meta = readJson("metadata.json");
  const canon = readJson("canon.json");
  const weights = readJson("weights.json");
  const brainstorm = readJson("brainstorm.json");
  const outline = readJson("outline.json");

  let characters = "";
  const charDir = path.join(storagePath, project, "characters");
  if (fs.existsSync(charDir)) {
    const files = fs.readdirSync(charDir).filter(f => f.endsWith(".json"));
    characters = files.map(f => {
      const c = JSON.parse(fs.readFileSync(path.join(charDir, f), "utf8"));
      return `Character: ${c.name} (${c.role})\nGender: ${c.gender}\nOrigin: ${c.origin}\nAge: ${c.age}\nAppearance: ${c.appearance}\nPersonality: ${c.personality}\nSpeaking Style: ${c.speakingStyle}`;
    }).join("\n\n---\n\n");
  }

  const elements = [
    `Project: ${meta?.name || project}`,
    meta?.genres ? `Genres: ${meta.genres.join(", ")}` : null,
    meta?.tone ? `Tone: ${meta.tone}` : null,
    meta?.readerExperience ? `Reader Experience: ${meta.readerExperience.join(", ")}` : null,
    meta?.pov ? `POV: ${meta.pov}` : null,
    meta?.tense ? `Tense: ${meta.tense}` : null,
    meta?.contentRating ? `Content Rating: ${meta.contentRating}` : null,
    meta?.storyArc ? `Story Arc: ${meta.storyArc}` : null,
    pitch?.structured ? `Pitch:\n${pitch.structured}` : null,
    brainstorm ? `Story Elements:\n${JSON.stringify(brainstorm, null, 2)}` : null,
    weights ? `Prose Weighting:\n${Object.entries(weights).map(([k, v]) => `${k}: ${v}%`).join("\n")}` : null,
    canon ? `Narrative Canon:\n${Object.entries(canon).map(([k, v]) => `${k}: ${v}`).join("\n")}` : null,
    characters ? `Character Profiles:\n${characters}` : null,
    outline ? `Outline:\n${outline.map(s => `\n${s.section}:\n${s.beats.map(b => `• ${b.title}: ${b.description}`).join("\n")}`).join("\n\n")}` : null,
  ].filter(Boolean).join("\n\n");

  const fullPrompt = `You are a creative writing assistant. Given the following story data, write a short scene based on this custom request:\n\n"${customPrompt}"\n\n${elements}\n\nWrite the scene:`;

  try {
    const result = await callLLM(fullPrompt);
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 JSON prose server running at http://localhost:${port}`);
});
