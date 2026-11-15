const toggle = document.getElementById("toggle");
const stateText = document.getElementById("state");
const message = document.getElementById("message");

function showState(on) {
  toggle.checked = on;
  stateText.textContent = on ? "On" : "Off";
}

async function init() {
  showState(await window.habibi.isOn());
}

toggle.addEventListener("change", async () => {
  const wanted = toggle.checked;
  toggle.disabled = true;

  let problems;
  try {
    problems = wanted ? await window.habibi.turnOn() : await window.habibi.turnOff();
  } catch {
    problems = ["Something went wrong, so nothing was changed."];
  }

  // Show what's really true now, not just what was asked for.
  const on = await window.habibi.isOn().catch(() => !wanted);
  showState(on);
  toggle.disabled = false;

  const lines = [];
  if (on === wanted) lines.push(on ? "Yallah! Habibi Thinks is on." : "Habibi Thinks is off.");
  message.textContent = [...lines, ...problems].join("\n");
});

document.getElementById("install-extension").addEventListener("click", () => {
  window.habibi.openExtensionPage();
});

init();
