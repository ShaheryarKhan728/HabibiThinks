const { test, expect, _electron } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const HUB_APP = path.join(__dirname, "..", "hub-app");
const PHRASES = require(path.join(HUB_APP, "phrases.json"));
const { parse } = require(path.join(HUB_APP, "node_modules", "jsonc-parser"));

const OURS = { mode: "replace", verbs: PHRASES };
const CLAUDE_ORIGINAL = '{\n  "theme": "dark"\n}\n';
const VSCODE_ORIGINAL = '{\n  "editor.fontSize": 14\n}\n';

let app;
let window;
let claudeDir;
let vscodeAppData;
let vscodeExtensions;

const claudeSettings = () => path.join(claudeDir, "settings.json");
const vscodeSettings = () => path.join(vscodeAppData, "Code", "User", "settings.json");
const claudeState = () => path.join(claudeDir, "habibi-thinks.json");
const vscodeState = () => path.join(path.dirname(vscodeSettings()), "habibi-thinks.json");
const readText = (file) => fs.readFileSync(file, "utf8");
const readSettings = (file) => parse(readText(file), [], { allowTrailingComma: true });
const flipSwitch = () => window.locator(".switch").click();

// Puts the settings files in a known state and reopens the window.
async function startWith({ claude = CLAUDE_ORIGINAL, vscode = VSCODE_ORIGINAL } = {}) {
  fs.writeFileSync(claudeSettings(), claude);
  fs.writeFileSync(vscodeSettings(), vscode);
  fs.rmSync(claudeState(), { force: true });
  fs.rmSync(vscodeState(), { force: true });
  await window.reload();
}

