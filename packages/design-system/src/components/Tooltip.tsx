import * as React from "react";
import { cx } from "./cx";

export interface TooltipProps {
  /** Short text, one line. Never the only place important information lives. */
  content: React.ReactNode;
  side?: "top" | "bottom";
  /** One focusable element (usually an IconButton). */
  children: React.ReactElement;
  /** Shows on mount. For documentation and tests. */
  defaultOpen?: boolean;
}

/** Names an icon-only control or adds a keyboard hint, on hover and on focus. */
export function Tooltip({ content, side = "top", children, defaultOpen = false }: TooltipProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  const child = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    "aria-describedby": open ? id : undefined,
  });
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      {child}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cx(
            "pointer-events-none absolute left-1/2 z-tooltip -translate-x-1/2 rounded-sm bg-action-strong px-2 py-1 text-label-sm whitespace-nowrap text-on-action-strong shadow-md",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
