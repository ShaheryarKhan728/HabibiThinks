async function init() {
  const status = await window.habibi.getStatus();
  document.getElementById("status-claude-code").textContent = status.claudeCode
    ? "found"
    : "not found";
  document.getElementById("status-vscode").textContent = status.vscode ? "found" : "not found";

  const verbs = await window.habibi.getVerbs();
  document.getElementById("verbs").value = verbs.join("\n");
}

document.getElementById("save").addEventListener("click", async () => {
  const verbs = document
    .getElementById("verbs")
    .value.split("\n")
    .map((word) => word.trim())
    .filter(Boolean);
  await window.habibi.saveVerbs(verbs);
});

document.getElementById("resync").addEventListener("click", async () => {
  const resultEl = document.getElementById("resync-result");
  resultEl.textContent = "Resyncing...";
  const result = await window.habibi.resync();
  resultEl.textContent = result.ok ? `Done: ${result.message}` : `Error: ${result.message}`;
});

document.getElementById("install-extension").addEventListener("click", () => {
  window.habibi.openExtensionPage();
});

init();
