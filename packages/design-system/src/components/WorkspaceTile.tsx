import * as React from "react";
import { cx } from "./cx";
import { initials } from "./Avatar";
import { Heading, type HeadingLevel } from "./heading";

export type CategoryColor = "cat-1" | "cat-2" | "cat-3" | "cat-4" | "cat-5" | "cat-6" | "cat-7" | "cat-8";

const covers: Record<CategoryColor, string> = {
  "cat-1": "bg-cat-1", "cat-2": "bg-cat-2", "cat-3": "bg-cat-3", "cat-4": "bg-cat-4",
  "cat-5": "bg-cat-5", "cat-6": "bg-cat-6", "cat-7": "bg-cat-7", "cat-8": "bg-cat-8",
};

export interface WorkspaceTileProps {
  name: string;
  /** Relationship: "Client", "Prospect", "To organize". Shown as the eyebrow. */
  kind: string;
  /** One line of state: "Hub linked", "Awaiting hub link · 2 projects". */
  status?: string;
  /** Cover color. Keep it stable per workspace (hash the id). */
  color?: CategoryColor;
  /** Cover image (a logo shot or hero). Replaces the color. */
  image?: string;
  /** The open link. */
  href: string;
  /** Pin IconButton, top right of the cover. */
  pin?: React.ReactNode;
  /** Secondary IconButton in the footer (edit). */
  secondaryAction?: React.ReactNode;
  /** Heading level of the title, so it fits the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** A company workspace in the Playset gallery. The cover is a flat category color; the initials sit on a surface plate, so they read in both themes. */
export function WorkspaceTile({ name, kind, status, color = "cat-8", image, href, pin, secondaryAction, headingLevel = 3, className }: WorkspaceTileProps) {
  return (
    <article className={cx("flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-[border-color] duration-fast hover:border-line-strong", className)}>
      <div className={cx("relative flex aspect-video items-center justify-center", !image && covers[color])}>
        {image
          ? <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
          : <span aria-hidden="true" className="inline-flex size-14 items-center justify-center rounded-lg bg-surface font-display text-heading-lg text-ink shadow-sm">{initials(name)}</span>}
        {pin && <div className="absolute top-2 right-2 rounded-md bg-surface/90">{pin}</div>}
      </div>
      <div className="grid flex-1 content-start gap-1 p-4">
        <span className="text-eyebrow text-ink-subtle uppercase">{kind}</span>
        <Heading level={headingLevel} className="truncate text-heading-md text-ink">{name}</Heading>
        {status && <p className="text-body-sm text-ink-muted">{status}</p>}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line py-2 pr-2 pl-4">
        <a href={href} className="-my-1 inline-flex items-center gap-1 rounded-xs py-1 text-label-sm text-link underline-offset-2 hover:underline">
          Open workspace
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
        </a>
        {secondaryAction}
      </div>
    </article>
  );
}
