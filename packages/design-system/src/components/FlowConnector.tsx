import * as React from "react";
import { cx } from "./cx";

export interface FlowConnectorProps {
  /** What moves along this link: "Claims a card", "Books". Short, in caption type. */
  label?: string;
  /** dashed for planned or optional paths. */
  variant?: "solid" | "dashed";
  className?: string;
}

/** The arrow between two steps on a flow or funnel canvas. The label sits above the line on one line, so every arrow in a row stays at the same height. */
export function FlowConnector({ label, variant = "solid", className }: FlowConnectorProps) {
  return (
    <div className={cx("relative flex min-w-16 flex-1 basis-0 items-center self-center px-2", className)}>
      {label && (
        <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-caption whitespace-nowrap text-ink-subtle">{label}</span>
      )}
      <div className="flex w-full items-center text-line-strong" aria-hidden="true">
        <span className={cx("h-0 flex-1 border-t-2 border-current", variant === "dashed" && "border-dashed")} />
        <svg viewBox="0 0 8 10" className="-ml-px h-2.5 w-2 shrink-0 fill-current"><path d="M0 0 8 5 0 10Z" /></svg>
      </div>
    </div>
  );
}
