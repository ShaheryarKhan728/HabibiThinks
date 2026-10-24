const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");

const VERBS_PATH = path.join(__dirname, "..", "shared", "verbs.json");
const PATCHER_PATH = path.join(__dirname, "..", "patchers", "claude-code.js");
const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");

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

ipcMain.handle("get-status", () => {
  return {
    claudeCode: fs.existsSync(CLAUDE_DIR),
  };
});

ipcMain.handle("get-verbs", () => readVerbs());

ipcMain.handle("save-verbs", (_event, verbs) => {
  fs.writeFileSync(VERBS_PATH, JSON.stringify({ verbs }, null, 2) + "\n");
  return true;
});

ipcMain.handle("resync", () => {
  return new Promise((resolve) => {
    execFile("node", [PATCHER_PATH], (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, message: (stderr || error.message).trim() });
      } else {
        resolve({ ok: true, message: stdout.trim() });
      }
    });
  });
});

ipcMain.handle("open-extension-page", () => {
  shell.openExternal(EXTENSION_STORE_URL);
});
