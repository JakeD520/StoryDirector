// genreSelector.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

let genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Historical",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
  "Slice of Life",
  "Supernatural",
  "Dystopian",
  "Cyberpunk",
  "Noir",
  "Other (Create New Genre)"
];

(async () => {
  console.log("\n🎭 StoryDirector: Genre Selector\n");

  const projects = fs.readdirSync(storagePath).filter((name) => {
    const fullPath = path.join(storagePath, name);
    return fs.statSync(fullPath).isDirectory();
  });

  if (projects.length === 0) {
    console.log("⚠️  No story projects found. Run createProject.js first.");
    return;
  }

  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message: "Which project do you want to assign genres to?",
      choices: projects,
    },
  ]);

  const metadataPath = path.join(storagePath, selectedProject, "metadata.json");
  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    : {};

  let done = false;
  let finalGenres = metadata.genres || [];

  while (!done) {
    const { selectedGenres } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedGenres",
        message: "Select one or more genres:",
        choices: genres,
        default: finalGenres,
      },
    ]);

    if (selectedGenres.includes("Other (Create New Genre)")) {
      const { newGenre } = await inquirer.prompt([
        {
          type: "input",
          name: "newGenre",
          message: "Enter your custom genre:",
          validate: (input) => input.trim() !== "" || "Genre cannot be empty",
        },
      ]);

      const trimmed = newGenre.trim();
      genres = genres.filter((g) => g !== "Other (Create New Genre)");
      if (!genres.includes(trimmed)) {
        genres.push(trimmed);
      }
      genres.push("Other (Create New Genre)");
      finalGenres = selectedGenres.filter(g => g !== "Other (Create New Genre)");
      finalGenres.push(trimmed);
    } else {
      finalGenres = selectedGenres;
      done = true;
    }
  }

  metadata.genres = finalGenres;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n💾 Genres saved to: storage/${selectedProject}/metadata.json\n`);
})();
