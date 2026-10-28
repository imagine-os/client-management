import * as React from "react";
import { cx } from "./cx";

export interface AvatarProps {
  /** Full name: used for the alt text and the initials fallback. */
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  /** square for companies and workspaces, circle for people. */
  shape?: "circle" | "square";
  className?: string;
}

const sizes = { sm: "size-6 text-caption", md: "size-8 text-label-sm", lg: "size-12 text-heading-sm" };

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** A person's photo, or their initials when there is no photo. Squares stand for companies. */
export function Avatar({ name, src, size = "md", shape = "circle", className }: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden bg-surface-selected font-sans font-semibold text-ink-brand",
        shape === "circle" ? "rounded-full" : "rounded-sm",
        sizes[size],
        className,
      )}
    >
      {src && !failed
        ? <img src={src} alt={name} onError={() => setFailed(true)} className="size-full object-cover" />
        : <span aria-label={name} role="img">{initials(name)}</span>}
    </span>
  );
}
