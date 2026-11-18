# browser-extension

A Manifest V3 browser extension for Claude.ai web (Chrome and Edge — Firefox needs a small manifest tweak later).

## What it changes

While Claude thinks, claude.ai shows a status row. It changes only two things in it:

- **Short status words** like "Weighing" or "Revisiting" become one of the Habibi phrases, e.g. "Yallah habibi, I'm thinking…".
- **"Thought for 3m 25s"** becomes "Habibi thought for 3m 25s" — the time stays.

It leaves alone the full-sentence thinking summaries (like "Weighing latency limits against regional data residency rules.") and all chat text.

## How it finds them

claude.ai wraps the status row in an element marked `data-cds="TurnStatus"` (a component name from its design system, so it changes far less often than styling class names). The extension only looks at text inside that element. If claude.ai renames it, `STATUS_BLOCK` in `content.js` is the one thing to update.

## Try it locally (unpacked)

1. Go to `chrome://extensions` (or `edge://extensions` in Edge) and turn on "Developer mode".
2. Click "Load unpacked" and select this `browser-extension` folder. The picker only shows folders, so the folder looks empty — that's normal, just select it.
3. In Edge, it's listed under "From other sources".
4. Open claude.ai and send a message — watch the status row while Claude thinks.

## Phrases

`phrases.js` is the extension's own copy of `hub-app/phrases.json` (an extension can't read files outside its folder). If you change one, change the other — the tests fail if they don't match.
