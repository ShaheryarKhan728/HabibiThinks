# browser-extension

A Manifest V3 browser extension for Claude.ai web (Chrome, Edge — Firefox needs a small manifest tweak later).

It watches the page for Claude's loading word and swaps it with one of your own, picked from the list saved in the extension's own storage (edit it from the extension's options page).

## How it finds the loading word

It does **not** look for a specific CSS class or element ID, because those change often and this was built without a live browser to check the real claude.ai markup against. Instead it watches the whole page for any short text that *looks* like a loading word — a word followed by `...` or `…` — and replaces it.

**This needs a real check before shipping**: load it as an unpacked extension, open claude.ai, send a message, and confirm the word actually gets swapped. If it doesn't, the pattern in `content.js` (`SPINNER_PATTERN`) is the one thing to adjust.

## Try it locally (unpacked)

1. Go to `chrome://extensions`, turn on "Developer mode".
2. Click "Load unpacked", select this `browser-extension` folder.
3. Open claude.ai and send a message — the loading word should be one of the defaults in `words.js`.
4. Click the extension's "Details" → "Extension options" to edit your word list.

## Keeping defaults in sync

`words.js` has its own copy of the starter words (a packaged extension can't read files outside its folder). If you change `shared/verbs.json`, update `words.js` to match by hand for now.
