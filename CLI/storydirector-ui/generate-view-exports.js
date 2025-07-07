import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsDir = path.join(__dirname, "src", "views");

function isJSXFile(file) {
  return file.endsWith(".jsx") && !file.startsWith("index");
}

function createIndex(folderPath) {
  const files = fs.readdirSync(folderPath).filter(isJSXFile);
  if (files.length === 0) {
    console.log(`⚠️ No .jsx files found in ${folderPath}`);
    return;
  }
  const exports = files.map((file) => {
    const name = file.replace(".jsx", "");
    return `export { default as ${name} } from "./${name}";`;
  });
  const indexPath = path.join(folderPath, "index.js");
  fs.writeFileSync(indexPath, exports.join("\n"), "utf8");
  console.log(`✅ index.js created in ${folderPath}`);
}

function run() {
  if (!fs.existsSync(viewsDir)) {
    console.error("❌ src/views directory not found.");
    return;
  }

  const folders = fs.readdirSync(viewsDir).filter((name) => {
    const fullPath = path.join(viewsDir, name);
    return fs.statSync(fullPath).isDirectory();
  });

  if (folders.length === 0) {
    console.log("⚠️ No subfolders found in views/. Try organizing first.");
    return;
  }

  folders.forEach((folder) => {
    const folderPath = path.join(viewsDir, folder);
    createIndex(folderPath);
  });
}

run();
