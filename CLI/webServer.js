// webServer.js
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const port = 3001;
const storagePath = path.resolve("./storage");

app.use(express.static("./public"));
app.use(express.json());

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
  } else {
    const subdir = type === "character" ? "characters" : "chapters";
    filePath = path.join(storagePath, project, subdir, file);
  }
  if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
  res.send(fs.readFileSync(filePath, "utf8"));
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
