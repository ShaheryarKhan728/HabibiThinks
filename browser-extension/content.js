// Changes the short status words claude.ai shows while Claude thinks, like
// "Weighing" or "Revisiting", to a Habibi phrase, and "Thought for 3m 25s"
// to "Habibi thought for 3m 25s". Only text inside claude.ai's thinking
// status block (data-cds="TurnStatus") is touched — the full-sentence
// thinking summaries and all chat text are left alone.

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

const STATUS_BLOCK = '[data-cds="TurnStatus"]';
const SHORT_LABEL = /^[A-Z][a-z-]*ing(\.{3}|…)?$/;
const THOUGHT_FOR = /^Thought for (.+)$/;

function tryReplace(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const parent = node.parentElement;
  if (!parent || !parent.closest(STATUS_BLOCK)) return;

  const text = node.textContent.trim();

  const thought = text.match(THOUGHT_FOR);
  if (thought) {
    node.textContent = `Habibi thought for ${thought[1]}`;
    return;
  }

  const label = text.match(SHORT_LABEL);
  if (!label) return;

  // A user's own single word could look like a status word — leave it, so we
  // don't keep re-picking and flicker.
  const core = text.replace(/(\.{3}|…)$/, "");
  if (words.includes(core)) return;

  node.textContent = `${pickWord()}${label[1] || "…"}`;
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

// Change labels already on the page (e.g. older answers in this chat), then
// keep watching for new ones.
walk(document.body);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
