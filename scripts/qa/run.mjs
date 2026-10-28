// QA for the static build in out/ (run `pnpm build` first). Uses the preinstalled Chromium.
//   node scripts/qa/run.mjs            rules + screens + axe + flow
//   node scripts/qa/run.mjs screens    every route, light and dark, 1440 and 390 → qa/output/screens/
//   node scripts/qa/run.mjs axe        axe-core on every route, light and dark
//   node scripts/qa/run.mjs flow       add a client → project from the template → tasks → portal approval
//   node scripts/qa/run.mjs rules      the measurable rules in docs/ui-rules.md, every route at 1440 and 390
// Set ONLY=name,name to limit routes. Fails (exit 1) on axe violations, rule breaks, horizontal scroll or a broken flow.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { serve } from "./serve.mjs";
import { routes } from "./routes.mjs";
import { flow } from "./flow.mjs";
import { checkRules } from "./rules.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "qa/output");
const mode = process.argv[2] ?? "all";
const only = process.env.ONLY?.split(",");
const list = only ? routes.filter((r) => only.includes(r.name)) : routes;
const executablePath = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

if (!fs.existsSync(path.join(ROOT, "out/index.html"))) { console.error("No build in out/. Run pnpm build first."); process.exit(1); }
const { server, url: base } = await serve(path.join(ROOT, "out"));
const browser = await chromium.launch({ executablePath });
const axeSource = fs.readFileSync(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
const problems = [];

async function open(route, { theme, width }) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  await context.addInitScript((t) => { try { localStorage.setItem("bg-theme", t); } catch { /* ignore */ } }, theme);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}${route.path}`);
  await page.waitForLoadState("networkidle");
  if (route.ready) await page.locator(route.ready).first().waitFor({ timeout: 8000 });
  // Load lazy images so full-page screenshots show them.
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img[loading=lazy]")) img.loading = "eager";
    await Promise.all(Array.from(document.images).filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 3000); })));
  });
  if (route.act) await route.act(page);
  await page.waitForTimeout(150);
  return { context, page, errors };
}

async function screens() {
  fs.mkdirSync(path.join(OUT, "screens"), { recursive: true });
  for (const route of list) {
    for (const theme of ["light", "dark"]) {
      for (const width of [1440, 390]) {
        const { context, page, errors } = await open(route, { theme, width });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 0) problems.push(`${route.name} ${theme} ${width}: horizontal scroll (${overflow}px)`);
        if (errors.length) problems.push(`${route.name} ${theme} ${width}: page error: ${errors[0]}`);
        await page.screenshot({ path: path.join(OUT, "screens", `${route.name}-${theme}-${width}.png`), fullPage: true });
        await context.close();
      }
    }
    process.stdout.write(`screens ${route.name} ✓\n`);
  }
}

async function axe() {
  const report = [];
  for (const route of list) {
    for (const theme of ["light", "dark"]) {
      for (const width of [1440, 390]) {
        const { context, page } = await open(route, { theme, width });
        await page.addScriptTag({ content: axeSource });
        const result = await page.evaluate(async () => {
          const r = await window.axe.run(document, { resultTypes: ["violations"], runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
          return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
        });
        for (const v of result) problems.push(`axe ${route.name} ${theme} ${width}: ${v.id} (${v.impact}) ${v.help} → ${v.nodes.join(" | ")}`);
        report.push({ route: route.name, theme, width, violations: result.length });
        await context.close();
      }
    }
    process.stdout.write(`axe ${route.name} ✓\n`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "axe.json"), JSON.stringify(report, null, 2));
}

/** docs/ui-rules.md, measured. Light theme only: the rules don't depend on the theme (axe covers contrast in both). */
async function rules() {
  const report = [];
  for (const route of list) {
    for (const width of [1440, 390]) {
      const { context, page } = await open(route, { theme: "light", width });
      const found = await checkRules(page, { width });
      for (const f of found) problems.push(`rules ${route.name} ${width}: ${f.rule} ${f.detail}`);
      report.push({ route: route.name, width, found });
      await context.close();
    }
    process.stdout.write(`rules ${route.name} ✓\n`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "rules.json"), JSON.stringify(report, null, 2));
}

try {
  if (mode === "all" || mode === "rules") await rules();
  if (mode === "all" || mode === "screens") await screens();
  if (mode === "all" || mode === "axe") await axe();
  if (mode === "all" || mode === "flow") {
    const result = await flow({ browser, base, outDir: OUT });
    problems.push(...result);
  }
} finally {
  await browser.close();
  server.close();
}

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n${problems.map((p) => `  ✗ ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`\nQA passed (${mode}).`);
