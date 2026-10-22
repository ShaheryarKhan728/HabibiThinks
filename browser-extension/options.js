const textarea = document.getElementById("words");
const status = document.getElementById("status");

chrome.storage.local.get("verbs", (result) => {
  const verbs = result.verbs && result.verbs.length > 0 ? result.verbs : DEFAULT_WORDS;
  textarea.value = verbs.join("\n");
});

document.getElementById("save").addEventListener("click", () => {
  const verbs = textarea.value
    .split("\n")
    .map((word) => word.trim())
    .filter(Boolean);

  chrome.storage.local.set({ verbs }, () => {
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1500);
  });
});
