# Habibi Thinks — working rules

## Keep it simple

Code, architecture, folder structure and names must all stay simple. No frameworks, bundlers or abstractions unless they're clearly needed. Explain things to the owner in simple language.

## Branches

- One feature branch per component: `feature/hub-app`, `feature/browser-extension`, `feature/ci`, `feature/docs`. Make new ones the same way.
- Merge feature branches into `develop` for testing.
- **Never push to or merge into `main` without the owner's explicit go-ahead.** `main` only changes through a reviewed PR from `develop`.
- A component's test changes go in the **same commit, on the same branch** as the code they test, so every commit's tests pass. `feature/tests` is only for test-only work.
- `feature/editor` holds the phrase editor removed from the free version. The paid version starts from it — don't delete it.

## Before every commit

Run the tests (see `tests/README.md`). They must all pass. They also run on Windows and Mac through GitHub Actions on every push.

## The product

- **Free version** (this repo): the built-in Habibi phrases and an on/off switch. No editor.
- **Paid version** (later, a separate private repo created from this one): a monthly subscription that unlocks the phrase editor. Users sign in through the website — no license keys to type.
- Supported: Claude Code in the terminal, the Claude Code extension in VS Code, and claude.ai in Chrome and Edge (English UI only). Not supported: Claude Desktop, Cursor, VSCodium, Arabic claude.ai.
- Users are non-technical. They download installers from a landing page — they must never need Node.js, npm or a terminal.
- `hub-app/phrases.json` and `browser-extension/phrases.js` must stay identical (a test checks this).
