"use client";
import { Badge, Button, cx } from "@ds/components";
import { ArrowUpRight, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { projectTypes, templateFor, type ProjectType } from "@/lib/template";
import { MainNav, PageHeader, Shell } from "./Shell";

/*
 * /templates/: start a client project from a template, like a site builder's template gallery. Each template is the
 * standard checklist for its type (lib/template.ts) plus a live example to look at, in the Between Gigs workspace.
 * "Use template" opens New project with it chosen. The written standard is docs/templates/client-project.md.
 */

/** Where the Between Gigs workspace is published: the examples open there. */
const BG = "https://between-gigs.github.io/between-gig-2.0/workspace";

const gallery: { id: string; name: string; type: ProjectType; summary: string; example?: string; featured?: boolean }[] = [
  { id: "between-gigs", name: "Between Gigs starter", type: "onboarding", featured: true, example: "canvas",
    summary: "Everything this project runs on: the workspace shell, the design system, onboarding where people edit their own blank profile, owner tools, emails, QA and share images." },
  { id: "website", name: "Client website", type: "website", example: "site",
    summary: "Marketing or portfolio pages on the design system: a home, landing pages, forms with their emails, policies and share images." },
  { id: "web-app", name: "Web app", type: "web-app", example: "owners",
    summary: "Signed-in tools: roles, a dashboard, tables you can search and filter, review flows and the sample data layer ready for an API." },
  { id: "brand", name: "Brand and design system", type: "brand", example: "design-system",
    summary: "Tokens for colour, type and spacing in light and dark, components with guidelines, and a showcase the client can browse." },
];

export function Templates() {
  const router = useRouter();
  const sidebar = <MainNav active="templates" />;
  return (
    <Shell sidebar={sidebar} sidebarTitle="Templates" status={<span>{gallery.length} templates · the standard is in docs/templates/client-project.md</span>}>
      <PageHeader eyebrow={`${gallery.length} templates`} title="Templates" description="Start a client project the way we start every project: the phases, the checks and a working example to build from." />
      <ul className="mt-8 grid gap-6 lg:grid-cols-2">
        {gallery.map((t) => {
          const plan = templateFor(t.type);
          const items = plan.reduce((n, p) => n + p.items.length, 0);
          return (
            <li key={t.id} className={t.featured ? "lg:col-span-2" : undefined}>
              <article className={cx("grid h-full border-t-4 border-line-strong", t.featured && "lg:grid-cols-2")}>
                <Cover type={t.type} featured={t.featured} />
                <div className="grid content-start gap-3 py-5 sm:py-6 lg:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {t.featured && <Badge tone="success" size="sm">Our reference project</Badge>}
                    <Badge tone="neutral" size="sm">{projectTypes.find((x) => x.id === t.type)?.name}</Badge>
                    <span className="text-caption text-ink-subtle">{plan.length} phases · {items} checks</span>
                  </div>
                  <h2 className="font-display text-heading-lg text-ink">{t.name}</h2>
                  <p className="text-body-md text-ink-muted">{t.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant={t.featured ? "primary" : "secondary"} iconStart={<FolderPlus />} onClick={() => router.push(`/?new=1&type=${t.type}&name=${encodeURIComponent(t.name === "Between Gigs starter" ? "" : t.name)}`)}>Use template</Button>
                    {t.example && <a href={`${BG}/${t.example}/`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 px-3 text-label-md text-ink hover:bg-surface-hover">See the example<ArrowUpRight className="size-4" aria-hidden="true" /></a>}
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

/**
 * A template's cover, drawn from its own checklist: the type set large, and one bar per phase as tall as its
 * number of checks. The reference project is inverted, black with the blue action colour.
 */
function Cover({ type, featured }: { type: ProjectType; featured?: boolean }) {
  const plan = templateFor(type);
  const most = Math.max(...plan.map((p) => p.items.length));
  const name = projectTypes.find((x) => x.id === type)?.name;
  return (
    <div aria-hidden="true" className={cx("flex aspect-video flex-col justify-between gap-6 p-6 sm:p-8 lg:aspect-auto lg:min-h-72", featured ? "bg-ink text-bg" : "bg-surface-sunken text-ink")}>
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-display-sm text-balance">{name}</span>
        <span className="size-6 shrink-0 bg-action" />
      </div>
      <div className="grid gap-2">
        <div className="flex h-24 items-end gap-2 sm:gap-3">
          {plan.map((p) => <span key={p.name} className={cx("block flex-1", featured ? "bg-action" : "bg-ink")} style={{ height: `${Math.max(18, (p.items.length / most) * 100)}%` }} />)}
        </div>
        <ol className="flex gap-2 sm:gap-3">
          {plan.map((p, i) => <li key={p.name} className={cx("min-w-0 flex-1 truncate text-caption tabular-nums", featured ? "text-bg" : "text-ink-muted")}>0{i + 1}<span className="max-sm:hidden"> {p.name}</span></li>)}
        </ol>
      </div>
    </div>
  );
}
