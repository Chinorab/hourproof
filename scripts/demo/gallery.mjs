// Captures gallery images (3:2, 1800x1200) of the app with sample data, in a phone frame.
// The app must be running (default http://localhost:3001). The cover line is passed in
// by the person submitting the project.
// Run: node scripts/demo/gallery.mjs "Cover line" [appUrl]
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [coverLine, appUrl = "http://localhost:3001"] = process.argv.slice(2);
if (!coverLine) throw new Error("Pass the cover line as the first argument.");
const outDir = path.join(root, "recordings", "gallery");
await mkdir(outDir, { recursive: true });

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const icon = await readFile(path.join(root, "app/icon.svg"), "utf8");
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();

// 1. Phone screenshots of the real app (390 x 760 CSS px at 2x)
const phone = await browser.newPage({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2 });
const shots = {};
const shot = async (name) => {
  shots[name] = (await phone.screenshot({ type: "png" })).toString("base64");
};

await phone.goto(`${appUrl}/`);
await phone.getByRole("button", { name: "Try with sample data" }).waitFor();
await shot("empty");

await phone.goto(`${appUrl}/add`);
await phone.locator("#screenshot").setInputFiles(path.join(root, "public/samples/sample-rides.png"));
await phone.locator('input[name="platform"]:visible').waitFor({ timeout: 60_000 });
await pause(300);
await shot("review");

await phone.goto(`${appUrl}/`);
await phone.getByRole("button", { name: "Try with sample data" }).click();
await phone.locator('[data-testid="sample-banner"]:visible').waitFor({ timeout: 90_000 });
await phone.evaluate(() => window.scrollTo(0, 0));
await pause(600);
await shot("month");

await phone.goto(`${appUrl}/summary`);
await phone.getByRole("heading", { level: 1 }).waitFor();
await pause(400);
await shot("summary");

// 2. Compose 3:2 images
const stage = await browser.newPage({ viewport: { width: 1800, height: 1200 } });
const frame = (b64) =>
  `<div class="phone"><img src="data:image/png;base64,${b64}" alt=""></div>`;
const css = `
  html,body{margin:0;width:1800px;height:1200px;background:#e9eae6;font-family:"Segoe UI",system-ui,sans-serif;color:#1b1e21}
  .phone{width:430px;height:840px;border-radius:52px;background:#1b1e21;padding:20px;box-shadow:0 30px 70px rgba(27,30,33,.18);box-sizing:border-box}
  .phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:34px;display:block}
  .center{height:100%;display:flex;align-items:center;justify-content:center;gap:90px}
  .brand{display:flex;align-items:center;gap:22px;font-size:64px;font-weight:600;letter-spacing:-0.01em}
  .brand svg{width:88px;height:88px}
  .copy{width:640px;display:flex;flex-direction:column;gap:30px}
  .copy p{margin:0;font-size:46px;line-height:1.25}
`;
async function compose(name, body) {
  await stage.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${body}</body></html>`);
  await stage.screenshot({ path: path.join(outDir, name) });
  console.log(`wrote recordings/gallery/${name}`);
}

await compose(
  "01-cover.png",
  `<div class="center"><div class="copy"><div class="brand">${icon}<span>HourProof</span></div><p>${esc(coverLine)}</p></div>${frame(shots.month)}</div>`,
);
await compose("02-review.png", `<div class="center">${frame(shots.empty)}${frame(shots.review)}</div>`);
await compose("03-month.png", `<div class="center">${frame(shots.review)}${frame(shots.month)}</div>`);
await compose("04-summary.png", `<div class="center">${frame(shots.month)}${frame(shots.summary)}</div>`);

await browser.close();
