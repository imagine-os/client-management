import * as React from "react";
import { Check, Plus } from "lucide-react";
import { Badge, Button, Logo, ThemeToggle, cx } from "../../components";
import type { Person } from "./data";

export type GigsPage = "search" | "profile" | "onboarding";

/** Resolves a sample image file against the folder the page serves them from. */
export const useImg = (base: string) => (file: string) => `${base}${file}`;

/** The public site's top bar: logo, the two audiences, theme, and a fictional-sample flag. */
export function SiteHeader({ current, onNavigate, compact }: { current?: GigsPage; onNavigate?: (page: GigsPage) => void; compact?: boolean }) {
  const link = (page: GigsPage, label: string) => (
    <button type="button" onClick={() => onNavigate?.(page)} aria-current={current === page ? "page" : undefined}
      className={cx("relative inline-flex min-h-10 items-center rounded-md px-3 text-label-md transition-colors duration-fast",
        current === page ? "text-ink after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-action" : "text-ink-muted hover:text-ink")}>
      {label}
    </button>
  );
  return (
    <header style={{ viewTransitionName: "gigs-header" }} className="sticky top-0 z-sticky border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button type="button" onClick={() => onNavigate?.("search")} aria-label="Between Gigs home" className="rounded-md"><Logo height={28} /></button>
        {!compact && (
          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
            {link("search", "Find a professional")}
            {link("onboarding", "For Gigsters")}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden lg:block"><Badge tone="neutral" size="sm">Fictional sample</Badge></span>
          <ThemeToggle size="sm" showLabel={false} />
          {!compact && <span className="hidden sm:block"><Button size="sm" variant="strong" onClick={() => onNavigate?.("onboarding")}>Become a Gigster</Button></span>}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ onNavigate }: { onNavigate?: (page: GigsPage) => void }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-body-sm text-ink-subtle sm:px-6">
        <div className="flex items-center gap-3"><Logo layout="mark" height={20} /><span>Between Gigs · Interactive design concept. All people, profiles, rates and reviews are fictional.</span></div>
        <nav aria-label="Footer" className="flex gap-4">
          <button type="button" className="inline-flex min-h-6 items-center text-ink-muted hover:text-ink-brand" onClick={() => onNavigate?.("search")}>Search results</button>
          <button type="button" className="inline-flex min-h-6 items-center text-ink-muted hover:text-ink-brand" onClick={() => onNavigate?.("onboarding")}>Gigster onboarding</button>
        </nav>
      </div>
    </footer>
  );
}

/** Multi-select as a cloud of toggle chips: every option visible, one tap to pick or drop. */
export function ChipPicker({ options, value, onChange, label, max }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string; max?: number }) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((v) => v !== o) : max && value.length >= max ? value : [...value, o]);
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on} onClick={() => toggle(o)}
            className={cx("group inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-label-md transition-colors duration-fast",
              on ? "border-ink-brand bg-surface-selected text-ink-brand" : "border-line-strong text-ink-muted hover:border-ink hover:text-ink")}>
            <span aria-hidden="true" className="relative size-4 shrink-0">
              <Plus className={cx("absolute inset-0 size-4 transition duration-fast", on ? "scale-75 opacity-0" : "opacity-70")} />
              <Check className={cx("absolute inset-0 size-4 transition duration-fast", on ? "opacity-100" : "scale-75 opacity-0")} />
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** A person's portrait. `morph` names it for the view transition between the search card and the profile hero. */
export function Portrait({ person, src, className, morph = true }: { person: Person; src: string; className?: string; morph?: boolean }) {
  return (
    <img src={src} alt={`Portrait of ${person.name} (fictional)`} decoding="async"
      style={morph ? { viewTransitionName: `photo-${person.id}` } : undefined}
      className={cx("block object-cover", className)} />
  );
}

/** Illustrative map of the Los Angeles neighbourhoods in the sample, with a pin per person. Not a real map. */
export function NeighbourhoodMap({ people, img, active, onHover, onPick }: {
  people: Person[]; img: (f: string) => string; active?: string | null; onHover?: (id: string | null) => void; onPick?: (id: string) => void;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-sunken">
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full">
        <path d="M-5 70 C 20 62, 30 80, 55 72 S 90 60, 105 66 L105 105 L-5 105Z" className="fill-surface" />
        <path d="M8 6 C 22 12, 18 26, 30 30 S 40 18, 52 22" className="fill-none stroke-line-strong" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
        <path d="M70 8 C 74 22, 64 30, 78 42 S 90 60, 96 70" className="fill-none stroke-line" strokeWidth="2.4" />
        <path d="M-2 40 C 20 44, 36 38, 50 48 S 80 52, 102 46" className="fill-none stroke-line" strokeWidth="2.4" />
        <path d="M30 -2 C 34 20, 30 40, 44 60 S 50 90, 46 102" className="fill-none stroke-line" strokeWidth="1.6" />
        <ellipse cx="62" cy="14" rx="12" ry="7" className="fill-surface-selected" />
        <ellipse cx="22" cy="56" rx="9" ry="6" className="fill-surface-selected" />
        <text x="50" y="82" textAnchor="middle" className="fill-ink-subtle font-display" fontSize="6" fontWeight="600" opacity="0.6">Los Angeles</text>
      </svg>
      {people.map((p) => {
        const on = active === p.id;
        return (
          <button key={p.id} type="button" onClick={() => onPick?.(p.id)} onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(p.id)} onBlur={() => onHover?.(null)} aria-label={`${p.name}, ${p.area}`}
            style={{ left: `${p.pin.x}%`, top: `${p.pin.y}%` }}
            className={cx("absolute -translate-x-1/2 -translate-y-full transition-transform duration-base", on ? "z-raised scale-110" : "hover:scale-105")}>
            <span className={cx("block size-9 overflow-hidden rounded-full rounded-bl-none border-2 shadow-md transition-colors", on ? "border-action" : "border-surface")}>
              <img src={img(`${p.id}.jpg`)} alt="" className="size-full object-cover" />
            </span>
          </button>
        );
      })}
      <span className="absolute right-2 bottom-2 rounded-full bg-surface px-2 py-0.5 text-caption text-ink-subtle">Illustrative map · sample locations</span>
    </div>
  );
}
