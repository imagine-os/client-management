import * as React from "react";
import { cx } from "./cx";
import { Check, ChevronDown } from "./icons";
import { controlFrame, type ControlSize } from "./Input";
import { layerAttrs, useAnchoredLayer } from "./layer";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  /** Controlled value. Omit and use defaultValue to let the select manage itself. */
  value?: string;
  defaultValue?: string;
  /** Called with the new value. */
  onValueChange?: (value: string) => void;
  /** Same as onValueChange, in the shape of a native change event, for form libraries. */
  onChange?: (event: { target: { value: string; name?: string } }) => void;
  /** Shown in the field while nothing is chosen ("Choose a service"). It is not an option in the list. */
  placeholder?: string;
  /** Submitted with the form, through a hidden input. */
  name?: string;
  size?: ControlSize;
  invalid?: boolean;
  disabled?: boolean;
  /** Icon before the value (filter bars use one). */
  start?: React.ReactNode;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/** Picks one value from a short list. The list is drawn by the system (rounded, raised, same as Menu and Combobox) instead of the operating system, so it matches in both themes. Long, searchable lists use Combobox. */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { options, value: controlled, defaultValue, onValueChange, onChange, placeholder, name, size = "md", invalid, disabled, start, id, className, ...aria },
  ref,
) {
  const auto = React.useId();
  const sid = id ?? auto;
  const listId = `${sid}-list`;
  const [inner, setInner] = React.useState<string | undefined>(defaultValue);
  const value = controlled ?? inner;
  const selected = options.find((o) => o.value === value);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const wrap = React.useRef<HTMLDivElement>(null);
  const button = React.useRef<HTMLButtonElement | null>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const typed = React.useRef({ text: "", at: 0 });
  useAnchoredLayer(open, button, list, { matchWidth: true });

  const enabled = (i: number) => options[i] && !options[i].disabled;
  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (enabled(i)) return i;
    return from;
  };
  const first = () => step(-1, 1);
  const last = () => step(options.length, -1);

  const openList = (at?: number) => {
    if (disabled) return;
    const cur = options.findIndex((o) => o.value === value);
    setActive(at ?? (cur >= 0 ? cur : first()));
    setOpen(true);
  };
  const close = (refocus = true) => { setOpen(false); if (refocus) button.current?.focus(); };
  const choose = (i: number) => {
    const o = options[i]; if (!o || o.disabled) return;
    if (controlled === undefined) setInner(o.value);
    onValueChange?.(o.value);
    onChange?.({ target: { value: o.value, name } });
    close();
  };

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) close(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  React.useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  // Type a letter to jump to the next option that starts with it, like a native select.
  const typeahead = (key: string) => {
    const now = Date.now();
    typed.current = { text: now - typed.current.at < 600 ? typed.current.text + key : key, at: now };
    const q = typed.current.text.toLowerCase();
    const from = open ? active : options.findIndex((o) => o.value === value);
    const order = [...options.keys()].map((k) => (k + Math.max(from, 0) + (q.length === 1 ? 1 : 0)) % options.length);
    const hit = order.find((i) => enabled(i) && options[i].label.toLowerCase().startsWith(q));
    if (hit === undefined) return;
    if (open) setActive(hit); else choose(hit);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openList(e.key === "ArrowUp" ? last() : undefined); }
      else if (e.key.length === 1 && /\S/.test(e.key)) typeahead(e.key);
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => step(a, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => step(a, -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(first()); }
    else if (e.key === "End") { e.preventDefault(); setActive(last()); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") close(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) typeahead(e.key);
  };

  return (
    <div ref={wrap} className={cx("relative", className)}>
      <button
        ref={(el) => { button.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
        id={sid}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={cx(controlFrame(size, invalid, disabled), "w-full cursor-pointer text-left")}
        {...aria}
      >
        {start}
        <span className={cx("min-w-0 flex-1 truncate", !selected && "text-ink-subtle")}>{selected?.label ?? placeholder ?? "Choose…"}</span>
        <ChevronDown className={cx("transition-transform duration-fast", open && "rotate-180")} />
      </button>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      {open && (
        <ul
          ref={list}
          {...layerAttrs}
          id={listId}
          role="listbox"
          aria-labelledby={sid}
          className="absolute top-full right-0 left-0 z-dropdown mt-2 grid max-h-72 min-w-full overflow-auto rounded-lg border border-line bg-surface-raised p-1.5 shadow-md"
        >
          {options.map((o, i) => {
            const isSel = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                data-i={i}
                role="option"
                aria-selected={isSel}
                aria-disabled={o.disabled || undefined}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                onMouseEnter={() => { if (!o.disabled) setActive(i); }}
                className={cx(
                  "flex min-h-9 items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-body-md",
                  o.disabled ? "cursor-not-allowed text-ink-disabled" : "cursor-pointer text-ink",
                  i === active && !o.disabled && "bg-surface-hover",
                )}
              >
                <span className="min-w-0 flex-1">{o.label}</span>
                <Check className={cx("size-4 shrink-0 text-ink-brand", !isSel && "invisible")} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
