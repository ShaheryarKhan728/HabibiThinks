# hub-app

The one app a user installs. Built with Electron — plain HTML/CSS/JS, no framework, no bundler. Everything it needs is inside this folder, so the installed app doesn't need Node.js.

It has one switch:

- **On** — writes the phrases from `phrases.json` into each Claude app found, and shows "Yallah! Habibi Thinks is on."
- **Off** — removes them, so Claude shows its normal words again.

The switch shows the current state when the app opens. Below it, **Install Browser Extension** opens the extension's page in the user's browser (points at this repo as a placeholder until the extension is published to a store).

No background processes — everything happens when the switch or button is pressed.

## Look

Desert Gold theme: sand background with a faint eight-point star pattern, gold accents, and the bilingual tagline "Yallah, let Claude think like a habibi." / "يلّا، خلّ كلود يفكّر على طريقة حبيبي".

- `logo.svg` — the dallah logo. `icon.png` is the same logo at 512px, used as the window icon.
- `fonts/` — Tajawal (regular and bold), bundled so it works offline. Licensed under the SIL Open Font License, see `fonts/OFL.txt`.

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
