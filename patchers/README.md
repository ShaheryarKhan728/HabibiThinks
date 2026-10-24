# patchers

Small scripts that apply the custom words from `shared/verbs.json` into each Claude platform.

## claude-code.js

Covers the Claude Code CLI, the Claude Code VS Code extension, and the Code tab in the Claude Desktop app — they all read the same settings file.

Claude Code has a built-in, documented setting for this: `spinnerVerbs` inside `~/.claude/settings.json` (or inside `CLAUDE_CONFIG_DIR` if you set that). This script just writes that setting. It does not touch any app files, so it never breaks on a Claude Code update.

Run it directly:

```
node patchers/claude-code.js
```

It reads `shared/verbs.json` and writes `{ "spinnerVerbs": { "mode": "replace", "verbs": [...] } }` into the settings file, keeping any other settings already there untouched.

## Claude Desktop chat tab

Not supported. The chat tab is claude.ai's web page running inside the app, and the app blocks all outside code: no debugger, no `NODE_OPTIONS`, its files are integrity-checked on launch, and on Windows it lives in the protected `WindowsApps` folder. Any change would break the app or be undone on its next update.
