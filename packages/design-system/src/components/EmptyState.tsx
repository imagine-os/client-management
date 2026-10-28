import * as React from "react";
import { cx } from "./cx";
import { Heading, type HeadingLevel } from "./heading";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  /** What is empty, in plain words: "No studies yet". */
  title: React.ReactNode;
  /** What will appear here and how to add the first one. */
  children?: React.ReactNode;
  /** Usually one primary Button. */
  action?: React.ReactNode;
  /** Heading level of the title, so it fits the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** Fills a view that has nothing to show yet, and says how to start. */
export function EmptyState({ icon, title, children, action, headingLevel = 3, className }: EmptyStateProps) {
  return (
    <div className={cx("grid justify-items-center gap-3 rounded-lg border border-dashed border-line-dashed px-6 py-12 text-center", className)}>
      {icon && <span className="mb-1 inline-flex size-12 items-center justify-center rounded-full bg-surface-selected text-ink-brand [&_svg]:size-6">{icon}</span>}
      <Heading level={headingLevel} className="text-heading-md text-ink">{title}</Heading>
      {children && <p className="max-w-sm text-body-md text-ink-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
