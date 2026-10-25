const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("habibi", {
  getStatus: () => ipcRenderer.invoke("get-status"),
  turnOn: () => ipcRenderer.invoke("turn-on"),
  turnOff: () => ipcRenderer.invoke("turn-off"),
  openExtensionPage: () => ipcRenderer.invoke("open-extension-page"),
});
