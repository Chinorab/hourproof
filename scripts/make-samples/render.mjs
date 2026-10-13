// Renders the sample HTML mockups to PNG screenshots in public/samples.
// Run: node scripts/make-samples/render.mjs
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../../public/samples");
const pages = ["parcelfox", "loopride", "tidyhands", "not-earnings"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
for (const name of pages) {
  await page.goto(pathToFileURL(path.join(here, `${name}.html`)).href);
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  console.log(`wrote public/samples/${name}.png`);
}
await browser.close();
