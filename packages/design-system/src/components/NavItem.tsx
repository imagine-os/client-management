import * as React from "react";
import { cx } from "./cx";
import { Count } from "./Count";

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  icon?: React.ReactNode;
  count?: number;
  active?: boolean;
  /** Rail mode: icon only, label becomes the tooltip and accessible name. */
  collapsed?: boolean;
}

/** One row in the sidebar or a section nav (All modules 101, Pinned 7, Clients 7). */
export function NavItem({ label, icon, count, active, collapsed, className, ...rest }: NavItemProps) {
  return (
    <a
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={cx(
        "group flex h-10 items-center gap-3 rounded-md text-label-md transition-colors duration-fast ease-standard [&_svg]:size-5 [&_svg]:shrink-0",
        collapsed ? "w-10 justify-center" : "px-3",
        active ? "bg-surface-selected text-ink" : "text-ink-muted hover:bg-surface-hover hover:text-ink",
        className,
      )}
      {...rest}
    >
      {icon && <span className={cx(active ? "text-ink-brand" : "text-ink-subtle group-hover:text-ink-muted")}>{icon}</span>}
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {!collapsed && count !== undefined && <Count value={count} />}
    </a>
  );
}

/** A titled group of NavItems. */
export function NavSection({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("grid gap-0.5", className)}>
      {title && <span className="px-3 pb-1 text-eyebrow text-ink-subtle uppercase">{title}</span>}
      {children}
    </div>
  );
}
