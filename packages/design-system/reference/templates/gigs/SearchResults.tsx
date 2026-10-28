import * as React from "react";
import { flushSync } from "react-dom";
import { ArrowUpRight, Calendar, LayoutGrid, List, MapPin, Search, Sparkles, Star } from "lucide-react";
import { Badge, Button, EmptyState, IconButton, Input, SegmentedControl, Select, Tag, cx } from "../../components";
import { Reveal } from "../../motion";
import { availabilityLabel, people as allPeople, services, type Person } from "./data";
import { NeighbourhoodMap, Portrait, SiteFooter, SiteHeader, useImg, type GigsPage } from "./parts";

export interface SearchResultsProps {
  /** Folder the sample photos are served from, with a trailing slash. */
  imageBase?: string;
  /** Opens a profile. `from` is the card's photo, for the shared-element morph. */
  onOpenProfile?: (id: string) => void;
  onNavigate?: (page: GigsPage) => void;
}

type Sort = "match" | "distance" | "price-low" | "price-high";

/** Animates a list change: each card has its own view-transition name, so cards glide to their new places. */
function reflow(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { update(); return; }
  doc.startViewTransition(() => flushSync(update));
}

/** Search results: find a Gigster by service, place, availability and budget. */
export function SearchResults({ imageBase = "img/", onOpenProfile, onNavigate }: SearchResultsProps) {
  const img = useImg(imageBase);
  const [query, setQuery] = React.useState("");
  const [where, setWhere] = React.useState("Los Angeles, CA");
  const [service, setService] = React.useState("all");
  const [avail, setAvail] = React.useState("any");
  const [budget, setBudget] = React.useState("any");
  const [radius, setRadius] = React.useState("10");
  const [sort, setSort] = React.useState<Sort>("match");
  const [view, setView] = React.useState("list");
  const [saved, setSaved] = React.useState<string[]>([]);
  const [hover, setHover] = React.useState<string | null>(null);
  const [applied, setApplied] = React.useState("");

  const q = applied.trim().toLowerCase();
  const results = allPeople
    .filter((p) => service === "all" || p.service === service)
    .filter((p) => avail === "any" || p.availability === avail)
    .filter((p) => budget === "any" || p.rate <= Number(budget))
    .filter((p) => p.miles <= Number(radius))
    .filter((p) => !q || [p.name, p.service, p.tagline, ...p.tags, ...p.helps, p.area].join(" ").toLowerCase().includes(q))
    .sort((a, b) => sort === "distance" ? a.miles - b.miles : sort === "price-low" ? a.rate - b.rate : sort === "price-high" ? b.rate - a.rate : 0);

  const set = <T,>(fn: (v: T) => void) => (v: T) => reflow(() => fn(v));
  const reset = () => reflow(() => { setService("all"); setAvail("any"); setBudget("any"); setRadius("10"); setQuery(""); setApplied(""); setSort("match"); });
  const toggleSave = (id: string) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const filtered = service !== "all" || avail !== "any" || budget !== "any" || radius !== "10" || !!applied;

  return (
    <div className="min-h-full bg-bg text-ink">
      <SiteHeader current="search" onNavigate={onNavigate} />

      {/* Hero: brand panel with the people themselves floating in. */}
      <section data-theme="dark" className="relative isolate overflow-hidden bg-surface-brand">
        <span aria-hidden="true" className="glow-horizon opacity-60" />
        <div className="relative z-raised mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-28 sm:px-6 lg:grid-cols-12 lg:pt-20 lg:pb-32">
          <div className="lg:col-span-7">
            <Reveal effect="fade-up"><p className="text-eyebrow text-ink-brand uppercase">Concept · sample profiles</p></Reveal>
            <Reveal effect="fade-up" delay={80}>
              <h1 className="mt-4 font-display text-display-md text-balance text-ink sm:text-display-lg lg:text-display-xl">
                Extraordinary talent. <span className="glow-text text-ink-brand">Everyday help.</span>
              </h1>
            </Reveal>
            <Reveal effect="fade-up" delay={200}>
              <p className="mt-5 max-w-xl text-body-lg text-ink-muted">Hollywood's set builders, costumers, stylists and photographers, between gigs and ready for projects in your home, event or business.</p>
            </Reveal>
          </div>
          {/* Portrait constellation */}
          <div aria-hidden="true" className="relative hidden h-80 lg:col-span-5 lg:block">
            {allPeople.map((p, i) => {
              const spots = ["top-0 left-8 size-28", "top-6 right-4 size-24", "top-32 left-36 size-32", "bottom-0 left-0 size-24", "bottom-4 right-16 size-28", "top-20 right-40 size-16"];
              return (
                <Reveal key={p.id} effect="fade-up" delay={150 + i * 60} className={cx("absolute", spots[i])}>
                  <img src={img(`${p.id}.jpg`)} alt="" className="size-full rounded-full border-4 border-surface-brand object-cover shadow-lg ring-1 ring-line transition-transform duration-slow hover:scale-105" />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search bar, lifted over the hero's edge. */}
      <div className="relative z-raised mx-auto -mt-12 max-w-7xl px-4 sm:px-6">
        <form role="search" onSubmit={(e) => { e.preventDefault(); reflow(() => setApplied(query)); }}
          className="glow-focus grid gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lg md:grid-cols-12 md:items-end md:gap-2 md:p-2.5 md:pl-5">
          <label className="grid gap-1 md:col-span-6 md:py-1.5">
            <span className="text-label-sm text-ink-muted">What do you need?</span>
            <Input aria-label="What do you need?" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try alterations, lighting or photography" start={<Search />} />
          </label>
          <label className="grid gap-1 md:col-span-4 md:py-1.5">
            <span className="text-label-sm text-ink-muted">Where?</span>
            <Input aria-label="Where?" value={where} onChange={(e) => setWhere(e.target.value)} start={<MapPin />} />
          </label>
          <Button type="submit" variant="primary" size="lg" className="glow-hover md:col-span-2" iconStart={<Search />}>Search</Button>
        </form>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6">
        {/* Service pills */}
        <div role="group" aria-label="Service" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {["all", ...services].map((s) => {
            const on = service === s;
            const n = s === "all" ? allPeople.length : allPeople.filter((p) => p.service === s).length;
            return (
              <button key={s} type="button" aria-pressed={on} onClick={() => set(setService)(s)}
                className={cx("inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-label-md transition duration-base",
                  on ? "border-transparent bg-action-strong text-on-action-strong shadow-sm" : "border-line bg-surface text-ink-muted hover:-translate-y-0.5 hover:border-line-strong hover:text-ink")}>
                {s === "all" ? "All services" : s}<span className={cx("font-mono text-data-sm", on ? "opacity-80" : "text-ink-subtle")}>{n}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Select aria-label="Availability" size="sm" value={avail} onValueChange={set(setAvail)} className="w-44"
            options={[{ value: "any", label: "Any availability" }, { value: "this-week", label: "Available this week" }, { value: "next-week", label: "Available next week" }]} />
          <Select aria-label="Budget" size="sm" value={budget} onValueChange={set(setBudget)} className="w-36"
            options={[{ value: "any", label: "Any budget" }, { value: "50", label: "Up to $50/hr" }, { value: "60", label: "Up to $60/hr" }, { value: "70", label: "Up to $70/hr" }]} />
          <Select aria-label="Distance" size="sm" value={radius} onValueChange={set(setRadius)} className="w-40"
            options={[{ value: "5", label: "Within 5 miles" }, { value: "10", label: "Within 10 miles" }]} />
          {filtered && <Button size="sm" variant="ghost" onClick={reset}>Reset filters</Button>}
          <div className="ml-auto flex items-center gap-3">
            <Select aria-label="Sort" size="sm" value={sort} onValueChange={(v) => set(setSort)(v as Sort)} className="w-44"
              options={[{ value: "match", label: "Sort: Best match" }, { value: "distance", label: "Sort: Nearest" }, { value: "price-low", label: "Sort: Price, low to high" }, { value: "price-high", label: "Sort: Price, high to low" }]} />
            <SegmentedControl label="View" size="sm" value={view} onChange={set(setView)}
              options={[{ value: "list", label: "List", icon: <List /> }, { value: "grid", label: "Grid", icon: <LayoutGrid /> }]} />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Results */}
          <section aria-labelledby="results-h" className="lg:col-span-8">
            <h2 id="results-h" className="sr-only">Results</h2>
            <p className="mb-4 text-body-md text-ink-muted" aria-live="polite">
              <b className="font-display text-heading-md text-ink">{results.length}</b> sample professionals near {where.split(",")[0] || "you"}
              {saved.length > 0 && <span className="ml-2 inline-flex items-center gap-1 text-ink-brand"><Star className="size-4 fill-current" />{saved.length} saved</span>}
            </p>
            {results.length === 0 ? (
              <EmptyState icon={<Sparkles />} title="No one matches all of that yet" action={<Button variant="secondary" onClick={reset}>Reset filters</Button>}>
                Try a wider distance or budget. More Gigsters join every week.
              </EmptyState>
            ) : (
              <ul className={cx("grid gap-4", view === "grid" && "sm:grid-cols-2")}>
                {results.map((p, i) => (
                  <li key={p.id} style={{ viewTransitionName: `card-${p.id}` }}>
                    <Reveal effect="fade-up" delay={Math.min(i, 5) * 70}>
                      <ResultCard person={p} img={img} grid={view === "grid"} saved={saved.includes(p.id)} hot={hover === p.id}
                        onSave={() => toggleSave(p.id)} onOpen={() => onOpenProfile?.(p.id)} onHover={setHover} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-caption text-ink-subtle">All profiles, photos, rates and availability are fictional examples.</p>
          </section>

          {/* Rail */}
          <aside className="grid content-start gap-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
            <section aria-labelledby="nearby" className="rounded-2xl border border-line bg-surface p-5">
              <h2 id="nearby" className="font-display text-heading-lg text-ink">Explore nearby</h2>
              <p className="mt-1 mb-4 text-body-sm text-ink-muted">Hover a card to find them on the map.</p>
              <NeighbourhoodMap people={results} img={img} active={hover} onHover={setHover} onPick={(id) => onOpenProfile?.(id)} />
              <div className="mt-4 flex flex-wrap gap-2">
                {["Silver Lake", "Echo Park", "Los Feliz", "All Los Angeles"].map((a) => <Tag key={a}>{a}</Tag>)}
              </div>
            </section>
            <section aria-labelledby="how" data-theme="dark" className="relative isolate overflow-hidden rounded-2xl bg-surface-brand p-6">
              <h2 id="how" className="font-display text-heading-lg text-ink">How it works</h2>
              <ol className="mt-4 grid gap-4">
                {[["Tell us the project", "A garment, a room, an event, a portrait."], ["Meet your Gigster", "Agree scope, timing and the final rate together."], ["Book with confidence", "Real film-and-TV craft, for everyday life."]].map(([t, d], i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-action font-mono text-data-sm text-on-action">{i + 1}</span>
                    <span><b className="block text-label-md text-ink">{t}</b><span className="text-body-sm text-ink-muted">{d}</span></span>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}

function ResultCard({ person: p, img, grid, saved, hot, onSave, onOpen, onHover }: {
  person: Person; img: (f: string) => string; grid: boolean; saved: boolean; hot: boolean;
  onSave: () => void; onOpen: () => void; onHover: (id: string | null) => void;
}) {
  return (
    <article onMouseEnter={() => onHover(p.id)} onMouseLeave={() => onHover(null)}
      className={cx("group relative flex gap-5 rounded-2xl border bg-surface p-3 transition duration-base hover:-translate-y-0.5 hover:shadow-lg",
        hot ? "border-ink-brand shadow-md" : "border-line", grid ? "flex-col" : "flex-col sm:flex-row")}>
      <button type="button" onClick={onOpen} aria-label={`View ${p.name}'s profile`}
        className={cx("relative shrink-0 overflow-hidden rounded-xl", grid ? "aspect-video w-full" : "aspect-video w-full sm:aspect-square sm:w-44")}>
        <Portrait person={p} src={img(`${p.id}.jpg`)} className="size-full transition-transform duration-slow group-hover:scale-105" />
        <Badge tone={p.availability === "this-week" ? "success" : "info"} size="sm" className="absolute bottom-2 left-2 shadow-sm">{availabilityLabel[p.availability]}</Badge>
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-1 pr-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-heading-lg text-ink">
              <button type="button" onClick={onOpen} className="rounded-xs text-left transition-colors duration-fast hover:text-ink-brand">{p.name}</button>
            </h3>
            <p className="text-label-md text-ink-brand">{p.service}</p>
          </div>
          <IconButton label={saved ? `Unsave ${p.name}` : `Save ${p.name}`} pressed={saved} onClick={onSave} variant="ghost" size="sm"
            icon={<Star className={cx("transition-transform duration-base", saved && "scale-110 fill-current")} />} />
        </div>
        <p className="text-body-md text-ink-muted">{p.tagline}</p>
        <div className="flex flex-wrap gap-1.5">{p.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-ink-subtle">
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{p.area} · {p.miles} miles</span>
            <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" />{availabilityLabel[p.availability]}</span>
          </p>
          <div className="flex items-center gap-3">
            <p className="text-right"><span className="block text-caption text-ink-subtle">From</span><span className="font-display text-heading-lg text-ink">${p.rate}/hr</span></p>
            <Button size="sm" variant="secondary" onClick={onOpen} iconEnd={<ArrowUpRight />} className="group-hover:border-ink-brand">View profile</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
