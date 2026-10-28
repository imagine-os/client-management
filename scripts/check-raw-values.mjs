// Ported from the design system's scripts/check-raw-values.mjs.
// Fails if app code bypasses the tokens: raw hex colors, rgb()/hsl() literals, or Tailwind
// arbitrary values like p-[13px] or bg-[#123456]. Use a token, or ask for one in
// docs/design-system-requests.md. theme/ is the brand layer, where the palette is defined, so it isn't scanned
// (like packages/design-system/).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = ["app", "components", "lib"];
const rules = [
  { name: "raw hex color", re: /(?<![\w&])#[0-9a-fA-F]{3,8}\b/g },
  { name: "rgb/hsl literal", re: /\b(?:rgba?|hsla?)\(/g },
  // Variants like has-[:focus-visible]: and property lists like transition-[width] are fine; values are not.
  { name: "Tailwind arbitrary value", re: /\b(?!transition-)[a-z][a-z0-9-]*-\[[^\]]+\](?!:)/g },
];
let failures = 0;
const walk = (d) =>
  fs.existsSync(path.join(ROOT, d))
    ? fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]))
    : [];
for (const d of dirs) {
  for (const rel of walk(d)) {
    if (!/\.(tsx?|css)$/.test(rel)) continue;
    const lines = fs.readFileSync(path.join(ROOT, rel), "utf8").split("\n");
    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
      for (const r of rules) {
        for (const m of line.matchAll(r.re)) {
          failures++;
          console.log(`${rel}:${i + 1}  ${r.name}: ${m[0]}`);
        }
      }
    });
  }
}
if (failures) {
  console.log(`\n${failures} raw value(s). Use a token, or request one in docs/design-system-requests.md.`);
  process.exit(1);
}
console.log(`No raw values in ${dirs.join(", ")}. Every color and size comes from a token.`);
