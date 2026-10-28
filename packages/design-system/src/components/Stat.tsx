import * as React from "react";
import { cx } from "./cx";

export interface StatProps {
  value: React.ReactNode;
  label: React.ReactNode;
  /** Change since the last period. Positive numbers read as good unless invert is set. */
  delta?: { value: string; direction: "up" | "down" | "flat"; invert?: boolean };
  size?: "md" | "lg";
  className?: string;
}

/** One headline number with its label ("20 numbered founding cards", "14 drafts"). */
export function Stat({ value, label, delta, size = "lg", className }: StatProps) {
  const good = delta && (delta.direction === "flat" ? null : (delta.direction === "up") !== Boolean(delta.invert));
  return (
    <div className={cx("grid content-start gap-1", className)}>
      <span className={cx("font-display text-ink tabular-nums", size === "lg" ? "text-stat" : "text-display-sm")}>{value}</span>
      <span className="text-body-sm text-ink-muted">{label}</span>
      {delta && (
        <span className={cx("text-label-sm", good === null ? "text-ink-muted" : good ? "text-success" : "text-danger")}>
          {delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "–"} {delta.value}
        </span>
      )}
    </div>
  );
}

/** A row of Stats separated by hairlines; stacks to two columns on small screens. */
export function StatRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("grid grid-cols-2 gap-px overflow-hidden border-y border-line bg-line md:grid-cols-4", className)}>
      {React.Children.map(children, (c) => <div className="bg-bg p-6">{c}</div>)}
    </div>
  );
}
