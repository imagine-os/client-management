import * as React from "react";
import { cx } from "./cx";

export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  /** Names the group for screen readers, e.g. "View". */
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
}

/** Switches between views of the same content (Gallery / List / Coverflow / Tiles). Not for navigation: use Tabs. */
export function SegmentedControl({ label, options, value, onChange, size = "md", className }: SegmentedControlProps) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const move = (from: number, step: number) => {
    const next = (from + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label}
      className={cx("inline-flex gap-1 rounded-md bg-surface-sunken p-1", className)}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(i, 1); }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(i, -1); }
            }}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-sm px-3 transition-colors duration-fast ease-standard [&_svg]:size-4",
              size === "sm" ? "h-7 text-label-sm" : "h-8 text-label-md",
              on ? "bg-surface text-ink shadow-xs" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
