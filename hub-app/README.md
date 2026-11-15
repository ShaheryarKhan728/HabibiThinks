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

## Locked down

The app never needs the internet, so it's built to refuse it:

- **No internet:** every request that isn't for the app's own local files is cancelled (`main.js`), and the page's content security policy (`index.html`) only allows the app's own files — no inline scripts. Styling lives in `style.css` so the policy can stay strict.
- **No navigation:** the window can't be sent to a website or open new windows. "Install Browser Extension" hands a fixed link to the user's own browser.
- **No permissions:** camera, microphone, notifications and every other permission are refused.
- **Safety switches (Electron fuses):** set in `package.json` → `build.electronFuses`. The app can't be run as plain Node.js, ignores `NODE_OPTIONS`, checks its own files on launch, and only loads its packaged files.
  - **Exception:** `enableNodeCliInspectArguments` (the debugger switch) stays **on** because the Playwright tests use it to drive the built app. Turn it off before the paid version ships, since that version will hold sign-in details.

The tests check all of this, and switching the lockdown off makes them fail.

## patchers/

- **claude-code.js** — Claude Code in the terminal. Sets or removes `spinnerVerbs` in `~/.claude/settings.json` (or in `CLAUDE_CONFIG_DIR` if set).
- **vscode.js** — the Claude Code extension in VS Code. It ignores `~/.claude/settings.json` and reads its own `claudeCode.spinnerVerbs` setting, so this sets or removes that in VS Code's user `settings.json`.
- **settings-file.js** — the shared part that safely edits one settings file:
  - Only our one setting changes. Comments, trailing commas, indentation and everything else stay exactly as they were (it uses `jsonc-parser`, the library VS Code itself uses).
  - Files are written to a temp file first and then swapped in, so a crash can't leave a half-written settings file.
  - If the user already had their own loading words, they're saved in `habibi-thinks.json` next to the settings file and put back on switch off.
  - A settings file with a mistake in it is left untouched, and the app says so in plain words.

Neither patcher touches any app files — only that one setting.

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
4. Open Habibi Thinks again and click **Open Anyway** in the box that appears.

**Known gap:** some Macs say the app "is damaged" instead. That can only be fixed properly by signing and notarizing the app with an Apple Developer account, which is planned before launch. Users must never be asked to use Terminal, so until then, report it rather than working around it.
