/*
 * Share images: what a link to this app shows in Slack, iMessage, WhatsApp, LinkedIn and X. One 1200×630 image per
 * main page (public/og/, made by `pnpm og`), with absolute URLs, since link previews are fetched from the live site.
 */
import type { Metadata } from "next";

/** Where the app is published. Link previews need absolute URLs, so this is the live address, not the base path. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://imagine-os.github.io/client-management").replace(/\/$/, "");

export const ogPages = {
  home: { path: "/", title: "Client management", description: "Every JAM Studio client and where things stand: stages, projects, tasks, milestones and notes." },
  tasks: { path: "/tasks/", title: "Tasks", description: "Every client's tasks in one place, as a list, a board, a table or a calendar." },
  templates: { path: "/templates/", title: "Templates", description: "Start a client project the way we start every project: the phases, the checks and a working example." },
  portal: { path: "/portal/", title: "Client portal", description: "What a client sees: progress, what's waiting on them, and one tap to approve the next milestone." },
} as const;
export type OgName = keyof typeof ogPages;

/** Open Graph and Twitter tags for a page, pointing at its share image. */
export function share(name: OgName): Metadata {
  const page = ogPages[name];
  const title = name === "home" ? "JAM Studio · Client management" : `${page.title} · JAM Studio`;
  const image = { url: `${siteUrl}/og/${name}.jpg`, width: 1200, height: 630, alt: `JAM Studio · ${page.title}` };
  return {
    description: page.description,
    openGraph: { type: "website", siteName: "JAM Studio", title, description: page.description, url: `${siteUrl}${page.path}`, images: [image] },
    twitter: { card: "summary_large_image", title, description: page.description, images: [image.url] },
  };
}
