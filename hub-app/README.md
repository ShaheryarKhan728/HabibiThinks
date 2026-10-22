# hub-app

The one app a user installs. Built with Electron — plain HTML/CSS/JS, no framework, no bundler.

It has:

- A home screen showing whether Claude Code (CLI/VS Code) is detected on the machine.
- A box to edit your word list, saved to `shared/verbs.json`.
- A "Resync" button that re-runs `patchers/claude-code.js`.
- An "Install Browser Extension" button that opens a page in the user's browser (currently points at this repo as a placeholder until the extension is published to a real store).

No background processes — everything happens when a button is pressed.

## Run it

```
cd hub-app
npm install
npm start
```

## Status

Startup was checked under a virtual display here and runs without crashing, but the buttons haven't been clicked on a real screen yet — that still needs checking on an actual desktop before calling this done.
