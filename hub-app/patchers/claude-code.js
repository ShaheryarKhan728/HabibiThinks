// Claude Code in the terminal reads its loading words from its documented
// spinnerVerbs setting. We only add or remove that one entry in its settings
// file — never any app files — so it keeps working across Claude updates.

const fs = require("fs");
const os = require("os");
const path = require("path");

// Claude Code keeps its settings in CLAUDE_CONFIG_DIR when set, else ~/.claude.
function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
}

function settingsPath() {
  return path.join(claudeDir(), "settings.json");
}

function readSettings(file) {
  if (!fs.existsSync(file)) return {};
  const text = fs.readFileSync(file, "utf8").trim();
  return text ? JSON.parse(text) : {};
}

function writeSettings(file, settings) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + "\n");
}

function isInstalled() {
  return fs.existsSync(claudeDir());
}

function turnOn(phrases) {
  const file = settingsPath();
  const settings = readSettings(file);
  settings.spinnerVerbs = { mode: "replace", verbs: phrases };
  writeSettings(file, settings);
}

function turnOff() {
  const file = settingsPath();
  const settings = readSettings(file);
  if (!("spinnerVerbs" in settings)) return;
  delete settings.spinnerVerbs;
  writeSettings(file, settings);
}

module.exports = { isInstalled, turnOn, turnOff };
