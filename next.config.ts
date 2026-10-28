import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/**
 * Static export, so the app previews on GitHub Pages. There is no server yet: clients and their edits are kept in
 * the browser (lib/clients.ts). NEXT_PUBLIC_BASE_PATH is "/client-management" on Pages and empty locally.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** The build's commit and time, for the status bar. */
const sha = process.env.GITHUB_SHA ?? (() => { try { return execSync("git rev-parse HEAD").toString().trim(); } catch { return ""; } })();

const config: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_SHA: sha, NEXT_PUBLIC_BUILD_TIME: new Date().toISOString() },
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
