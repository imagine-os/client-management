import * as React from "react";
import { cx } from "./cx";

export interface CountProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  /** accent for unread or new items; quiet for totals next to labels. */
  tone?: "quiet" | "accent";
  /** Caps the display, e.g. 99 shows "99+". */
  max?: number;
}

/** A number pill after a label: category totals in the sidebar, tab counts, unread notifications. */
export function Count({ value, tone = "quiet", max, className, ...rest }: CountProps) {
  const shown = max !== undefined && value > max ? `${max}+` : String(value);
  return (
    <span
      className={cx(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 font-mono text-data-sm tabular-nums",
        tone === "accent" ? "bg-action text-on-action" : "bg-surface-sunken text-ink-muted",
        className,
      )}
      {...rest}
    >
      {shown}
    </span>
  );
}
