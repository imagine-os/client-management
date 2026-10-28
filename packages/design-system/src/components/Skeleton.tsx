import * as React from "react";
import { cx } from "./cx";

export interface SkeletonProps {
  /** text: a line of body text; block: an image or card area; circle: an avatar. */
  shape?: "text" | "block" | "circle";
  className?: string;
}

/** A placeholder in the shape of content that is still loading. Use for loads over 300ms. */
export function Skeleton({ shape = "text", className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "block animate-pulse bg-surface-sunken motion-reduce:animate-none",
        shape === "text" && "h-3.5 w-full rounded-xs",
        shape === "block" && "h-32 w-full rounded-lg",
        shape === "circle" && "size-8 rounded-full",
        className,
      )}
    />
  );
}
