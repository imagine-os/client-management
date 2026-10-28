import * as React from "react";

export type HeadingLevel = 2 | 3 | 4;

/** Renders h2–h4 so a component's title fits the page outline it sits in. */
export function Heading({ level = 3, className, children }: { level?: HeadingLevel; className?: string; children: React.ReactNode }) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return <Tag className={className}>{children}</Tag>;
}
