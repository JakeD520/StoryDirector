// webServer.js
import express from "express";
import fs from "fs";
import path from "path";
import createProject from "./api/createProject.js";
import createPitch from "./api/pitch.js";



const app = express();
const port = 3001;
const storagePath = path.resolve("./storage");

app.use(express.static("./public"));
app.use(express.json());

app.post("/api/createProject", createProject);
app.post("/api/pitch", createPitch);


// List projects
app.get("/api/projects", (req, res) => {
  const projects = fs.readdirSync(storagePath).filter(name =>
    fs.statSync(path.join(storagePath, name)).isDirectory()
  );
  res.json(projects);
});

// List files in a subdirectory
app.get("/api/list", (req, res) => {
  const { project, type } = req.query;
  const dir = path.join(storagePath, project, type === "character" ? "characters" : "chapters");
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
  res.json(files);
});

// Load a file
app.get("/api/load", (req, res) => {
  const { project, type, file } = req.query;
  let filePath;
  if (type === "glossary") {
    filePath = path.join(storagePath, project, "glossary", "voiceGlossary.json");
  } else if (type === "blueprint") {
    filePath = path.join(storagePath, project, "chapters", file, "chapterBlueprint.json");
  } else if (type === "pitch") {
    filePath = path.join(storagePath, project, "pitch.json");
  } else {
    const subdir = type === "character" ? "characters" : "chapters";
    filePath = path.join(storagePath, project, subdir, file);
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  const data = fs.readFileSync(filePath, "utf-8");
  try {
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: "Failed to parse JSON" });
  }
});

// Save a file
app.post("/api/save", (req, res) => {
  const { project, type, file } = req.query;
  let filePath;
  if (type === "glossary") {
    const dir = path.join(storagePath, project, "glossary");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    filePath = path.join(dir, "voiceGlossary.json");
  } else if (type === "blueprint") {
    const dir = path.join(storagePath, project, "chapters", file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    filePath = path.join(dir, "chapterBlueprint.json");
  } else {
    const subdir = type === "character" ? "characters" : "chapters";
    const dir = path.join(storagePath, project, subdir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    filePath = path.join(dir, file);
  }

  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`🚀 JSON prose server running at http://localhost:${port}`);
});
