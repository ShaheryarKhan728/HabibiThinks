// The Claude Code extension in VS Code ignores ~/.claude/settings.json for its
// loading words and reads its own VS Code setting instead. We only change
// that one entry in VS Code's user settings file.

const fs = require("fs");
const os = require("os");
const path = require("path");
const settingsFile = require("./settings-file");

const KEY = "claudeCode.spinnerVerbs";
const LABEL = "VS Code";

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

function isInstalled() {
  const dir = extensionsDir();
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((name) => name.startsWith("anthropic.claude-code"));
}

module.exports = {
  isInstalled,
  isOn: (phrases) => settingsFile.isOn(settingsPath(), KEY, LABEL, phrases),
  turnOn: (phrases) => settingsFile.turnOn(settingsPath(), KEY, LABEL, phrases),
  turnOff: (phrases) => settingsFile.turnOff(settingsPath(), KEY, LABEL, phrases),
};
