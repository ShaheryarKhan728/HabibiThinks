async function init() {
  const status = await window.habibi.getStatus();
  document.getElementById("status-claude-code").textContent = status.claudeCode ? "found" : "not found";
  document.getElementById("status-vscode").textContent = status.vscode ? "found" : "not found";
}

const result = document.getElementById("result");

document.getElementById("turn-on").addEventListener("click", async () => {
  result.textContent = await window.habibi.turnOn();
});

document.getElementById("turn-off").addEventListener("click", async () => {
  result.textContent = await window.habibi.turnOff();
});

document.getElementById("install-extension").addEventListener("click", () => {
  window.habibi.openExtensionPage();
});

init();
