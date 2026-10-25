const { test, expect, _electron } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const HUB_APP = path.join(__dirname, "..", "hub-app");
const PHRASES = require(path.join(HUB_APP, "phrases.json"));

let app;
let window;
let claudeDir;
let vscodeAppData;
let vscodeExtensions;

const claudeSettings = () => path.join(claudeDir, "settings.json");
const vscodeSettings = () => path.join(vscodeAppData, "Code", "User", "settings.json");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

test.beforeAll(async () => {
  // Throwaway Claude and VS Code folders, so the test never touches the real
  // ones. Each starts with a setting of the user's own, which must survive.
  claudeDir = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-claude-"));
  fs.writeFileSync(claudeSettings(), JSON.stringify({ theme: "dark" }));

  vscodeAppData = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-vscode-"));
  fs.mkdirSync(path.dirname(vscodeSettings()), { recursive: true });
  fs.writeFileSync(vscodeSettings(), JSON.stringify({ "editor.fontSize": 14 }));

  vscodeExtensions = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-vscode-ext-"));
  fs.mkdirSync(path.join(vscodeExtensions, "anthropic.claude-code-1.0.0"));

  app = await _electron.launch({
    executablePath: require(path.join(HUB_APP, "node_modules", "electron")),
    args: [HUB_APP],
    env: {
      ...process.env,
      CLAUDE_CONFIG_DIR: claudeDir,
      VSCODE_APPDATA: vscodeAppData,
      VSCODE_EXTENSIONS: vscodeExtensions,
    },
  });
  window = await app.firstWindow();
});

test.afterAll(async () => {
  if (app) await app.close();
  for (const dir of [claudeDir, vscodeAppData, vscodeExtensions]) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("shows Claude Code and VS Code as found", async () => {
  await expect(window.locator("#status-claude-code")).toHaveText("found");
  await expect(window.locator("#status-vscode")).toHaveText("found");
});

test("Turn on writes the phrases and keeps other settings", async () => {
  await window.locator("#turn-on").click();
  await expect(window.locator("#result")).toHaveText(
    "Claude Code (terminal): on\nClaude Code (VS Code): on"
  );

  const expected = { mode: "replace", verbs: PHRASES };
  expect(readJson(claudeSettings())).toEqual({ theme: "dark", spinnerVerbs: expected });
  expect(readJson(vscodeSettings())).toEqual({
    "editor.fontSize": 14,
    "claudeCode.spinnerVerbs": expected,
  });
});

test("Turn off removes the phrases and keeps other settings", async () => {
  await window.locator("#turn-off").click();
  await expect(window.locator("#result")).toHaveText(
    "Claude Code (terminal): off\nClaude Code (VS Code): off"
  );

  expect(readJson(claudeSettings())).toEqual({ theme: "dark" });
  expect(readJson(vscodeSettings())).toEqual({ "editor.fontSize": 14 });
});

test("leaves a VS Code settings file with comments untouched", async () => {
  const withComments = '{\n  // my comment\n  "editor.fontSize": 14\n}\n';
  fs.writeFileSync(vscodeSettings(), withComments);

  await window.locator("#turn-on").click();
  await expect(window.locator("#result")).toContainText("Claude Code (VS Code): your VS Code settings file has comments");
  expect(fs.readFileSync(vscodeSettings(), "utf8")).toBe(withComments);
});

test("Install Browser Extension opens a web page", async () => {
  // Catch the link instead of really opening a browser.
  await app.evaluate(({ shell }) => {
    shell.openExternal = async (url) => {
      globalThis.openedUrl = url;
    };
  });
  await window.locator("#install-extension").click();

  await expect
    .poll(() => app.evaluate(() => globalThis.openedUrl))
    .toMatch(/^https:\/\//);
});
