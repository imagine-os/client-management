import * as React from "react";
import { cx } from "./cx";
import { Count } from "./Count";

interface TabsCtx { value: string; setValue: (v: string) => void; base: string }
const Ctx = React.createContext<TabsCtx | null>(null);
const useTabs = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("Tab parts must be inside <Tabs>.");
  return c;
};

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

/** Switches between sections of one page (Studies / Media lab / Profiles). The only tab style in the product. */
export function Tabs({ value, onChange, children, className }: TabsProps) {
  const base = React.useId();
  return (
    <Ctx.Provider value={{ value, setValue: onChange, base }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabList({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const tabs = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []);
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = tabs[(next + tabs.length) % tabs.length];
    t.focus();
    t.click();
  };
  return (
    <div ref={ref} role="tablist" aria-label={label} onKeyDown={onKeyDown}
      className={cx("flex gap-6 overflow-x-auto border-b border-line", className)}>
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  /** A count after the label ("Composition studies 10"). */
  count?: number;
  disabled?: boolean;
}

export function Tab({ value, children, icon, count, disabled }: TabProps) {
  const t = useTabs();
  const on = t.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${t.base}-tab-${value}`}
      aria-controls={on ? `${t.base}-panel-${value}` : undefined}
      aria-selected={on}
      tabIndex={on ? 0 : -1}
      disabled={disabled}
      onClick={() => t.setValue(value)}
      className={cx(
        "relative -mb-px inline-flex h-10 shrink-0 items-center gap-2 border-b-2 text-label-md whitespace-nowrap transition-colors duration-fast [&_svg]:size-4",
        on ? "border-ink-brand text-ink" : "border-transparent text-ink-muted hover:text-ink",
        "disabled:cursor-not-allowed disabled:text-ink-disabled",
      )}
    >
      {icon}
      {children}
      {count !== undefined && <Count value={count} />}
    </button>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const t = useTabs();
  if (t.value !== value) return null;
  return (
    <div role="tabpanel" id={`${t.base}-panel-${value}`} aria-labelledby={`${t.base}-tab-${value}`} tabIndex={0}
      className={cx("pt-6", className)}>
      {children}
    </div>
  );
}