test.beforeAll(async () => {
  // Throwaway Claude and VS Code folders, so the tests never touch the real ones.
  claudeDir = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-claude-"));
  vscodeAppData = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-vscode-"));
  fs.mkdirSync(path.dirname(vscodeSettings()), { recursive: true });
  vscodeExtensions = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-vscode-ext-"));
  fs.mkdirSync(path.join(vscodeExtensions, "anthropic.claude-code-1.0.0"));

  // Set PACKAGED_APP to a built app's executable to test that instead of the source.
  const appToRun = process.env.PACKAGED_APP
    ? { executablePath: process.env.PACKAGED_APP, args: [] }
    : { executablePath: require(path.join(HUB_APP, "node_modules", "electron")), args: [HUB_APP] };

  app = await _electron.launch({
    ...appToRun,
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
  await startWith();
  await expect(window.locator("#state")).toHaveText("Off");
  await expect(window.locator("#toggle")).not.toBeChecked();
});

test("switching on writes the phrases and keeps other settings", async () => {
  await startWith();
  await flipSwitch();
  await expect(window.locator("#message")).toHaveText("Yallah! Habibi Thinks is on.");
  await expect(window.locator("#state")).toHaveText("On");

  expect(readSettings(claudeSettings())).toEqual({ theme: "dark", spinnerVerbs: OURS });
  expect(readSettings(vscodeSettings())).toEqual({ "editor.fontSize": 14, "claudeCode.spinnerVerbs": OURS });

  // Files are written through a temp file, which must not be left behind.
  const leftovers = [...fs.readdirSync(claudeDir), ...fs.readdirSync(path.dirname(vscodeSettings()))];
  expect(leftovers.filter((name) => name.includes("habibi-tmp"))).toEqual([]);
});

test("shows On again when the app reopens", async () => {
  await startWith();
  await flipSwitch();
  await expect(window.locator("#state")).toHaveText("On");

  await window.reload();
  await expect(window.locator("#state")).toHaveText("On");
  await expect(window.locator("#toggle")).toBeChecked();
});

test("switching off puts the files back exactly as they were", async () => {
  await startWith();
  await flipSwitch();
  await expect(window.locator("#state")).toHaveText("On");
  await flipSwitch();
  await expect(window.locator("#message")).toHaveText("Habibi Thinks is off.");
  await expect(window.locator("#state")).toHaveText("Off");

  expect(readText(claudeSettings())).toBe(CLAUDE_ORIGINAL);
  expect(readText(vscodeSettings())).toBe(VSCODE_ORIGINAL);
  expect(fs.existsSync(claudeState())).toBe(false);
  expect(fs.existsSync(vscodeState())).toBe(false);
});

test("keeps comments, trailing commas and indentation in VS Code settings", async () => {
  const commented = '{\n    // my comment\n    "editor.fontSize": 14,\n}\n';
  await startWith({ vscode: commented });

  await flipSwitch();
  await expect(window.locator("#message")).toHaveText("Yallah! Habibi Thinks is on.");
  expect(readText(vscodeSettings())).toContain("    // my comment");
  expect(readSettings(vscodeSettings())["claudeCode.spinnerVerbs"]).toEqual(OURS);

  await flipSwitch();
  await expect(window.locator("#state")).toHaveText("Off");
  expect(readText(vscodeSettings())).toBe(commented);
});

test("puts back the user's own loading words when switched off", async () => {
  const own = { mode: "append", verbs: ["My own word"] };
  await startWith({ claude: JSON.stringify({ theme: "dark", spinnerVerbs: own }, null, 2) + "\n" });

  // The user's own words aren't ours, so the switch shows Off.
  await expect(window.locator("#state")).toHaveText("Off");

  await flipSwitch();
  await expect(window.locator("#state")).toHaveText("On");
  expect(readSettings(claudeSettings()).spinnerVerbs).toEqual(OURS);

  await flipSwitch();
  await expect(window.locator("#state")).toHaveText("Off");
  expect(readSettings(claudeSettings())).toEqual({ theme: "dark", spinnerVerbs: own });
  expect(fs.existsSync(claudeState())).toBe(false);
});

test("leaves a settings file with a mistake untouched and says so plainly", async () => {
  for (const broken of ['{ "theme": ', "null"]) {
    await startWith({ claude: broken });
    await flipSwitch();
    await expect(window.locator("#message")).toContainText(
      "Claude Code (terminal): your Claude Code settings file has a mistake in it, so Habibi Thinks didn't change it."
    );
    expect(readText(claudeSettings())).toBe(broken);
  }
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

// The app never needs the internet, so it must refuse to go online at all.

test("the window can't reach the internet", async () => {
  const result = await window.evaluate(async () => {
    try {
      await fetch("https://example.com");
      return "reached";
    } catch {
      return "blocked";
    }
  });
  expect(result).toBe("blocked");
});

test("the app itself can't reach the internet", async () => {
  const result = await app.evaluate(async ({ net }) => {
    try {
      await net.fetch("https://example.com");
      return "reached";
    } catch {
      return "blocked";
    }
  });
  expect(result).toBe("blocked");
});

test("the window refuses injected scripts", async () => {
  const ran = await window.evaluate(async () => {
    const script = document.createElement("script");
    script.textContent = "window.injectedScriptRan = true";
    document.body.append(script);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return window.injectedScriptRan === true;
  });
  expect(ran).toBe(false);
});

test("the window can't navigate away or open new windows", async () => {
  await window.evaluate(() => {
    window.location.href = "https://example.com";
  });
  await window.waitForTimeout(500);
  expect(window.url()).toMatch(/^file:.*index\.html$/);

  const opened = await window.evaluate(() => window.open("https://example.com") !== null);
  expect(opened).toBe(false);
});

test("the window is refused every permission", async () => {
  const answer = await window.evaluate(() => Notification.requestPermission());
  expect(answer).toBe("denied");
});

test("the built app has its safety switches locked", async () => {
  test.skip(!process.env.PACKAGED_APP, "Only applies to a built app.");
  const { getCurrentFuseWire, FuseV1Options } = require("@electron/fuses");

  // On Mac the switches live inside the .app bundle, not the program file.
  const target = process.env.PACKAGED_APP.replace(/(\.app)\/.*$/, "$1");
  const fuses = await getCurrentFuseWire(target);
  const OFF = 48;
  const ON = 49;

  expect(fuses[FuseV1Options.RunAsNode]).toBe(OFF);
  expect(fuses[FuseV1Options.EnableNodeOptionsEnvironmentVariable]).toBe(OFF);
  expect(fuses[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]).toBe(ON);
  expect(fuses[FuseV1Options.OnlyLoadAppFromAsar]).toBe(ON);
});
