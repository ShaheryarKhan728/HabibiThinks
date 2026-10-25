const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("habibi", {
  isOn: () => ipcRenderer.invoke("is-on"),
  turnOn: () => ipcRenderer.invoke("turn-on"),
  turnOff: () => ipcRenderer.invoke("turn-off"),
  openExtensionPage: () => ipcRenderer.invoke("open-extension-page"),
});
