#!/usr/bin/env node

// Applies the word list from shared/verbs.json to the Claude Code extension
// in VS Code. The extension ignores ~/.claude/settings.json for this and reads
// its own VS Code setting instead (claudeCode.spinnerVerbs), so this edits
// VS Code's user settings file.

const fs = require("fs");
const os = require("os");
const path = require("path");

const VERBS_PATH = path.join(__dirname, "..", "shared", "verbs.json");

// Same lookup VS Code does: VSCODE_APPDATA if set, else the OS's app data folder.
function vscodeAppData() {
  if (process.env.VSCODE_APPDATA) return process.env.VSCODE_APPDATA;
  if (process.platform === "win32") return process.env.APPDATA;
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Application Support");
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
}

function vscodeUserDir() {
  return path.join(vscodeAppData(), "Code", "User");
}

function main() {
  const { verbs } = JSON.parse(fs.readFileSync(VERBS_PATH, "utf8"));
  if (!verbs || verbs.length === 0) {
    console.error("No words found in shared/verbs.json. Add some words first.");
    process.exit(1);
  }

  const userDir = vscodeUserDir();
  if (!fs.existsSync(userDir)) {
    console.log("VS Code not found, skipped.");
    return;
  }

  const settingsPath = path.join(userDir, "settings.json");
  const text = fs.existsSync(settingsPath) ? fs.readFileSync(settingsPath, "utf8").trim() : "";

  // VS Code allows comments in this file. Rewriting it as plain JSON would
  // delete them, so if it isn't plain JSON, leave it alone.
  let settings;
  try {
    settings = text ? JSON.parse(text) : {};
  } catch {
    console.error(
      `${settingsPath} has comments or trailing commas, so it was left untouched. ` +
        `Add "claudeCode.spinnerVerbs" to it by hand.`
    );
    process.exit(1);
  }

  settings["claudeCode.spinnerVerbs"] = { mode: "replace", verbs };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");

  console.log(`Applied ${verbs.length} word(s) to ${settingsPath}`);
}

main();
