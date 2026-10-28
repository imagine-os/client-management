import * as React from "react";
import { cx } from "./cx";
import { Check, ChevronDown } from "./icons";
import { controlFrame, type ControlSize } from "./Input";
import { layerAttrs, useAnchoredLayer } from "./layer";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Second line ("Hub linked · v3.64"). Also searched. */
  description?: string;
  /** Leading visual, usually an Avatar. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Accessible name when there's no Field label. */
  "aria-label"?: string;
  id?: string;
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: string;
  size?: ControlSize;
  invalid?: boolean;
  className?: string;
}

/** Pick one from a long list by typing to filter: the company switcher, assigning a person, choosing a service from dozens. Short lists use Select. */
export function Combobox({ options, value, onChange, placeholder = "Search…", emptyText = "No matches", size = "md", invalid, className, id, ...rest }: ComboboxProps) {
  const auto = React.useId();
  const cid = id ?? auto;
  const listId = `${cid}-list`;
  const selected = options.find((o) => o.value === value) ?? null;
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const wrap = React.useRef<HTMLDivElement>(null);
  const frame = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((o) => (o.label + " " + (o.description ?? "")).toLowerCase().includes(q)) : options;

  React.useEffect(() => { setActive(0); }, [query]);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) { setOpen(false); setQuery(""); } };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useAnchoredLayer(open, frame, listRef, { matchWidth: true });
  const choose = (o: ComboboxOption) => { if (o.disabled) return; onChange(o.value); setOpen(false); setQuery(""); };

  return (
    <div ref={wrap} className={cx("relative", className)}>
      <div ref={frame} className={cx(controlFrame(size, invalid), "pr-2")}>
        {!open && selected?.icon}
        <input
          id={cid}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && shown[active] ? `${listId}-${active}` : undefined}
          aria-invalid={invalid || undefined}
          value={open ? query : selected?.label ?? ""}
          placeholder={selected && open ? selected.label : placeholder}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, shown.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter" && open && shown[active]) { e.preventDefault(); choose(shown[active]); }
            if (e.key === "Escape") { setOpen(false); setQuery(""); }
            if (e.key === "Tab") { setOpen(false); setQuery(""); }
          }}
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-subtle focus-visible:outline-none"
          {...rest}
        />
        <ChevronDown className={cx("pointer-events-none transition-transform", open && "rotate-180")} />
      </div>
      {open && (
        <ul ref={listRef} {...layerAttrs} id={listId} role="listbox" className="absolute top-full right-0 left-0 z-dropdown mt-2 grid max-h-72 overflow-auto rounded-lg border border-line bg-surface-raised p-1.5 shadow-md">
          {shown.length === 0 && <li className="px-2.5 py-2 text-body-sm text-ink-subtle">{emptyText}</li>}
          {shown.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              onMouseEnter={() => setActive(i)}
              className={cx(
                "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-body-md text-ink",
                i === active && "bg-surface-hover",
                o.disabled && "cursor-not-allowed text-ink-disabled",
              )}
            >
              {o.icon}
              <span className="grid min-w-0 flex-1">
                <span className="truncate">{o.label}</span>
                {o.description && <span className="truncate text-body-sm text-ink-muted">{o.description}</span>}
              </span>
              <Check className={cx("size-4 shrink-0 text-ink-brand", o.value !== value && "invisible")} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
