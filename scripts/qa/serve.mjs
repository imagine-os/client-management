// A tiny static server for out/, the way GitHub Pages serves it: /path/ → /path/index.html,
// unknown paths → 404.html with a 404 status. BASE mounts it under a base path.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".ico": "image/x-icon" };

export function serve(dir, { port = 0, base = "" } = {}) {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    let url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (base && url.startsWith(base)) url = url.slice(base.length) || "/";
    let file = path.join(root, url);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "content-type": types[".html"] });
      res.end(fs.readFileSync(path.join(root, "404.html")));
      return;
    }
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}${base}` })));
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const { url } = await serve(process.argv[2] ?? "out", { port: Number(process.env.PORT ?? 4173), base: process.env.BASE ?? "" });
  console.log(`Serving out/ at ${url}`);
}
