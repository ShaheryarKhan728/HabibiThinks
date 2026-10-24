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
let originalVerbs;

test.beforeAll(async () => {
  originalVerbs = fs.readFileSync(VERBS_PATH, "utf8");

  // A throwaway Claude settings folder, so the test never touches the real one.
  claudeDir = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-claude-"));

  app = await _electron.launch({
    executablePath: require(path.join(HUB_APP, "node_modules", "electron")),
    args: [HUB_APP],
    env: { ...process.env, CLAUDE_CONFIG_DIR: claudeDir },
  });
  window = await app.firstWindow();
});

test.afterAll(async () => {
  if (app) await app.close();
  fs.writeFileSync(VERBS_PATH, originalVerbs);
  fs.rmSync(claudeDir, { recursive: true, force: true });
});

test("shows Claude Code as found", async () => {
  await expect(window.locator("#status-claude-code")).toHaveText("found");
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

test("Resync writes the words into Claude Code settings", async () => {
  await window.locator("#resync").click();
  await expect(window.locator("#resync-result")).toContainText("Done: Applied 2 word(s)");

  const settings = JSON.parse(
    fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8")
  );
  expect(settings.spinnerVerbs).toEqual({
    mode: "replace",
    verbs: ["Habibi wait", "Test phrase habibi"],
  });
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
