import * as React from "react";
import { cx } from "./cx";

export interface PageHeaderProps {
  /** Area name above the title ("MARKETING & GROWTH"). Set in sentence case; the style uppercases it. */
  eyebrow?: string;
  title: React.ReactNode;
  /** A version tag or count after the title ("1.1", "28"). */
  meta?: React.ReactNode;
  description?: React.ReactNode;
  /** Page actions, primary last: Undo, Export, Save changes. */
  actions?: React.ReactNode;
  /** Breadcrumbs above everything. */
  breadcrumbs?: React.ReactNode;
  /** studio: display-md title for studio landing pages; page: display-sm for app pages. */
  size?: "page" | "studio";
  className?: string;
}

/** The top of every app page: where you are, what this is, what you can do. */
export function PageHeader({ eyebrow, title, meta, description, actions, breadcrumbs, size = "page", className }: PageHeaderProps) {
  return (
    <header className={cx("grid gap-4", className)}>
      {breadcrumbs}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="grid min-w-0 gap-2">
          {eyebrow && <span className="text-eyebrow text-ink-brand uppercase">{eyebrow}</span>}
          <div className="flex items-center gap-3">
            <h1 className={cx("font-display text-ink text-balance", size === "studio" ? "text-display-md" : "text-display-sm")}>{title}</h1>
            {meta && <span className="rounded-xs border border-line px-1.5 py-0.5 font-mono text-data-sm text-ink-muted">{meta}</span>}
          </div>
          {description && <p className="max-w-prose text-body-md text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
