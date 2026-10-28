"use client";
import { Badge, Banner, Button, Skeleton, cx, useToast } from "@ds/components";
import { ArrowLeft, Check, CircleCheck, ExternalLink, Hourglass, Link2, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { shortDate, stages, uid, useClients } from "@/lib/clients";
import { Wordmark } from "./Wordmark";

/*
 * /portal/?c=…: what the client sees. Progress, what's waiting on them, milestones they can approve, and the latest
 * updates, without the studio's tools around it. A preview for now: it reads and writes the same clients store as the
 * board, in this browser; real client sign-in comes with the backend.
 */
export function ClientPortal() {
  const params = useSearchParams();
  const toast = useToast();
  const { clients, ready, update } = useClients();
  const c = clients.find((x) => x.id === (params.get("c") ?? "between-gigs"));

  if (!ready) return <main className="mx-auto grid max-w-4xl gap-4 px-4 py-10"><Skeleton className="h-10 w-1/2" /><Skeleton shape="block" className="h-64" /></main>;
  if (!c) return <main className="mx-auto grid max-w-4xl gap-4 px-4 py-10"><h1 className="font-display text-display-sm text-ink">No such client</h1><Link href="/" className="text-link underline">Back to clients</Link></main>;

  const ms = [...c.milestones].sort((a, b) => a.date.localeCompare(b.date));
  const done = ms.filter((m) => m.done).length;
  const pct = ms.length ? Math.round((done / ms.length) * 100) : 0;
  const next = ms.find((m) => !m.done);
  const waiting = c.tasks.filter((t) => !t.done && t.owner === "Client");
  const updates = [...c.notes].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  const approve = (id: string, title: string) => {
    update(c.id, (x) => ({ ...x, milestones: x.milestones.map((m) => (m.id === id ? { ...m, done: true } : m)), notes: [...x.notes, { id: uid(), at: new Date().toISOString(), by: "Client", text: `Approved: ${title}` }] }));
    toast({ message: `Approved: ${title}`, tone: "success" });
  };

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <span className="flex items-center gap-3"><Wordmark /><span className="text-label-md text-ink">{c.name} · Project portal</span></span>
          <Link href={`/?c=${c.id}`} className="inline-flex min-h-11 items-center gap-1.5 text-body-sm text-ink-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden="true" />Back to client management</Link>
        </div>
      </header>
      <main id="main" className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <Banner tone="info" title="Client portal preview">This is what {c.name} would see once client sign-in is connected. Approvals and ticks here update the studio's board (in this browser).</Banner>

        <section aria-labelledby="hello-h" className="grid gap-6 border-t-4 border-line-strong pt-6 md:grid-cols-12 md:items-center">
          <div className="grid gap-3 md:col-span-8">
            <p className="text-eyebrow text-ink-brand uppercase">{stages.find((s) => s.id === c.stage)?.name}</p>
            <h1 id="hello-h" className="font-display text-display-md text-balance text-ink">Here's where {c.name} stands</h1>
            <p className="max-w-prose text-body-lg text-ink-muted">{c.nextStep}</p>
          </div>
          <div className="grid justify-items-center gap-2 md:col-span-4">
            <span role="img" aria-label={`${done} of ${ms.length} milestones done`} style={{ "--p": pct } as React.CSSProperties} className="progress-ring grid size-36 place-items-center rounded-full">
              <span className="grid size-30 place-items-center rounded-full bg-surface text-center"><span><b className="block font-display text-display-sm text-ink tabular-nums">{pct}%</b><span className="text-caption text-ink-subtle">{done} of {ms.length} milestones</span></span></span>
            </span>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="you-h" className="border-t-2 border-line-strong pt-4">
            <h2 id="you-h" className="flex items-center gap-2 font-display text-heading-lg text-ink"><Hourglass className="size-5 text-warning" aria-hidden="true" />Waiting on you</h2>
            {waiting.length === 0 ? <p className="mt-3 flex items-center gap-2 text-body-md text-ink-muted"><CircleCheck className="size-5 text-success" aria-hidden="true" />Nothing right now. Thank you!</p> : (
              <ul className="mt-3 grid gap-1">
                {waiting.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-sunken p-3">
                    <span className="grid"><span className="text-body-md text-ink">{t.title}</span>{t.due && <span className="text-caption text-ink-subtle">Due {shortDate(t.due)}</span>}</span>
                    <Button size="sm" variant="secondary" iconStart={<Check />} onClick={() => { update(c.id, (x) => ({ ...x, tasks: x.tasks.map((y) => (y.id === t.id ? { ...y, done: true } : y)) })); toast({ message: "Marked done. We'll take it from here.", tone: "success" }); }}>Mark done</Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="ms-h" className="border-t-2 border-line-strong pt-4">
            <h2 id="ms-h" className="font-display text-heading-lg text-ink">Milestones</h2>
            <ol className="mt-4 grid gap-0">
              {ms.map((m, i) => (
                <li key={m.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < ms.length - 1 && <span aria-hidden="true" className="absolute top-7 bottom-0 left-3 w-px bg-line" />}
                  <span aria-hidden="true" className={cx("relative grid size-6 shrink-0 place-items-center rounded-full border-2", m.done ? "border-ink bg-ink text-bg" : m === next ? "border-ink-brand bg-surface" : "border-line-strong bg-surface")}>{m.done && <Check className="size-3.5" />}</span>
                  <div className="grid flex-1 gap-1">
                    <span className={cx("text-body-md", m.done ? "text-ink-muted" : "text-ink")}>{m.title}</span>
                    <span className="text-caption text-ink-subtle">{shortDate(m.date)}{m.done ? " · done" : m === next ? " · up next" : ""}</span>
                    {m === next && <div><Button size="sm" variant="primary" iconStart={<ThumbsUp />} onClick={() => approve(m.id, m.title)}>Approve this milestone</Button></div>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section aria-labelledby="up-h" className="border-t-2 border-line-strong pt-4">
          <h2 id="up-h" className="font-display text-heading-lg text-ink">Latest updates</h2>
          <ol className="mt-3 grid gap-3">
            {updates.map((n) => (
              <li key={n.id} className="grid gap-0.5 border-t border-line pt-3 first:border-0 first:pt-0">
                <span className="text-caption text-ink-subtle"><Badge tone={n.by === "Client" ? "info" : "success"} size="sm">{n.by === "Client" ? "You" : "JAM Studio"}</Badge> · {new Date(n.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <p className="text-body-md text-ink">{n.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {c.links.length > 0 && (
          <section aria-labelledby="links-h" className="flex flex-wrap items-center gap-2">
            <h2 id="links-h" className="flex items-center gap-2 text-label-md text-ink-muted"><Link2 className="size-4" aria-hidden="true" />Links</h2>
            {c.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 border border-line bg-surface px-4 text-label-md text-ink hover:border-line-strong">{l.label}<ExternalLink className="size-3.5" aria-hidden="true" /></a>)}
          </section>
        )}
      </main>
    </div>
  );
}
