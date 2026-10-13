// Renders app/icon.svg to app/apple-icon.png (180 x 180). Run: node scripts/make-icons.mjs
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const svg = await readFile(new URL("../app/icon.svg", import.meta.url), "utf8");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
await page.setContent(`<style>html,body{margin:0;background:#0E6655}</style>${svg.replace("<svg ", '<svg width="180" height="180" ')}`);
await page.screenshot({ path: new URL("../app/apple-icon.png", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1") });
await browser.close();
console.log("wrote app/apple-icon.png");
