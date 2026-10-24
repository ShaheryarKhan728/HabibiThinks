const { test, expect, chromium } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const EXTENSION = path.join(ROOT, "browser-extension");
const { verbs } = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "verbs.json"), "utf8"));

// A stand-in for claude.ai, shaped like the real thinking-status block (copied
// from the live page, trimmed down). The real page needs a login, so we serve
// this one at the claude.ai address instead.
const FAKE_PAGE = `<!doctype html>
<html><body>
  <div data-cds="TurnStatus" data-state="streaming">
    <div>
      <span><span><span data-morph-key="x"><span dir="auto" id="label"></span></span></span></span>
    </div>
    <div>
      <p id="thought-for"></p>
      <p id="summary">Weighing latency limits against regional data residency rules.</p>
    </div>
  </div>
  <div data-cds="TurnStatus" data-state="done">
    <p id="old-thought-for">Thought for 12s</p>
  </div>
  <p id="chat"></p>
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

async function expectUnchanged(id, text) {
  await setText(id, text);
  // Give the extension time to (wrongly) act, then check nothing changed.
  await page.waitForTimeout(500);
  await expect(page.locator(`#${id}`)).toHaveText(text);
}

test("changes a short status word to a Habibi phrase", async () => {
  await setText("label", "Weighing");
  await expect(page.locator("#label")).toHaveText(OUR_PHRASE);
});

test("keeps changing it when Claude moves to the next word", async () => {
  await setText("label", "Revisiting");
  await expect(page.locator("#label")).toHaveText(OUR_PHRASE);
});

test("changes 'Thought for' and keeps the time", async () => {
  await setText("thought-for", "Thought for 3m 25s");
  await expect(page.locator("#thought-for")).toHaveText("Habibi thought for 3m 25s");
});

test("changes 'Thought for' labels already on the page", async () => {
  await expect(page.locator("#old-thought-for")).toHaveText("Habibi thought for 12s");
});

test("leaves a full summary sentence in the status row alone", async () => {
  await expectUnchanged("label", "Laying out region groupings within latency and residency limits");
});

test("leaves the summary lines alone", async () => {
  await expect(page.locator("#summary")).toHaveText(
    "Weighing latency limits against regional data residency rules."
  );
});

test("leaves chat text outside the status block alone", async () => {
  await expectUnchanged("chat", "Pondering…");
  await expectUnchanged("chat", "Let me think about that...");
});
