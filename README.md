# HabibiThinks

Replace Claude's default thinking words with custom phrases. Yallah, habibi is thinking...

## Where it works

| Where | How |
|---|---|
| Claude Code in the terminal | The hub app's on/off switch sets Claude Code's `spinnerVerbs` setting. |
| Claude Code extension in VS Code | The same switch sets the extension's `claudeCode.spinnerVerbs` setting. |
| claude.ai in Chrome or Edge | The browser extension changes the short status words and "Thought for…" label. |
| Claude Desktop | Not supported. Both its tabs show claude.ai's own labels and ignore `spinnerVerbs`, and the app blocks all outside code. |

## Folders

- `hub-app/` — the one app users install, with the on/off switch.
- `browser-extension/` — the extension for claude.ai.
- `tests/` — Playwright tests for both.
