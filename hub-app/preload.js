const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("habibi", {
  getStatus: () => ipcRenderer.invoke("get-status"),
  getVerbs: () => ipcRenderer.invoke("get-verbs"),
  saveVerbs: (verbs) => ipcRenderer.invoke("save-verbs", verbs),
  resync: () => ipcRenderer.invoke("resync"),
  openExtensionPage: () => ipcRenderer.invoke("open-extension-page"),
});
