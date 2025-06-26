import fs from "fs";
import path from "path";

const storagePath = path.resolve("./storage");

export default function createProject(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { projectName } = req.body;
  if (!projectName || typeof projectName !== "string" || projectName.trim() === "") {
    return res.status(400).json({ error: "Invalid project name" });
  }

  const folderName = projectName.trim().toLowerCase().replace(/\s+/g, "-");
  const projectDir = path.join(storagePath, folderName);

  try {
    if (fs.existsSync(projectDir)) {
      return res.status(409).json({ error: "Project already exists" });
    }

    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, "metadata.json"), JSON.stringify({
      name: projectName.trim(),
      created: new Date().toISOString()
    }, null, 2));
    fs.writeFileSync(path.join(projectDir, "notes.txt"), "# Notes\n\n");
    fs.writeFileSync(path.join(projectDir, "pitch.json"), "{}\n");

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Project creation failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
