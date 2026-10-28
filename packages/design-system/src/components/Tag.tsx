import * as React from "react";
import { cx } from "./cx";
import { Close } from "./icons";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Adds a remove button. The tag text names it for screen readers. */
  onRemove?: () => void;
  /** Makes the whole tag a toggle (filter chips). */
  selected?: boolean;
  onSelect?: () => void;
}

/** Descriptive keywords on cards (Alterations, Closet styling) and filter chips (Silver Lake, Echo Park). */
export function Tag({ onRemove, selected, onSelect, className, children, ...rest }: TagProps) {
  const look = cx(
    "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-3 text-label-sm whitespace-nowrap transition-colors duration-fast",
    selected ? "border-transparent bg-surface-selected text-ink-brand" : "border-line bg-surface-sunken text-ink-muted",
    onSelect && "cursor-pointer hover:text-ink",
    className,
  );
  if (onSelect) {
    return (
      <button type="button" aria-pressed={selected} onClick={onSelect} className={look}>
        {children}
      </button>
    );
  }
  return (
    <span className={cx(look, onRemove && "pr-1")} {...rest}>
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${typeof children === "string" ? children : "tag"}`}
          className="inline-flex size-6 items-center justify-center rounded-full hover:bg-surface-hover focus-visible:outline-offset-0 [&_svg]:size-3">
          <Close />
        </button>
      )}
    </span>
  );
}
