// storyArcQuiz.js
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storagePath = path.resolve(__dirname, "./storage");

const questions = [
  {
    message: "Your protagonist is offered a chance to rewrite their past. They:",
    choices: [
      { name: "Say yes — they’ll fix everything", arc: "Redemption" },
      { name: "Say no — scars are part of growth", arc: "Rebirth" },
      { name: "Try to rewrite it, but break something else", arc: "Tragedy" },
      { name: "Say ‘what past?’ and walk away laughing", arc: "Absurdist" },
      { name: "Rewrite someone else’s past instead", arc: "Antihero" }
    ]
  },
  {
    message: "What kind of ending fits this story?",
    choices: [
      { name: "Happy — full resolution, earned joy", arc: "Hero's Journey" },
      { name: "Sad — the cost was too great", arc: "Tragedy" },
      { name: "Bittersweet — win some, lose some", arc: "Rebirth" },
      { name: "Cliffhanger — mystery remains", arc: "Nonlinear" },
      { name: "Loop — it ends where it began", arc: "Cycle" }
    ]
  },
  {
    message: "What kind of antagonist does your story attract?",
    choices: [
      { name: "The charming one who lies with a smile", arc: "Psychological" },
      { name: "The brute who destroys because they can", arc: "Hero's Journey" },
      { name: "The one who thinks they’re saving the world", arc: "Tragedy" },
      { name: "The fool who doesn’t even realize they’re the problem", arc: "Absurdist" },
      { name: "The system — faceless, endless, unmovable", arc: "Rebellion" }
    ]
  },
  {
    message: "Where would you most want to read this story?",
    choices: [
      { name: "Curled up in a blanket during a thunderstorm", arc: "Emotional" },
      { name: "Sitting in a coffee shop, eavesdropping on strangers", arc: "Slice of Life" },
      { name: "Lying on a beach, sun in your eyes", arc: "Adventure" },
      { name: "In the tub with candles lit and existential dread", arc: "Philosophical" },
      { name: "Anywhere — as long as I'm alone with it", arc: "Introspective" }
    ]
  }
];

const arcSummaries = {
  "Hero's Journey": "A classic structure where your protagonist is tested, grows, and returns changed.",
  "Rebirth": "A story of painful transformation and eventual renewal.",
  "Tragedy": "A descent toward downfall, whether inevitable or preventable.",
  "Redemption": "The road to making things right — no matter the cost.",
  "Absurdist": "Reality is flexible. Meaning is fluid. The story resists neat resolution.",
  "Antihero": "A morally complex or selfish protagonist on a crooked path.",
  "Cycle": "Stories that repeat, haunt, or mirror themselves.",
  "Psychological": "Driven by internal conflict, manipulation, or unraveling minds.",
  "Rebellion": "Fighting against systems, fate, or the past.",
  "Emotional": "Focused on resonance, memory, and vulnerability.",
  "Slice of Life": "Quiet, intimate, grounded storytelling.",
  "Adventure": "Movement, discovery, escape — a call to roam.",
  "Philosophical": "Built to explore questions more than answers.",
  "Introspective": "More about what’s happening inside than outside.",
  "Nonlinear": "Time bends, events circle, and meaning lives in the gaps."
};

(async () => {
  console.log("\n🎯 StoryDirector: Story Arc Quiz\n");

  const projects = fs.readdirSync(storagePath).filter((name) => {
    const fullPath = path.join(storagePath, name);
    return fs.statSync(fullPath).isDirectory();
  });

  if (projects.length === 0) {
    console.log("⚠️  No projects found. Run createProject.js first.");
    return;
  }

  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message: "Which project is this quiz for?",
      choices: projects
    }
  ]);

  const arcTally = {};

  for (const q of questions) {
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: q.message,
        choices: q.choices.map(c => c.name)
      }
    ]);

    const selected = q.choices.find(c => c.name === choice);
    arcTally[selected.arc] = (arcTally[selected.arc] || 0) + 1;
  }

  // Find the most common arc
  const sorted = Object.entries(arcTally).sort((a, b) => b[1] - a[1]);
  const topArc = sorted[0][0];

  console.log(`\n🎭 You got: ${topArc} Arc`);
  console.log(arcSummaries[topArc] || "An unusual shape worth exploring.");

  const metaPath = path.join(storagePath, selectedProject, "metadata.json");
  const metadata = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};

  const { confirmSave } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmSave",
      message: "Would you like to save this arc to your project metadata?",
      default: true
    }
  ]);

  if (confirmSave) {
    metadata.storyArc = topArc;
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
    console.log("✅ Story arc saved.");
  } else {
    console.log("⚠️  Story arc not saved.");
  }
})();
