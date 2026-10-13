// Records a silent demo of the core journey with sample data, as a 1280x720 video
// showing the app in a phone sized frame. The app must be running (default
// http://localhost:3001, for example `npm run build && npm run start -- -p 3001`).
// Run: node scripts/demo/record.mjs [appUrl]
import { chromium } from "playwright";
import { mkdir, rename, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appUrl = process.argv[2] ?? "http://localhost:3001";
const outDir = path.join(root, "recordings");
await mkdir(outDir, { recursive: true });

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

// A neutral stage with the app in a 390 x 680 phone frame.
await page.setContent(`<!doctype html>
<html><head><style>
  html,body{margin:0;height:100%;background:#e9eae6;font-family:system-ui,sans-serif}
  .stage{height:100%;display:grid;place-items:center}
  .phone{width:390px;height:680px;border-radius:36px;background:#1b1e21;padding:12px;box-shadow:0 20px 50px rgba(27,30,33,.18)}
  iframe{width:100%;height:100%;border:0;border-radius:26px;background:#f6f6f3}
</style></head>
<body><div class="stage"><div class="phone"><iframe id="app" src="${appUrl}/"></iframe></div></div></body></html>`);

const app = page.frameLocator("#app");
const frame = () => page.frames().find((f) => f.url().startsWith(appUrl));

async function scrollApp(y, ms = 900) {
  await frame().evaluate(
    ([top]) => window.scrollTo({ top, behavior: "smooth" }),
    [y],
  );
  await pause(ms);
}

// 1. Empty month
await app.getByRole("heading", { level: 1 }).waitFor();
await pause(3500);

// 2. Upload a sample screenshot, review it, add expenses
await app.getByRole("link", { name: "Add earnings" }).click();
await pause(1500);
await app.locator("#screenshot").setInputFiles(path.join(root, "public/samples/sample-rides.png"));
await app.locator('input[name="platform"]:visible').waitFor({ timeout: 60_000 });
await pause(3500);
const expenses = app.locator('input[name="expenses"]:visible');
await expenses.click();
await expenses.fill("");
await expenses.pressSequentially("25", { delay: 250 });
await pause(1500);
await app.getByRole("button", { name: "Add to month" }).click();
await app.locator('[data-testid="dominant-value"]:visible').waitFor();
await pause(4000);

// 3. Sample data fills the month
await app.getByRole("button", { name: "Try with sample data" }).click();
await app.locator('[data-testid="sample-banner"]:visible').waitFor({ timeout: 90_000 });
await pause(1200);
await scrollApp(0, 2500);
await scrollApp(330, 3000);
await scrollApp(700, 3500);
await scrollApp(1050, 3000);

// 4. Previous month
await scrollApp(120, 1200);
await app.getByRole("button", { name: "Sep", exact: true }).click();
await pause(3000);
await app.getByRole("button", { name: "Oct", exact: true }).click();
await pause(2000);

// 5. Monthly summary
await app.getByRole("link", { name: "Monthly summary" }).click();
await app.getByRole("heading", { level: 1 }).waitFor();
await pause(3500);
await scrollApp(400, 3500);
await scrollApp(800, 4000);

// 6. Privacy page
await scrollApp(0, 800);
await app.getByRole("link", { name: "This month" }).click();
await pause(1500);
await scrollApp(5000, 1500);
await app.getByRole("link", { name: "Privacy" }).click();
await pause(4500);
await app.getByRole("link", { name: "This month" }).click();
await pause(3000);

const video = page.video();
await context.close();
await browser.close();
const src = await video.path();
const dest = path.join(outDir, "hourproof-demo.webm");
await rename(src, dest);
console.log(`wrote ${path.relative(root, dest)}`);
console.log((await readdir(outDir)).join(", "));
