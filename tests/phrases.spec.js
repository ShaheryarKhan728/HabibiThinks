const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

test("the app and the browser extension use the same phrases", () => {
  const appPhrases = require(path.join(ROOT, "hub-app", "phrases.json"));
  const extensionCode = fs.readFileSync(path.join(ROOT, "browser-extension", "phrases.js"), "utf8");
  const extensionPhrases = new Function(`${extensionCode}; return PHRASES;`)();

  expect(extensionPhrases).toEqual(appPhrases);
});
