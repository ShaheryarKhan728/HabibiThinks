// Shared by both patchers: safely turns our phrases on or off in one
// settings file.
//
// - Only our one setting is changed. Comments, trailing commas, indentation
//   and everything else in the file stay exactly as they were (jsonc-parser
//   is the library VS Code itself uses for its settings files).
// - Files are written to a temp file first and then swapped in, so a crash
//   or power cut can never leave a half-written settings file.
// - If the user already had their own value for the setting, it's saved in
//   habibi-thinks.json next to the settings file and put back on turn off.

const fs = require("fs");
const path = require("path");
const { parse, modify, applyEdits } = require("jsonc-parser");

// An error whose message is plain enough to show the user as-is.
class SettingsProblem extends Error {}

function read(file, label) {
  if (!fs.existsSync(file)) return { text: "", settings: {} };
  const text = fs.readFileSync(file, "utf8");
  if (!text.trim()) return { text, settings: {} };

  const errors = [];
  const settings = parse(text, errors, { allowTrailingComma: true });
  const isObject = settings !== null && typeof settings === "object" && !Array.isArray(settings);
  if (errors.length > 0 || !isObject) {
    throw new SettingsProblem(`your ${label} settings file has a mistake in it, so Habibi Thinks didn't change it.`);
  }
  return { text, settings };
}

function writeSafely(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Write through symlinks (e.g. synced dotfiles) instead of replacing them.
  const target = fs.existsSync(file) ? fs.realpathSync(file) : file;
  const temp = `${target}.habibi-tmp`;
  fs.writeFileSync(temp, text);
  try {
    fs.renameSync(temp, target);
  } catch (error) {
    fs.rmSync(temp, { force: true });
    throw error;
  }
}

// Match the file's own indentation and line endings.
function formatting(text) {
  const indent = /\n([ \t]+)"/.exec(text);
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  if (indent && indent[1].startsWith("\t")) return { insertSpaces: false, tabSize: 1, eol };
  return { insertSpaces: true, tabSize: indent ? indent[1].length : 2, eol };
}

// Sets one key, or removes it when value is undefined.
function setKey(file, text, key, value) {
  const base = text.trim() ? text : "{}";
  const edits = modify(base, [key], value, { formattingOptions: formatting(base) });
  writeSafely(file, applyEdits(base, edits));
}

function stateFile(file) {
  return path.join(path.dirname(file), "habibi-thinks.json");
}

function readPrevious(state) {
  try {
    return JSON.parse(fs.readFileSync(state, "utf8")).previous;
  } catch {
    return undefined;
  }
}

function hasOurPhrases(value, phrases) {
  return Boolean(value) && JSON.stringify(value.verbs) === JSON.stringify(phrases);
}

// Ours if we turned it on (state file exists), or it holds exactly our
// phrases (e.g. copied over by VS Code Settings Sync). Anything else is the
// user's own and is never overwritten without a backup, or deleted.
function isOurs(settings, key, file, phrases) {
  if (settings[key] === undefined) return false;
  return fs.existsSync(stateFile(file)) || hasOurPhrases(settings[key], phrases);
}

function isOn(file, key, label, phrases) {
  return isOurs(read(file, label).settings, key, file, phrases);
}

function turnOn(file, key, label, phrases) {
  const { text, settings } = read(file, label);
  const state = stateFile(file);
  const savedNow = !fs.existsSync(state);
  if (savedNow) {
    const previous = hasOurPhrases(settings[key], phrases) ? undefined : settings[key];
    writeSafely(state, JSON.stringify({ previous }, null, 2) + "\n");
  }
  try {
    setKey(file, text, key, { mode: "replace", verbs: phrases });
  } catch (error) {
    if (savedNow) fs.rmSync(state, { force: true });
    throw error;
  }
}

function turnOff(file, key, label, phrases) {
  const { text, settings } = read(file, label);
  if (settings[key] !== undefined && !isOurs(settings, key, file, phrases)) return;

  const state = stateFile(file);
  const previous = readPrevious(state);
  if (settings[key] !== undefined || previous !== undefined) setKey(file, text, key, previous);
  fs.rmSync(state, { force: true });
}

module.exports = { SettingsProblem, isOn, turnOn, turnOff };
