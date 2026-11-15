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

## Build the installers

- **Windows**, on a Windows PC: `npm run dist`. The installer lands in `hub-app/dist/HabibiThinks-Setup-<version>.exe`.
- **Both Windows and Mac**: push a version tag (e.g. `git tag v0.1.0` then `git push origin v0.1.0`), or once the workflow is on `main`, open **Actions → Build installers → Run workflow**. It builds both installers, tests the built apps on real Windows and Mac machines, and attaches the files to the run (`HabibiThinks-<version>.dmg` for Mac, a universal build for Intel and Apple Silicon).

The installers aren't code-signed yet, so Windows shows a "Windows protected your PC" warning and Mac blocks the app on first open. See the steps for testers below.

### First open on Mac (unsigned build)

1. Open the `.dmg` and drag Habibi Thinks into Applications.
2. Open Habibi Thinks. Mac says it can't verify the app — click **Done**.
3. Open **System Settings → Privacy & Security**, scroll down, and click **Open Anyway** next to Habibi Thinks.

If Mac instead says the app "is damaged", open Terminal and run `xattr -cr "/Applications/Habibi Thinks.app"`, then open it again.
