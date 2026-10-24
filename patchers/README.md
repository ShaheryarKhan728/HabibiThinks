# patchers

Small scripts that apply the custom words from `shared/verbs.json` into each Claude platform. Neither touches any app files — they only write documented settings, so they keep working across app updates.

## claude-code.js — Claude Code in the terminal

Writes `spinnerVerbs` into `~/.claude/settings.json` (or into `CLAUDE_CONFIG_DIR` if you set that), keeping any other settings already there untouched.

```
node patchers/claude-code.js
```

## vscode.js — the Claude Code extension in VS Code

The VS Code extension ignores `~/.claude/settings.json` for this. It reads its own VS Code setting, `claudeCode.spinnerVerbs`, so this script writes that into VS Code's user `settings.json`. VS Code picks up the change without a restart.

```
node patchers/vscode.js
```

VS Code allows comments in its settings file. If yours has comments or trailing commas, the script leaves the file untouched (rewriting it would delete them) and tells you to add the setting by hand.

## Claude Desktop

Not supported — neither the chat tab nor the Code tab. Both are claude.ai's web page running inside the app, which shows Claude's own thinking labels and ignores `spinnerVerbs`. And the app blocks all outside code: no debugger, no `NODE_OPTIONS`, its files are integrity-checked on launch, and on Windows it lives in the protected `WindowsApps` folder. Any change would break the app or be undone on its next update.
