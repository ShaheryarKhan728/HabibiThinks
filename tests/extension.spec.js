const { test, expect, chromium } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const EXTENSION = path.join(ROOT, "browser-extension");
const { verbs } = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "verbs.json"), "utf8"));

// A stand-in for claude.ai. The real page needs a login, so we serve this
// one at the claude.ai address instead, which is enough for the extension
// to load into it.
const FAKE_PAGE = `<!doctype html>
<html><body>
  <div id="spinner"></div>
  <p id="message"></p>
</body></html>`;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const OUR_PHRASE = new RegExp(`^(${verbs.map(escapeRegex).join("|")})(…|\\.\\.\\.)$`);

let context;
let page;

test.beforeAll(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "habibi-chrome-"));
  context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    args: [`--disable-extensions-except=${EXTENSION}`, `--load-extension=${EXTENSION}`],
  });
  await context.route("https://claude.ai/**", (route) =>
    route.fulfill({ contentType: "text/html", body: FAKE_PAGE })
  );
  page = await context.newPage();
  await page.goto("https://claude.ai/chat");
});

test.afterAll(async () => {
  await context.close();
});

async function setText(id, text) {
  await page.evaluate(([id, text]) => {
    document.getElementById(id).textContent = text;
  }, [id, text]);
}

test("replaces Claude's loading word with a Habibi phrase", async () => {
  await setText("spinner", "Pondering…");
  await expect(page.locator("#spinner")).toHaveText(OUR_PHRASE);
});

test("keeps replacing when Claude changes the word", async () => {
  await setText("spinner", "Noodling...");
  await expect(page.locator("#spinner")).toHaveText(OUR_PHRASE);
});

test("leaves normal chat text alone", async () => {
  await setText("message", "Let me think about that...");
  // Give the extension time to (wrongly) act, then check nothing changed.
  await page.waitForTimeout(500);
  await expect(page.locator("#message")).toHaveText("Let me think about that...");
});
