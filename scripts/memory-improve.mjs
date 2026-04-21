// scripts/memory-improve.mjs
// Weekly self-improving memory loop — run via GitHub Actions or manually.
//
// What it does:
//   1. Re-mines all three wings to pick up any new files
//   2. Generates an updated MORNING_BRIEF.md from the ai-signal wing
//   3. Logs wing status (drawer counts, last updated)
//
// Usage:
//   node scripts/memory-improve.mjs
//
// GitHub Actions: runs on Monday + on push to .claude/ or scripts/
// See: .github/workflows/memory-update.yml

import { execSync } from "child_process";
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Prefer local install (dev machine), fall back to PATH (CI)
const MEMPALACE_CANDIDATES = [
  "/Users/surajpandita/Library/Python/3.9/bin/mempalace",
  "mempalace",
];

function findMempalace() {
  for (const candidate of MEMPALACE_CANDIDATES) {
    try {
      execSync(`${candidate} --version`, { stdio: "pipe" });
      return candidate;
    } catch {
      // not found at this path
    }
  }
  throw new Error(
    "mempalace not found. Install: python3 -m pip install mempalace"
  );
}

function run(cmd, label) {
  console.log(`\n[memory-improve] ${label}`);
  try {
    const out = execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
    // Print summary lines only (lines with counts or Done)
    out.split("\n")
      .filter((l) => l.includes("Done") || l.includes("Drawers") || l.includes("Files") || l.includes("wing"))
      .forEach((l) => console.log("  " + l.trim()));
    return out;
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    return "";
  }
}

async function improveMemory() {
  console.log("=== AI Signal Memory Improvement Run ===");
  console.log("Started:", new Date().toISOString());

  const mp = findMempalace();
  console.log(`MemPalace: ${mp}`);

  const project = ROOT;
  const lenny = "/Users/surajpandita/lennys-podcast-transcripts/index";

  // Re-mine all wings (idempotent — already-filed content is skipped)
  run(`${mp} mine "${project}/.claude/" --wing ai-signal`, "Mining .claude/ → ai-signal");
  run(`${mp} mine "${project}/scripts/" --wing ai-signal-code`, "Mining scripts/ → ai-signal-code");
  run(`${mp} mine "${project}/lib/" --wing ai-signal-code`, "Mining lib/ → ai-signal-code");

  if (existsSync(lenny)) {
    run(`${mp} mine "${lenny}" --wing lenny-index`, "Mining Lenny index → lenny-index");
  } else {
    console.log("\n[memory-improve] Skipping lenny-index (not found on this machine)");
  }

  // Generate updated morning brief
  console.log("\n[memory-improve] Generating MORNING_BRIEF.md");
  try {
    const brief = execSync(`${mp} wake-up --wing ai-signal`, { encoding: "utf-8" });
    const briefPath = join(project, ".claude", "MORNING_BRIEF.md");
    const header = `# AI Signal Morning Brief\n*Generated: ${new Date().toISOString()}*\n\n`;
    writeFileSync(briefPath, header + brief, "utf-8");
    console.log("  Written: .claude/MORNING_BRIEF.md");
  } catch (err) {
    console.error("  Failed to generate brief:", err.message);
  }

  // Wing status
  console.log("\n[memory-improve] Wing status:");
  try {
    const status = execSync(`${mp} status`, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
    status.split("\n")
      .filter((l) => l.trim())
      .forEach((l) => console.log("  " + l));
  } catch {
    // status command may not be available in older versions
    console.log("  (status unavailable)");
  }

  console.log("\n=== Done:", new Date().toISOString(), "===");
}

improveMemory().catch((err) => {
  console.error("memory-improve failed:", err.message);
  process.exit(1);
});
