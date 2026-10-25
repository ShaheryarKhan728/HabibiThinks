# hub-app

The one app a user installs. Built with Electron — plain HTML/CSS/JS, no framework, no bundler. Everything it needs is inside this folder, so the installed app doesn't need Node.js.

It has:

- Status lines showing whether Claude Code (terminal) and the Claude Code VS Code extension are found.
- **Turn on Habibi Thinks** — writes the phrases from `phrases.json` into each Claude app found.
- **Turn off** — removes them, so Claude shows its normal words again.
- **Install Browser Extension** — opens the extension's page in the user's browser (points at this repo as a placeholder until the extension is published to a store).

No background processes — everything happens when a button is pressed.

## patchers/

- **claude-code.js** — Claude Code in the terminal. Adds or removes `spinnerVerbs` in `~/.claude/settings.json` (or in `CLAUDE_CONFIG_DIR` if set).
- **vscode.js** — the Claude Code extension in VS Code. It ignores `~/.claude/settings.json` and reads its own `claudeCode.spinnerVerbs` setting, so this adds or removes that in VS Code's user `settings.json`. If that file has comments, it's left untouched (rewriting it would delete them) and the app says to change it by hand.

Neither touches any app files — only those settings entries, keeping everything else in the file as it was.

## Run it

```
cd hub-app
npm install
npm start
```
