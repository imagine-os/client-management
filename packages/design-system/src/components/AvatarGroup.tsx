import * as React from "react";
import { cx } from "./cx";
import { Avatar } from "./Avatar";

export interface AvatarGroupProps {
  /** People in order of relevance. */
  people: Array<{ name: string; src?: string }>;
  /** How many to show before "+N". */
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Overlapping avatars for a team, contributors or who's in a call, with a "+N" for the rest. */
export function AvatarGroup({ people, max = 4, size = "md", className }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  const label = people.map((p) => p.name).join(", ");
  return (
    <span role="group" aria-label={label} className={cx("inline-flex items-center", className)}>
      {shown.map((p, i) => (
        <span key={p.name + i} aria-hidden="true" className={cx("inline-flex rounded-full ring-2 ring-surface", i > 0 && (size === "sm" ? "-ml-1" : "-ml-1.5"))}>
          <Avatar name={p.name} src={p.src} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span aria-hidden="true" className={cx("inline-flex items-center justify-center rounded-full bg-surface-sunken font-mono text-ink-muted ring-2 ring-surface", size === "sm" ? "-ml-1" : "-ml-1.5",
          size === "sm" ? "size-6 text-data-sm" : "size-8 text-label-sm")}>+{rest}</span>
      )}
    </span>
  );
}
