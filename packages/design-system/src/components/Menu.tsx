import * as React from "react";
import { cx } from "./cx";
import { Check } from "./icons";
import { layerAttrs, useAnchoredLayer } from "./layer";

export interface MenuItem {
  label: string;
  onSelect?: () => void;
  icon?: React.ReactNode;
  /** Secondary line ("Profile only · Version unavailable"). */
  description?: string;
  /** Keyboard hint shown on the right ("⌘K"). */
  shortcut?: string;
  /** Shows a check: the current choice in a pick-one menu. */
  checked?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

export type MenuEntry = MenuItem | "separator" | { heading: string };

export interface MenuProps {
  /** A Button or IconButton. Gets aria-haspopup and opens the menu. */
  trigger: React.ReactElement;
  items: MenuEntry[];
  align?: "start" | "end";
  /** Optional element above the items, e.g. a search Input in the company switcher. */
  header?: React.ReactNode;
  /** Opens on mount. For documentation and tests. */
  defaultOpen?: boolean;
  className?: string;
}

/** A list of actions or choices opened from a button: Appearance, account, row actions, company switcher. */
export function Menu({ trigger, items, align = "start", header, defaultOpen = false, className }: MenuProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const wrap = React.useRef<HTMLSpanElement>(null);
  const list = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const popup = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  useAnchoredLayer(open, triggerRef, popup, { align });

  const focusItem = (step: number | "first" | "last") => {
    const els = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)') ?? []);
    if (!els.length) return;
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    const n = step === "first" ? 0 : step === "last" ? els.length - 1 : (i + step + els.length) % els.length;
    els[n].focus();
  };
  const close = (refocus = true) => { setOpen(false); if (refocus) triggerRef.current?.focus(); };

  React.useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => focusItem("first"));
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) close(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const tp = (trigger as React.ReactElement<Record<string, unknown>>).props as {
    onClick?: (e: React.MouseEvent) => void; onKeyDown?: (e: React.KeyboardEvent) => void;
  };
  const t = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => { triggerRef.current = el; },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? id : undefined,
    onClick: (e: React.MouseEvent) => { tp.onClick?.(e); setOpen((o) => !o); },
    onKeyDown: (e: React.KeyboardEvent) => {
      tp.onKeyDown?.(e);
      if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); }
    },
  });

  return (
    <span ref={wrap} className="relative inline-flex">
      {t}
      {open && (
        <div
          ref={popup}
          {...layerAttrs}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); close(); }
          }}
          className={cx(
            "absolute top-full z-dropdown mt-2 grid max-h-96 w-max max-w-80 min-w-56 overflow-auto rounded-lg border border-line bg-surface-raised p-1.5 shadow-md",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {header && <div className="p-1.5 pb-2">{header}</div>}
          <div
          ref={list}
          id={id}
          role="menu"
          className="grid"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); focusItem(1); }
            if (e.key === "ArrowUp") { e.preventDefault(); focusItem(-1); }
            if (e.key === "Home") { e.preventDefault(); focusItem("first"); }
            if (e.key === "End") { e.preventDefault(); focusItem("last"); }
            if (e.key === "Tab") { e.preventDefault(); close(); }
          }}
        >
          {items.map((it, i) => {
            if (it === "separator") return <div key={i} role="separator" className="my-1.5 h-px bg-line" />;
            if ("heading" in it) return <div key={i} className="px-2.5 pt-2 pb-1 text-eyebrow text-ink-subtle uppercase">{it.heading}</div>;
            const pickOne = it.checked !== undefined;
            return (
              <button
                key={i}
                type="button"
                role={pickOne ? "menuitemradio" : "menuitem"}
                aria-checked={pickOne ? it.checked : undefined}
                disabled={it.disabled}
                onClick={() => { it.onSelect?.(); close(); }}
                className={cx(
                  "flex min-h-9 w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-left text-body-md outline-none",
                  "hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none disabled:cursor-not-allowed disabled:text-ink-disabled",
                  it.danger ? "text-danger" : "text-ink",
                  "[&_svg]:size-4 [&_svg]:shrink-0",
                )}
              >
                {it.icon && <span className={it.danger ? "" : "text-ink-muted"}>{it.icon}</span>}
                <span className="grid min-w-0 flex-1">
                  <span className="truncate">{it.label}</span>
                  {it.description && <span className="truncate text-body-sm text-ink-subtle">{it.description}</span>}
                </span>
                {it.shortcut && <kbd className="font-mono text-data-sm text-ink-subtle">{it.shortcut}</kbd>}
                {pickOne && <Check className={cx("text-ink-brand", !it.checked && "invisible")} />}
              </button>
            );
          })}
          </div>
        </div>
      )}
    </span>
  );
}
