import * as React from "react";
import { cx } from "./cx";

export interface ProgressProps {
  /** 0 to max. */
  value: number;
  max?: number;
  /** Names the bar ("Building", "14 of 20 founding cards left"). Shown at the start of the row. */
  label?: React.ReactNode;
  /** Text at the end of the row ("55% est."). Defaults to the percentage when label is set. */
  valueText?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

/** Shows how far something has come: module build progress, founding cards claimed, upload. */
export function Progress({ value, max = 100, label, valueText, size = "sm", className }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const end = valueText ?? (label ? `${Math.round(pct)}%` : undefined);
  return (
    <div className={cx("grid gap-1.5", className)}>
      {(label || end) && (
        <div className="flex items-baseline justify-between gap-3 text-body-sm">
          <span className="text-ink-muted">{label}</span>
          <span className="font-mono text-data-sm text-ink-muted tabular-nums">{end}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={typeof label === "string" ? label : undefined}
        className={cx("w-full overflow-hidden rounded-full bg-surface-sunken", size === "sm" ? "h-1.5" : "h-2.5")}
      >
        <div className="h-full rounded-full bg-ink-brand transition-[width] duration-slow ease-standard" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
