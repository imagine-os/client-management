"use client";
import { Badge, Button } from "@ds/components";
import { ArrowUpRight, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { asset } from "@/lib/site";
import { projectTypes, templateFor, type ProjectType } from "@/lib/template";
import { MainNav, Shell } from "./Shell";

/*
 * /templates/: start a client project from a template, like a site builder's template gallery. Each template is the
 * standard checklist for its type (lib/template.ts) plus a live example to look at, in the Between Gigs workspace.
 * "Use template" opens New project with it chosen. The written standard is docs/templates/client-project.md.
 */

/** Where the Between Gigs workspace is published: the examples open there. */
const BG = "https://between-gigs.github.io/between-gig-2.0/workspace";

const gallery: { id: string; name: string; type: ProjectType; summary: string; cover: string; example?: string; featured?: boolean }[] = [
  { id: "between-gigs", name: "Between Gigs starter", type: "onboarding", featured: true, cover: "templates/ws-canvas.jpg", example: "canvas",
    summary: "Everything this project runs on: the workspace shell, the design system, onboarding where people edit their own blank profile, owner tools, emails, QA and share images." },
  { id: "website", name: "Client website", type: "website", cover: "templates/home.jpg", example: "site",
    summary: "Marketing or portfolio pages on the design system: a home, landing pages, forms with their emails, policies and share images." },
  { id: "web-app", name: "Web app", type: "web-app", cover: "templates/ws-owners.jpg", example: "owners",
    summary: "Signed-in tools: roles, a dashboard, tables you can search and filter, review flows and the sample data layer ready for an API." },
  { id: "brand", name: "Brand and design system", type: "brand", cover: "templates/design-system.jpg", example: "design-system",
    summary: "Tokens for colour, type and spacing in light and dark, components with guidelines, and a showcase the client can browse." },
];

export function Templates() {
  const router = useRouter();
  const sidebar = <MainNav active="templates" />;
  return (
    <Shell sidebar={sidebar} sidebarTitle="Templates" status={<span>{gallery.length} templates · the standard is in docs/templates/client-project.md</span>}>
      <div className="grid gap-1">
        <p className="text-eyebrow text-ink-brand uppercase">Client management</p>
        <h1 className="font-display text-display-md text-ink">Templates</h1>
        <p className="max-w-2xl text-body-md text-ink-muted">Start a client project the way we start every project: the phases, the checks and a working example to build from.</p>
      </div>
      <ul className="mt-8 grid gap-6 lg:grid-cols-2">
        {gallery.map((t) => {
          const plan = templateFor(t.type);
          const items = plan.reduce((n, p) => n + p.items.length, 0);
          return (
            <li key={t.id} className={t.featured ? "lg:col-span-2" : undefined}>
              <article className={t.featured ? "grid overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-2" : "grid overflow-hidden rounded-2xl border border-line bg-surface"}>
                <img src={asset(t.cover)} alt="" loading="lazy" className="aspect-video w-full border-b border-line object-cover object-top lg:h-full" />
                <div className="grid content-start gap-3 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {t.featured && <Badge tone="success" size="sm">Our reference project</Badge>}
                    <Badge tone="neutral" size="sm">{projectTypes.find((x) => x.id === t.type)?.name}</Badge>
                    <span className="text-caption text-ink-subtle">{plan.length} phases · {items} checks</span>
                  </div>
                  <h2 className="font-display text-heading-lg text-ink">{t.name}</h2>
                  <p className="text-body-md text-ink-muted">{t.summary}</p>
                  <ol className="flex flex-wrap gap-1.5">{plan.map((p, i) => <li key={p.name} className="rounded-full bg-surface-sunken px-2.5 py-1 text-caption text-ink-muted"><span className="tabular-nums text-ink-subtle">0{i + 1}</span> {p.name}</li>)}</ol>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant={t.featured ? "primary" : "secondary"} iconStart={<FolderPlus />} onClick={() => router.push(`/?new=1&type=${t.type}&name=${encodeURIComponent(t.name === "Between Gigs starter" ? "" : t.name)}`)}>Use template</Button>
                    {t.example && <a href={`${BG}/${t.example}/`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-label-md text-ink hover:bg-surface-hover">See the example<ArrowUpRight className="size-4" aria-hidden="true" /></a>}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
