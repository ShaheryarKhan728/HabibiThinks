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
  const on = toggle.checked;
  const problems = on ? await window.habibi.turnOn() : await window.habibi.turnOff();
  showState(on);
  const text = on ? "Yallah! Habibi Thinks is on." : "Habibi Thinks is off.";
  message.textContent = [text, ...problems].join("\n");
});

document.getElementById("install-extension").addEventListener("click", () => {
  window.habibi.openExtensionPage();
});

init();
