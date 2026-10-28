// Share images for link previews: public/og/<name>.jpg, 1200×630, in the Swiss Grid brand.
// Each one is the page's name set large beside a real screenshot of that page from the static build in out/.
//   pnpm build && pnpm og
// The names, titles and descriptions come from lib/og.ts (ogPages); keep the list below in step with it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { serve } from "./qa/serve.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/og");
const pages = [
  { name: "home", title: "Client management", line: "Every client and where things stand", shot: "/" },
  { name: "tasks", title: "Tasks", line: "List · Board · Table · Calendar", shot: "/tasks/", act: async (p) => { await p.getByRole("radio", { name: "Board" }).click(); } },
  { name: "templates", title: "Templates", line: "Start every project the same way", shot: "/templates/" },
  { name: "portal", title: "Client portal", line: "Progress, approvals, updates", shot: "/portal/?c=between-gigs", theme: "dark" },
];

if (!fs.existsSync(path.join(ROOT, "out/index.html"))) { console.error("No build in out/. Run pnpm build first."); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const { server, url } = await serve(path.join(ROOT, "out"));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, "theme/fonts", f)).toString("base64")}`;

const card = ({ title, line }, shot) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; font-weight: 100 900; font-stretch: 62% 125%; src: url(${font("Archivo-Variable.woff2")}) format("woff2"); }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #0a0a0a; font-family: Archivo, Arial, sans-serif; position: relative; }
.rule { position: absolute; left: 64px; right: 64px; top: 56px; height: 8px; background: #0a0a0a; }
.mark { position: absolute; left: 64px; top: 96px; display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 800; font-stretch: 75%; letter-spacing: -0.02em; }
.mark i { width: 34px; height: 34px; background: #1a3cff; display: block; }
h1 { position: absolute; left: 60px; top: 190px; width: 560px; font-size: ${title.length > 12 ? 104 : 128}px; line-height: .9; font-weight: 800; font-stretch: 75%; letter-spacing: -0.045em; }
p { position: absolute; left: 64px; bottom: 64px; width: 520px; font-size: 28px; line-height: 1.3; color: #3d3d3d; border-top: 3px solid #0a0a0a; padding-top: 18px; }
img { position: absolute; left: 640px; top: 120px; width: 900px; border: 4px solid #0a0a0a; }
</style></head><body><div class="rule"></div><div class="mark"><i></i>JAM Studio</div><h1>${title}</h1><p>${line}</p><img src="${shot}"></body></html>`;

try {
  for (const pg of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await ctx.addInitScript((t) => { try { localStorage.setItem("bg-theme", t); } catch { /* ignore */ } }, pg.theme ?? "light");
    const page = await ctx.newPage();
    await page.goto(`${url}${pg.shot}`);
    await page.waitForLoadState("networkidle");
    if (pg.act) await pg.act(page);
    await page.waitForTimeout(300);
    const shot = `data:image/jpeg;base64,${(await page.screenshot({ type: "jpeg", quality: 90 })).toString("base64")}`;
    await ctx.close();

    const out = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await out.setContent(card(pg, shot));
    await out.evaluate(() => document.fonts.ready);
    await out.screenshot({ path: path.join(OUT, `${pg.name}.jpg`), type: "jpeg", quality: 86 });
    await out.close();
    console.log(`og/${pg.name}.jpg ✓`);
  }
} finally {
  await browser.close();
  server.close();
}
