// Makes 4:3 (1600x1200) portfolio images per site: desktop + mobile together,
// plus desktop-only and mobile-only 4:3 versions.
//
// Setup (once):
//   npm init -y
//   npm i playwright
//   npx playwright install chromium
// Run:
//   node capture.mjs
// Capture only old redesign sites:
//   node capture.mjs --before-only
// Output: ./shots/<name>-combo.png, <name>-desktop.png, <name>-mobile.png

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const SITES = [
  { name: "sorianolaw", url: "https://dev-sorianolaw.pantheonsite.io/" },
  { name: "sorianolaw-before", url: "https://zsorianolaw.com/" },
  { name: "bantaypahayag", url: "https://bantaypahayag.netlify.app/" },
  { name: "zone3", url: "https://zone3dasmarinascaviteweb.netlify.app/" },
  { name: "empower-anesthesia", url: "https://empoweranesthesia.com/" },
  // Local file: put the .html next to this script, then match the filename.
  { name: "interior-designer", file: "interior-designer.html" },
  { name: "interior-designer-before", url: "https://designnu.com.au/" },
];

const W = 1600, H = 1200; // 4:3
const BG = "linear-gradient(135deg,#aab022 0%,#6f8a1c 55%,#3f6a14 100%)";
const sites = process.argv.includes("--before-only")
  ? SITES.filter((s) => s.name.endsWith("-before"))
  : SITES;

mkdirSync("shots", { recursive: true });
const browser = await chromium.launch();

async function grab(url, viewport, isMobile) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    isMobile,
    hasTouch: isMobile,
    userAgent: isMobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => console.log("  load problem:", url, e.message.split("\n")[0]));
  await page.waitForTimeout(2500); // let animations/fonts settle
  const buf = await page.screenshot({ type: "png" }); // above-the-fold only
  await ctx.close();
  return "data:image/png;base64," + buf.toString("base64");
}

async function render(html, file) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  await page.setContent(html);
  await page.waitForTimeout(300);
  await page.screenshot({ path: file });
  await ctx.close();
}

const base = `
  *{margin:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;background:${BG};display:flex;align-items:center;justify-content:center;font-family:system-ui}
  .win{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.35)}
  .bar{height:38px;background:#e9ece0;display:flex;align-items:center;gap:8px;padding:0 16px}
  .bar i{width:12px;height:12px;border-radius:50%;background:#c9cdbd;display:block}
  .win img{display:block;width:100%}
  .phone{background:#111;border-radius:48px;padding:14px;box-shadow:0 40px 80px rgba(0,0,0,.4)}
  .phone img{display:block;width:100%;border-radius:36px}
`;

for (const s of sites) {
  console.log("→", s.name);
  const url = s.file ? pathToFileURL(resolve(import.meta.dirname, s.file)).href : s.url;
  const desk = await grab(url, { width: 1440, height: 900 }, false);
  const mob = await grab(url, { width: 390, height: 844 }, true);

  // combo: desktop left, phone right overlapping
  await render(`<style>${base}
    .w{position:absolute;left:90px;top:210px;width:1020px}
    .p{position:absolute;right:100px;top:150px;width:330px}
  </style>
  <div class="win w"><div class="bar"><i></i><i></i><i></i></div><img src="${desk}"></div>
  <div class="phone p"><img src="${mob}"></div>`, `shots/${s.name}-combo.png`);

  // desktop only, 4:3
  await render(`<style>${base}.w{width:1360px}</style>
  <div class="win w"><div class="bar"><i></i><i></i><i></i></div><img src="${desk}"></div>`,
    `shots/${s.name}-desktop.png`);

  // mobile only, 4:3 (phone centered)
  await render(`<style>${base}.p{height:1060px;width:auto}.p img{height:100%;width:auto}</style>
  <div class="phone p"><img src="${mob}"></div>`, `shots/${s.name}-mobile.png`);
}

await browser.close();
console.log("done → ./shots");
