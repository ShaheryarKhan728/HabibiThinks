const { test, expect, _electron } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HUB_APP = path.join(ROOT, "hub-app");
const VERBS_PATH = path.join(ROOT, "shared", "verbs.json");

let app;
let window;
let claudeDir;
let vscodeAppData;
let originalVerbs;

test.beforeAll(async () => {
  originalVerbs = fs.readFileSync(VERBS_PATH, "utf8");

  // Throwaway Claude and VS Code settings folders, so the test never touches
  // the real ones.
  claudeDir = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-claude-"));
  vscodeAppData = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-vscode-"));
  fs.mkdirSync(path.join(vscodeAppData, "Code", "User"), { recursive: true });

  app = await _electron.launch({
    executablePath: require(path.join(HUB_APP, "node_modules", "electron")),
    args: [HUB_APP],
    env: { ...process.env, CLAUDE_CONFIG_DIR: claudeDir, VSCODE_APPDATA: vscodeAppData },
  });
  window = await app.firstWindow();
});

test.afterAll(async () => {
  if (app) await app.close();
  fs.writeFileSync(VERBS_PATH, originalVerbs);
  fs.rmSync(claudeDir, { recursive: true, force: true });
  fs.rmSync(vscodeAppData, { recursive: true, force: true });
});

test("shows Claude Code as found", async () => {
  await expect(window.locator("#status-claude-code")).toHaveText("found");
});

test("shows a VS Code status", async () => {
  // Depends on whether this machine has the VS Code extension, so just check
  // it was filled in.
  await expect(window.locator("#status-vscode")).toHaveText(/^(found|not found)$/);
});

test("shows the saved words", async () => {
  const { verbs } = JSON.parse(originalVerbs);
  await expect(window.locator("#verbs")).toHaveValue(verbs.join("\n"));
});

test("Save writes the words to shared/verbs.json", async () => {
  await window.locator("#verbs").fill("Habibi wait\nTest phrase habibi");
  await window.locator("#save").click();

  await expect
    .poll(() => JSON.parse(fs.readFileSync(VERBS_PATH, "utf8")).verbs)
    .toEqual(["Habibi wait", "Test phrase habibi"]);
});

test("Resync writes the words into Claude Code and VS Code settings", async () => {
  await window.locator("#resync").click();
  await expect(window.locator("#resync-result")).toContainText("Done: Applied 2 word(s)");

  const expected = { mode: "replace", verbs: ["Habibi wait", "Test phrase habibi"] };

  const claude = JSON.parse(fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8"));
  expect(claude.spinnerVerbs).toEqual(expected);

  const vscode = JSON.parse(
    fs.readFileSync(path.join(vscodeAppData, "Code", "User", "settings.json"), "utf8")
  );
  expect(vscode["claudeCode.spinnerVerbs"]).toEqual(expected);
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
