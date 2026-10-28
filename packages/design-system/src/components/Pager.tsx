import * as React from "react";
import { cx } from "./cx";
import { ChevronLeft, ChevronRight } from "./icons";
import { IconButton } from "./IconButton";

export interface PagerProps {
  /** 1-based. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Name of the current item, shown after the position ("Connected work"). */
  itemLabel?: string;
  className?: string;
}

/** Steps through a set one item or page at a time (Coverflow, stacked profile cards, result pages). */
export function Pager({ page, pageCount, onChange, itemLabel, className }: PagerProps) {
  return (
    <div className={cx("inline-flex items-center gap-2", className)}>
      <IconButton label="Previous" size="sm" variant="secondary" icon={<ChevronLeft />}
        disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-full" />
      <span className="min-w-16 text-center text-body-sm text-ink-muted" aria-live="polite">
        <span className="font-mono text-data-md text-ink tabular-nums">{page} / {pageCount}</span>
        {itemLabel && <> · {itemLabel}</>}
      </span>
      <IconButton label="Next" size="sm" variant="secondary" icon={<ChevronRight />}
        disabled={page >= pageCount} onClick={() => onChange(page + 1)} className="rounded-full" />
    </div>
  );
}
