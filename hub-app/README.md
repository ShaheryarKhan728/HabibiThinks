# hub-app

The one app a user installs. Built with Electron — plain HTML/CSS/JS, no framework, no bundler.

It has:

- A home screen showing whether Claude Code (terminal) and the Claude Code VS Code extension are found on the machine.
- A box to edit your phrases, saved to `shared/verbs.json`.
- A "Resync" button that runs every script in `patchers/` (Claude Code terminal, then VS Code).
- An "Install Browser Extension" button that opens a page in the user's browser (currently points at this repo as a placeholder until the extension is published to a real store).

No background processes — everything happens when a button is pressed.

## Run it

```
cd hub-app
npm install
npm start
```

Tested on Windows with real clicks and by the Playwright tests in `tests/`.
