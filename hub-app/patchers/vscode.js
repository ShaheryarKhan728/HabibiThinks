// The Claude Code extension in VS Code ignores ~/.claude/settings.json for its
// loading words and reads its own VS Code setting instead. We only add or
// remove that one entry in VS Code's user settings file.

const fs = require("fs");
const os = require("os");
const path = require("path");

const SETTING = "claudeCode.spinnerVerbs";

// Same lookups VS Code does: VSCODE_EXTENSIONS and VSCODE_APPDATA if set,
// else the usual folders.
function extensionsDir() {
  return process.env.VSCODE_EXTENSIONS || path.join(os.homedir(), ".vscode", "extensions");
}

function appData() {
  if (process.env.VSCODE_APPDATA) return process.env.VSCODE_APPDATA;
  if (process.platform === "win32") return process.env.APPDATA;
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Application Support");
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
}

function settingsPath() {
  return path.join(appData(), "Code", "User", "settings.json");
}

// VS Code allows comments in this file. Rewriting it as plain JSON would
// delete them, so if it isn't plain JSON, leave it alone.
function readSettings(file) {
  if (!fs.existsSync(file)) return {};
  const text = fs.readFileSync(file, "utf8").trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `your VS Code settings file has comments, so it was left untouched. Change "${SETTING}" in it by hand.`
    );
  }
}

function writeSettings(file, settings) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + "\n");
}

function isInstalled() {
  const dir = extensionsDir();
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((name) => name.startsWith("anthropic.claude-code"));
}

function isOn() {
  return SETTING in readSettings(settingsPath());
}

function turnOn(phrases) {
  const file = settingsPath();
  const settings = readSettings(file);
  settings[SETTING] = { mode: "replace", verbs: phrases };
  writeSettings(file, settings);
}

function turnOff() {
  const file = settingsPath();
  const settings = readSettings(file);
  if (!(SETTING in settings)) return;
  delete settings[SETTING];
  writeSettings(file, settings);
}

module.exports = { isInstalled, isOn, turnOn, turnOff };
