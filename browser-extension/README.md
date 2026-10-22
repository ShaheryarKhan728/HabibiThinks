# browser-extension

A browser extension for Claude.ai web (Chrome, Edge, Firefox).

It watches the page for Claude's loading word and swaps it with a word from `shared/verbs.json`.

Kept separate from the hub app on purpose — a browser extension is a different kind of package (store-installed, sandboxed) and shouldn't be mixed with desktop app code.
