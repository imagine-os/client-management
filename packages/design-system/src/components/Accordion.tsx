import * as React from "react";
import { cx } from "./cx";
import { ChevronDown } from "./icons";

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  /** Short text on the right of the header ("3 items", "Personal notes"). */
  meta?: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** single: opening one closes the others. multiple: each opens on its own. */
  type?: "single" | "multiple";
  /** Ids open at first. */
  defaultOpen?: string[];
  /** flush: no outer frame, for use inside panels. */
  variant?: "framed" | "flush";
  className?: string;
}

/** Sections that expand and collapse in place: Thread setup, FAQs, settings groups. Don't hide anything people need on every visit. */
export function Accordion({ items, type = "multiple", defaultOpen = [], variant = "framed", className }: AccordionProps) {
  const [open, setOpen] = React.useState<string[]>(defaultOpen);
  const base = React.useId();
  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : type === "single" ? [id] : [...o, id]));
  return (
    <div className={cx("divide-y divide-line", variant === "framed" && "rounded-lg border border-line bg-surface", className)}>
      {items.map((it) => {
        const on = open.includes(it.id);
        return (
          <div key={it.id}>
            <h3>
              <button
                type="button"
                id={`${base}-h-${it.id}`}
                aria-expanded={on}
                aria-controls={`${base}-p-${it.id}`}
                onClick={() => toggle(it.id)}
                className={cx("flex w-full items-center gap-3 text-left text-label-md text-ink hover:bg-surface-hover", variant === "framed" ? "px-4 py-3.5" : "py-3")}
              >
                <ChevronDown className={cx("size-4 shrink-0 text-ink-subtle transition-transform duration-fast", !on && "-rotate-90")} />
                <span className="min-w-0 flex-1">{it.title}</span>
                {it.meta && <span className="shrink-0 text-body-sm font-normal text-ink-subtle">{it.meta}</span>}
              </button>
            </h3>
            <div
              id={`${base}-p-${it.id}`}
              role="region"
              aria-labelledby={`${base}-h-${it.id}`}
              hidden={!on}
              className={cx("text-body-md text-ink-muted", variant === "framed" ? "px-4 pb-4 pl-11" : "pb-3 pl-7")}
            >
              {it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
