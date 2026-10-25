# tests

Playwright tests for the hub app and the browser extension.

## Run them

First install the hub app (the tests launch it):

```
cd hub-app
npm install
```

Then:

```
cd tests
npm install
npx playwright install chromium
npm test
```

They also run automatically on Windows and Mac on every push, through GitHub Actions (`.github/workflows/tests.yml`).

## What they check

- **hub-app.spec.js** — opens the real hub app and clicks its buttons: status, Turn on, Turn off, and the extension button. It points Claude Code and VS Code at throwaway folders (`CLAUDE_CONFIG_DIR`, `VSCODE_APPDATA`, `VSCODE_EXTENSIONS`), so your real settings are never touched. Checks that other settings survive, and that a VS Code settings file with comments is left alone.
- **extension.spec.js** — loads the real extension into Chromium and serves a fake claude.ai page shaped like the real one, so no login is needed. Checks that status words get swapped and that summaries and chat text are left alone.
- **phrases.spec.js** — checks the app and the extension use the same phrases.

## What they can't check

Real claude.ai, which needs a login. If claude.ai changes its status block, check it by hand with the extension loaded.
