#!/usr/bin/env node

// Applies the word list from shared/verbs.json to Claude Code.
// Claude Code has a built-in settings field for this (spinnerVerbs), shared
// by the CLI, the VS Code extension and the Claude Desktop Code tab, so this
// just edits that one settings file. No guessing, no patching of app files.

const fs = require("fs");
const os = require("os");
const path = require("path");

// Claude Code keeps its settings in CLAUDE_CONFIG_DIR when set, else ~/.claude.
const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
const SETTINGS_PATH = path.join(CLAUDE_DIR, "settings.json");
const VERBS_PATH = path.join(__dirname, "..", "shared", "verbs.json");

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return fallback;
  return JSON.parse(text);
}

function main() {
  const { verbs } = readJson(VERBS_PATH, { verbs: [] });
  if (!verbs || verbs.length === 0) {
    console.error("No words found in shared/verbs.json. Add some words first.");
    process.exit(1);
  }

  const settings = readJson(SETTINGS_PATH, {});
  settings.spinnerVerbs = { mode: "replace", verbs };

  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");

  console.log(`Applied ${verbs.length} word(s) to ${SETTINGS_PATH}`);
}

main();
