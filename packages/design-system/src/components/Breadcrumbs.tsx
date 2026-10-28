import * as React from "react";
import { cx } from "./cx";
import { ChevronRight } from "./icons";

export interface Crumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  /** From the top level down. The last item is the current page. */
  items: Crumb[];
  className?: string;
}

/** Shows where a page sits: Workspace › Marketing & growth › Campaign Studio. */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-body-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="inline-flex items-center gap-1.5 font-semibold text-ink [&_svg]:size-3.5">{c.icon}{c.label}</span>
              ) : (
                <a href={c.href} className="-my-1 inline-flex items-center gap-1.5 rounded-xs py-1 text-ink-muted hover:text-ink hover:underline [&_svg]:size-3.5">{c.icon}{c.label}</a>
              )}
              {!last && <ChevronRight className={cx("size-3.5 text-ink-subtle")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
