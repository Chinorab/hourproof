// Renders the intro title card (1280x720 PNG) for the demo video.
// The sentence is passed in by the person making the video.
// Run: node scripts/demo/intro.mjs "Your sentence" recordings/intro.png
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [sentence, out = "recordings/intro.png"] = process.argv.slice(2);
if (!sentence) throw new Error("Pass the intro sentence as the first argument.");

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const icon = await readFile(path.join(root, "app/icon.svg"), "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.setContent(`<!doctype html><html><head><style>
  html,body{margin:0;height:100%;background:#e9eae6;font-family:"Segoe UI",system-ui,sans-serif;color:#1b1e21}
  .wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:0 140px;text-align:center}
  .brand{display:flex;align-items:center;gap:18px;font-size:44px;font-weight:600;letter-spacing:-0.01em}
  .brand svg{width:64px;height:64px}
  p{margin:0;font-size:38px;line-height:1.3;max-width:900px}
</style></head><body><div class="wrap">
  <div class="brand">${icon}<span>HourProof</span></div>
  <p>${esc(sentence)}</p>
</div></body></html>`);
await page.screenshot({ path: path.resolve(root, out) });
await browser.close();
console.log(`wrote ${out}`);
