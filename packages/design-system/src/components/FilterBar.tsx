import * as React from "react";
import { cx } from "./cx";

export interface FilterBarProps {
  /** Search Input, Selects, a SegmentedControl, a Slider: in that order, most-used first. */
  children: React.ReactNode;
  /** Right-aligned extras ("Reset filters", "Depth on"). */
  end?: React.ReactNode;
  className?: string;
}

/** The recessed row of search and filters above a collection. Wraps on narrow screens. */
export function FilterBar({ children, end, className }: FilterBarProps) {
  return (
    <div role="search" className={cx("flex flex-wrap items-center gap-2 rounded-lg bg-surface-sunken p-2", className)}>
      {children}
      {end && <div className="ml-auto flex items-center gap-2">{end}</div>}
    </div>
  );
}

/** A small inline label for a filter control ("Status", "Sort"). */
export function FilterLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="pl-1 text-label-sm text-ink-muted">{children}</label>;
}
