// Watches the claude.ai page for its loading word and swaps it for one of
// ours. We don't key off Claude's CSS class names (those change often and
// we can't see the live page from here to confirm them) — instead we match
// any short text that looks like a loading word: "Word..." or "Word…".

let words = DEFAULT_WORDS;

chrome.storage.local.get("verbs", (result) => {
  if (result.verbs && result.verbs.length > 0) {
    words = result.verbs;
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.verbs) {
    words = changes.verbs.newValue;
  }
});

function pickWord() {
  return words[Math.floor(Math.random() * words.length)];
}

const SPINNER_PATTERN = /^[A-Za-z][A-Za-z\- ]*?(\.{3}|…)$/;

function tryReplace(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const text = node.textContent.trim();
  if (!text) return;

  const match = text.match(SPINNER_PATTERN);
  if (!match) return;

  const suffix = match[1];
  const core = text.slice(0, text.length - suffix.length).trim();

  // Already one of ours — leave it, so we don't re-randomize on every
  // unrelated DOM update and flicker the word mid-display.
  if (words.includes(core)) return;

  node.textContent = `${pickWord()}${suffix}`;
}

function walk(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    tryReplace(node);
    return;
  }
  node.childNodes && node.childNodes.forEach(walk);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "characterData") {
      tryReplace(mutation.target);
    } else {
      mutation.addedNodes.forEach(walk);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
