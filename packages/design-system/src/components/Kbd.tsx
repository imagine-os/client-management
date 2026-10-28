import * as React from "react";
import { cx } from "./cx";

/** A keyboard key or shortcut ("⌘K", "Esc"). Pass each key separately for chords: keys={["⌘", "K"]}. */
export function Kbd({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-0.5", className)}>
      {keys.map((k, i) => (
        <kbd key={i} className="inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-line border-b-2 bg-surface px-1 font-mono text-data-sm text-ink-muted">
          {k}
        </kbd>
      ))}
    </span>
  );
}
