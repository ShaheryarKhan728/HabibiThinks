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
const flipSwitch = () => window.locator(".switch").click();

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

test("starts switched off", async () => {
  await expect(window.locator("#state")).toHaveText("Off");
  await expect(window.locator("#toggle")).not.toBeChecked();
});

test("switching on writes the phrases and keeps other settings", async () => {
  await flipSwitch();
  await expect(window.locator("#message")).toHaveText("Yallah! Habibi Thinks is on.");
  await expect(window.locator("#state")).toHaveText("On");

  const expected = { mode: "replace", verbs: PHRASES };
  expect(readJson(claudeSettings())).toEqual({ theme: "dark", spinnerVerbs: expected });
  expect(readJson(vscodeSettings())).toEqual({
    "editor.fontSize": 14,
    "claudeCode.spinnerVerbs": expected,
  });
});

test("shows On again when the app reopens", async () => {
  await window.reload();
  await expect(window.locator("#state")).toHaveText("On");
  await expect(window.locator("#toggle")).toBeChecked();
});

test("switching off removes the phrases and keeps other settings", async () => {
  await flipSwitch();
  await expect(window.locator("#message")).toHaveText("Habibi Thinks is off.");
  await expect(window.locator("#state")).toHaveText("Off");

  expect(readJson(claudeSettings())).toEqual({ theme: "dark" });
  expect(readJson(vscodeSettings())).toEqual({ "editor.fontSize": 14 });
});

test("leaves a VS Code settings file with comments untouched", async () => {
  const withComments = '{\n  // my comment\n  "editor.fontSize": 14\n}\n';
  fs.writeFileSync(vscodeSettings(), withComments);

  await flipSwitch();
  await expect(window.locator("#message")).toContainText("VS Code: your VS Code settings file has comments");
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
