# shared

This folder holds `verbs.json` — the one file that stores the user's custom thinking words.

Every other part of the project (patchers, browser extension, hub app) reads this same file. Nothing else should keep its own copy of the word list.

## Format

```json
{
  "verbs": ["word one", "word two", "word three"]
}
```

Just a list of strings under `verbs`. Add or remove words by editing this list.
