// Claude Code in the terminal reads its loading words from its documented
// spinnerVerbs setting. We only change that one entry in its settings file —
// never any app files — so it keeps working across Claude updates.

const fs = require("fs");
const os = require("os");
const path = require("path");
const settingsFile = require("./settings-file");

const KEY = "spinnerVerbs";
const LABEL = "Claude Code";

// Claude Code keeps its settings in CLAUDE_CONFIG_DIR when set, else ~/.claude.
function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
}

function settingsPath() {
  return path.join(claudeDir(), "settings.json");
}

module.exports = {
  isInstalled: () => fs.existsSync(claudeDir()),
  isOn: (phrases) => settingsFile.isOn(settingsPath(), KEY, LABEL, phrases),
  turnOn: (phrases) => settingsFile.turnOn(settingsPath(), KEY, LABEL, phrases),
  turnOff: (phrases) => settingsFile.turnOff(settingsPath(), KEY, LABEL, phrases),
};
