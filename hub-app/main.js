const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");

const VERBS_PATH = path.join(__dirname, "..", "shared", "verbs.json");
const PATCHERS = ["claude-code.js", "vscode.js"].map((name) =>
  path.join(__dirname, "..", "patchers", name)
);
const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
const VSCODE_EXTENSIONS_DIR = path.join(os.homedir(), ".vscode", "extensions");

// Placeholder until the extension is actually published to a store.
const EXTENSION_STORE_URL = "https://github.com/ShaheryarKhan728/HabibiThinks";

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function readVerbs() {
  if (!fs.existsSync(VERBS_PATH)) return [];
  const data = JSON.parse(fs.readFileSync(VERBS_PATH, "utf8"));
  return data.verbs || [];
}

function hasVSCodeExtension() {
  if (!fs.existsSync(VSCODE_EXTENSIONS_DIR)) return false;
  return fs.readdirSync(VSCODE_EXTENSIONS_DIR).some((name) => name.startsWith("anthropic.claude-code"));
}

ipcMain.handle("get-status", () => {
  return {
    claudeCode: fs.existsSync(CLAUDE_DIR),
    vscode: hasVSCodeExtension(),
  };
});

ipcMain.handle("get-verbs", () => readVerbs());

ipcMain.handle("save-verbs", (_event, verbs) => {
  fs.writeFileSync(VERBS_PATH, JSON.stringify({ verbs }, null, 2) + "\n");
  return true;
});

function runPatcher(patcherPath) {
  return new Promise((resolve) => {
    execFile("node", [patcherPath], (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, message: (stderr || error.message).trim() });
      } else {
        resolve({ ok: true, message: stdout.trim() });
      }
    });
  });
}

ipcMain.handle("resync", async () => {
  const results = [];
  for (const patcher of PATCHERS) {
    results.push(await runPatcher(patcher));
  }
  return {
    ok: results.every((result) => result.ok),
    message: results.map((result) => result.message).join("\n"),
  };
});

ipcMain.handle("open-extension-page", () => {
  shell.openExternal(EXTENSION_STORE_URL);
});
