import * as React from "react";
import { cx } from "./cx";
import { Drawer } from "./Drawer";

interface ShellState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
}
const ShellContext = React.createContext<ShellState | null>(null);

/** Opens and closes the sidebar and inspector drawers on screens where they are hidden. */
export function useAppShell(): ShellState {
  return React.useContext(ShellContext) ?? { sidebarOpen: false, setSidebarOpen: () => {}, inspectorOpen: false, setInspectorOpen: () => {} };
}

export interface AppShellProps {
  /** TopBar. */
  topBar: React.ReactNode;
  /** ModuleBar, under the top bar. */
  moduleBar?: React.ReactNode;
  /** Sidebar. */
  sidebar?: React.ReactNode;
  /** Inspector on the right. Omit when nothing is selected. */
  inspector?: React.ReactNode;
  /** PromptBar, floating at the bottom center. */
  prompt?: React.ReactNode;
  /** Controls the inspector drawer below xl, e.g. to open it when a row is selected. Omit to let ShellInspectorButton manage it. */
  inspectorOpen?: boolean;
  onInspectorOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/** The frame of every signed-in screen: top bar, module bar, sidebar, content, inspector and the floating prompt bar. */
export function AppShell({ topBar, moduleBar, sidebar, inspector, prompt, inspectorOpen: inspectorControlled, onInspectorOpenChange, children, className }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [inspectorInner, setInspectorInner] = React.useState(false);
  const inspectorOpen = inspectorControlled ?? inspectorInner;
  const setInspectorOpen = (v: boolean) => { if (inspectorControlled === undefined) setInspectorInner(v); onInspectorOpenChange?.(v); };
  return (
    <ShellContext.Provider value={{ sidebarOpen, setSidebarOpen, inspectorOpen, setInspectorOpen }}>
    <div className={cx("flex h-full min-h-0 flex-col bg-bg text-ink", className)}>
      <div className="sticky top-0 z-sticky">
        {topBar}
        {moduleBar}
      </div>
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main className="relative min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-32 sm:px-6 sm:pt-10 lg:px-8">{children}</div>
        </main>
        {inspector}
      </div>
      {prompt && (
        <div role="region" aria-label="Prompt" className="pointer-events-none fixed inset-x-0 bottom-4 z-rail flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-2xl">{prompt}</div>
        </div>
      )}
    </div>
    </ShellContext.Provider>
  );
}

/** Opens the sidebar drawer. Put it first in the TopBar's brand slot; it only shows below the lg breakpoint. */
export function ShellMenuButton({ label = "Open navigation" }: { label?: string }) {
  const { setSidebarOpen } = useAppShell();
  return (
    <button type="button" aria-label={label} title={label} onClick={() => setSidebarOpen(true)}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink hover:bg-surface-hover lg:hidden">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}

/** Opens the inspector drawer. Place it in the page's actions; it only shows below the xl breakpoint, where the inspector is hidden. */
export function ShellInspectorButton({ label = "Show details" }: { label?: string }) {
  const { setInspectorOpen } = useAppShell();
  return (
    <button type="button" onClick={() => setInspectorOpen(true)}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-line-strong px-4 text-label-md text-ink hover:bg-surface-hover xl:hidden [&_svg]:size-4">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></svg>
      {label}
    </button>
  );
}

export interface TopBarProps {
  /** Logo or workspace switcher, far left. */
  brand: React.ReactNode;
  /** Version tag, zoom, page-level tools. */
  start?: React.ReactNode;
  /** Layout toggles, appearance, notifications, account. */
  end?: React.ReactNode;
  className?: string;
}

export function TopBar({ brand, start, end, className }: TopBarProps) {
  return (
    <header className={cx("flex h-14 items-center gap-2 border-b border-line bg-surface px-2 sm:gap-3 sm:px-3", className)}>
      <div className="flex min-w-0 shrink-0 items-center gap-2">{brand}</div>
      {start && <div className="hidden min-w-0 items-center gap-1.5 overflow-x-auto md:flex">{start}</div>}
      <div className="ml-auto flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-1.5">{end}</div>
    </header>
  );
}

/** A thin vertical rule between groups of top-bar controls. */
export function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-line" />;
}

export interface ModuleBarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
}

export interface ModuleBarProps {
  items: ModuleBarItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/** The row of open modules under the top bar (Hub, Design system, Funnel Studio…). Scrolls sideways, never wraps. */
export function ModuleBar({ items, activeId, onSelect, className }: ModuleBarProps) {
  return (
    <nav aria-label="Modules" className={cx("flex h-11 items-center gap-1 overflow-x-auto border-b border-line bg-surface px-3", className)}>
      {items.map((m) => {
        const on = m.id === activeId;
        return (
          <a
            key={m.id}
            href={m.href ?? "#"}
            aria-current={on ? "page" : undefined}
            onClick={onSelect ? (e) => { e.preventDefault(); onSelect(m.id); } : undefined}
            className={cx(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-label-sm whitespace-nowrap transition-colors duration-fast [&_svg]:size-4",
              on ? "bg-surface-selected text-ink" : "text-ink-muted hover:bg-surface-hover hover:text-ink",
            )}
          >
            {m.icon && <span className={on ? "text-ink-brand" : "text-ink-subtle"}>{m.icon}</span>}
            {m.label}
          </a>
        );
      })}
    </nav>
  );
}

export interface SidebarProps {
  /** Small uppercase title at the top ("Workspace"). */
  title?: string;
  /** Usually the collapse IconButton. */
  headerAction?: React.ReactNode;
  /** NavSections and NavItems. */
  children: React.ReactNode;
  /** Links pinned to the bottom (Version history, Team workspace). */
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

/** The left navigation column: 248px wide, or a 64px rail when collapsed. Below the lg breakpoint it becomes a drawer, opened by ShellMenuButton. */
export function Sidebar({ title, headerAction, children, footer, collapsed, className }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useAppShell();
  return (
    <>
    <Drawer side="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} title={title ?? "Navigation"}>
      <nav aria-label={title ?? "Navigation"} className="grid gap-4" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setSidebarOpen(false); }}>
        {children}
        {footer && <div className="grid gap-0.5 border-t border-line pt-3">{footer}</div>}
      </nav>
    </Drawer>
    <aside
      aria-label={title ?? "Navigation"}
      className={cx(
        "hidden shrink-0 flex-col border-r border-line bg-surface lg:flex",
        collapsed ? "w-16 items-center" : "w-62",
        className,
      )}
    >
      {(title || headerAction) && (
        <div className={cx("flex h-12 items-center", collapsed ? "justify-center" : "justify-between pr-2 pl-5")}>
          {!collapsed && title && <span className="text-eyebrow text-ink-subtle uppercase">{title}</span>}
          {headerAction}
        </div>
      )}
      <div className={cx("min-h-0 flex-1 overflow-y-auto pb-4", collapsed ? "px-3" : "px-3")}>{children}</div>
      {footer && <div className="grid gap-0.5 border-t border-line p-3">{footer}</div>}
    </aside>
    </>
  );
}

export interface InspectorProps {
  eyebrow?: string;
  title: React.ReactNode;
  /** Close or expand IconButtons. */
  actions?: React.ReactNode;
  /** InspectorSections. */
  children: React.ReactNode;
  className?: string;
}

/** The right-hand panel for the selected item: selected step, study notebook, live specimen. 320px from the xl breakpoint; below it, a drawer opened by ShellInspectorButton or useAppShell().setInspectorOpen. */
export function Inspector({ eyebrow, title, actions, children, className }: InspectorProps) {
  const { inspectorOpen, setInspectorOpen } = useAppShell();
  const name = typeof title === "string" ? title : "Details";
  return (
    <>
    <Drawer side="right" open={inspectorOpen} onClose={() => setInspectorOpen(false)} title={title} description={eyebrow}>
      <div className="-mx-5 grid divide-y divide-line [&>section]:px-5">{children}</div>
    </Drawer>
    <aside aria-label={name} className={cx("hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-line bg-surface xl:flex", className)}>
      <div className="flex items-start justify-between gap-2 p-5 pb-3">
        <div className="grid gap-1">
          {eyebrow && <span className="text-eyebrow text-ink-brand uppercase">{eyebrow}</span>}
          <h2 className="text-heading-lg text-ink">{title}</h2>
        </div>
        {actions && <div className="-mr-2 flex items-center gap-1">{actions}</div>}
      </div>
      <div className="grid gap-0 divide-y divide-line">{children}</div>
    </aside>
    </>
  );
}

export function InspectorSection({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("grid gap-3 p-5", className)}>
      {title && <h3 className="text-label-sm text-ink-muted">{title}</h3>}
      {children}
    </section>
  );
}

export interface PromptBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  /** IconButtons before the field (command menu, add). */
  start?: React.ReactNode;
  /** IconButtons after the field (undo, voice, settings). The send button is added last. */
  end?: React.ReactNode;
  className?: string;
}

/** The floating composer at the bottom of the hub, for asking or noting something from anywhere. */
export function PromptBar({ value, onChange, onSubmit, placeholder = "Ask, note or find anything…", start, end, className }: PromptBarProps) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSubmit(); }}
      className={cx(
        "flex h-14 items-center gap-1.5 rounded-xl border border-line bg-surface-raised px-2 shadow-md",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus",
        className,
      )}
    >
      {start}
      <input
        aria-label="Prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-body-md text-ink outline-none placeholder:text-ink-subtle focus-visible:outline-none"
      />
      {end}
      <button
        type="submit"
        aria-label="Send"
        disabled={!value.trim()}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-action text-on-action transition-colors duration-fast hover:bg-action-hover disabled:bg-surface-sunken disabled:text-ink-disabled"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </form>
  );
}
