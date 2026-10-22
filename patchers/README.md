# patchers

Small scripts that apply the custom words from `shared/verbs.json` into each Claude platform.

## claude-code.js

Covers both the Claude Code CLI and the Claude Code VS Code extension — they share the same settings file.

Claude Code has a built-in, documented setting for this: `spinnerVerbs` inside `~/.claude/settings.json`. This script just writes that setting. It does not touch any app files, so it never breaks on a Claude Code update.

Run it directly:

```
node patchers/claude-code.js
```

It reads `shared/verbs.json` and writes `{ "spinnerVerbs": { "mode": "replace", "verbs": [...] } }` into `~/.claude/settings.json`, keeping any other settings already there untouched.

## Claude Desktop app

Not built yet. Claude Desktop is a separate, closed consumer app — no equivalent setting is known yet, so this needs its own investigation before writing a patcher for it.
