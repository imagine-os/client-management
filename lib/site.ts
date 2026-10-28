/** Where the app is served from. "/client-management" on GitHub Pages, "" locally (see next.config.ts). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** A path to a file in public/, with the base path. next/link adds it for routes; plain <img> needs this. */
export const asset = (path: string) => (/^(data:|https?:|blob:)/.test(path) ? path : `${basePath}/${path.replace(/^\//, "")}`);
