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

## What they check

- **hub-app.spec.js** — opens the real hub app and clicks its buttons: status, word list, Save, Resync, and the extension button. It points Claude Code at a throwaway settings folder (`CLAUDE_CONFIG_DIR`), so your real settings are never touched, and puts `shared/verbs.json` back afterwards.
- **extension.spec.js** — loads the real extension into Chromium and serves a fake claude.ai page, so no login is needed. Checks that loading words get swapped and that normal chat text is left alone.

## What they can't check

Whether real claude.ai shows its loading word in the shape the extension looks for. That needs a person logged in to claude.ai with the extension loaded.
