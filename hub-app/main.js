const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const phrases = require("./phrases.json");
const claudeCode = require("./patchers/claude-code");
const vscode = require("./patchers/vscode");

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
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// On if any Claude app found already has the phrases.
function isOn() {
  return TARGETS.some(({ patcher }) => {
    try {
      return patcher.isInstalled() && patcher.isOn();
    } catch {
      return false;
    }
  });
}

// Runs the action on every Claude app found. Returns only the problems.
function runOnAll(action) {
  const problems = [];
  for (const { name, patcher } of TARGETS) {
    if (!patcher.isInstalled()) continue;
    try {
      action(patcher);
    } catch (error) {
      problems.push(`${name}: ${error.message}`);
    }
  }
  return problems;
}

ipcMain.handle("is-on", () => isOn());

ipcMain.handle("turn-on", () => runOnAll((patcher) => patcher.turnOn(phrases)));

ipcMain.handle("turn-off", () => runOnAll((patcher) => patcher.turnOff()));

ipcMain.handle("open-extension-page", () => {
  shell.openExternal(EXTENSION_STORE_URL);
});
