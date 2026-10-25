const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const phrases = require("./phrases.json");
const claudeCode = require("./patchers/claude-code");
const vscode = require("./patchers/vscode");

const TARGETS = [
  { name: "Claude Code (terminal)", patcher: claudeCode },
  { name: "Claude Code (VS Code)", patcher: vscode },
];

// Placeholder until the extension is actually published to a store.
const EXTENSION_STORE_URL = "https://github.com/ShaheryarKhan728/HabibiThinks";

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 460,
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

// Runs the action on every Claude app found, and reports each one on its own line.
function runOnAll(action, doneText) {
  return TARGETS.map(({ name, patcher }) => {
    if (!patcher.isInstalled()) return `${name}: not found, skipped`;
    try {
      action(patcher);
      return `${name}: ${doneText}`;
    } catch (error) {
      return `${name}: ${error.message}`;
    }
  }).join("\n");
}

ipcMain.handle("get-status", () => ({
  claudeCode: claudeCode.isInstalled(),
  vscode: vscode.isInstalled(),
}));

ipcMain.handle("turn-on", () => runOnAll((patcher) => patcher.turnOn(phrases), "on"));

ipcMain.handle("turn-off", () => runOnAll((patcher) => patcher.turnOff(), "off"));

ipcMain.handle("open-extension-page", () => {
  shell.openExternal(EXTENSION_STORE_URL);
});
