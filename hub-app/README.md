# hub-app

The one app a user installs. It has:

- A home screen showing which Claude platforms are detected on the machine.
- A screen to edit `shared/verbs.json`.
- A "Resync" button that re-runs the patchers in `patchers/`.
- An "Install Browser Extension" button that opens the extension's store page in the user's browser.

No background processes. Everything happens when the user presses a button.
