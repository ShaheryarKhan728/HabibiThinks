const { app, BrowserWindow, ipcMain, session, shell } = require("electron");
const path = require("path");
const phrases = require("./phrases.json");
const claudeCode = require("./patchers/claude-code");
const vscode = require("./patchers/vscode");
const { SettingsProblem } = require("./patchers/settings-file");

const TARGETS = [
  { name: "Claude Code (terminal)", patcher: claudeCode },
  { name: "VS Code", patcher: vscode },
];

// Placeholder until the extension is actually published to a store.
const EXTENSION_STORE_URL = "https://github.com/ShaheryarKhan728/HabibiThinks";

function createWindow() {
  const win = new BrowserWindow({
    width: 440,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    backgroundColor: "#F5EBDD",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // The window must never become a web page or open new windows.
  win.webContents.on("will-navigate", (event) => event.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  win.loadFile("index.html");
}

// The app never needs the internet: cancel every request that isn't for its
// own local files, and refuse every permission (camera, notifications, ...).
function lockDown() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const local = details.url.startsWith("file:") || details.url.startsWith("data:");
    callback({ cancel: !local });
  });
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
}

app.whenReady().then(() => {
  lockDown();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// On Mac the app keeps running with no window; clicking the Dock icon reopens it.
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// On if any Claude app found already has the phrases.
function isOn() {
  return TARGETS.some(({ patcher }) => {
    try {
      return patcher.isInstalled() && patcher.isOn(phrases);
    } catch {
      return false;
    }
  });
}

// Runs the action on every Claude app found. Returns only the problems. One
// app failing — even while checking whether it's installed — never stops
// the others.
function runOnAll(action) {
  const problems = [];
  let found = false;
  for (const { name, patcher } of TARGETS) {
    try {
      if (!patcher.isInstalled()) continue;
      found = true;
      action(patcher);
    } catch (error) {
      found = true;
      const message =
        error instanceof SettingsProblem ? error.message : "something went wrong, so it was left unchanged.";
      problems.push(`${name}: ${message}`);
    }
  }
  if (!found) problems.push("No Claude app found. Install Claude Code or the VS Code extension first.");
  return problems;
}

ipcMain.handle("is-on", () => isOn());

ipcMain.handle("turn-on", () => runOnAll((patcher) => patcher.turnOn(phrases)));

ipcMain.handle("turn-off", () => runOnAll((patcher) => patcher.turnOff(phrases)));

ipcMain.handle("open-extension-page", () => {
  shell.openExternal(EXTENSION_STORE_URL);
});
