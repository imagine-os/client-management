import * as React from "react";
import { cx } from "./cx";
import { startPageTransition } from "../motion/transition";

export type Theme = "light" | "dark";

export interface UseThemeOptions {
  /** localStorage key for the person's choice. Pass null to not remember it. Default "bg-theme". */
  storageKey?: string | null;
  /** Used when nothing is saved. Default: the operating system's setting. */
  defaultTheme?: Theme;
}

const read = (key: string | null): Theme | null => {
  try { const v = key ? localStorage.getItem(key) : null; return v === "light" || v === "dark" ? v : null; } catch { return null; }
};

/**
 * The page theme: reads and sets `data-theme` on <html>, remembers the choice, and plays the circular
 * reveal from the control that changed it.
 */
export function useTheme({ storageKey = "bg-theme", defaultTheme }: UseThemeOptions = {}) {
  const [theme, setState] = React.useState<Theme>(() => {
    if (typeof document === "undefined") return defaultTheme ?? "light";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return read(storageKey) ?? defaultTheme ?? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });
  React.useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  const setTheme = React.useCallback((next: Theme, origin?: Element | null) => {
    startPageTransition(() => {
      document.documentElement.setAttribute("data-theme", next);
      setState(next);
    }, { effect: "theme", origin });
    try { if (storageKey) localStorage.setItem(storageKey, next); } catch { /* storage blocked: still switches */ }
  }, [storageKey]);
  return { theme, setTheme, toggle: (origin?: Element | null) => setTheme(theme === "dark" ? "light" : "dark", origin) };
}

export interface ThemeToggleProps {
  /** Controlled theme. Omit both to let the toggle drive the page through useTheme. */
  theme?: Theme;
  onChange?: (theme: Theme, origin: HTMLElement) => void;
  /** Show "Day" / "Night" beside the switch. Default true. */
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Day/Night switch: a sliding sun and moon. Uncontrolled, it switches the whole page with a circular reveal. */
export function ThemeToggle({ theme: controlled, onChange, showLabel = true, size = "md", className }: ThemeToggleProps) {
  const own = useTheme();
  const theme = controlled ?? own.theme;
  const night = theme === "dark";
  const sm = size === "sm";
  const flip = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = night ? "light" : "dark";
    if (onChange) onChange(next, e.currentTarget);
    else own.setTheme(next, e.currentTarget);
  };
  return (
    <button type="button" role="switch" aria-checked={night} aria-label="Night mode" onClick={flip}
      className={cx("group inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full border border-line-strong bg-surface text-ink transition-colors duration-fast hover:border-ink-brand",
        sm ? "h-8 p-0.5 pr-3" : "h-10 p-1 pr-3.5", !showLabel && (sm ? "pr-0.5" : "pr-1"), className)}>
      <span aria-hidden="true" className={cx("relative overflow-hidden rounded-full transition-colors duration-slow",
        sm ? "h-6 w-11" : "h-8 w-14", night ? "bg-surface-brand" : "bg-surface-selected")}>
        {/* stars, visible at night */}
        <span className={cx("absolute inset-0 transition-all duration-slow", night ? "opacity-100" : "-translate-y-2 opacity-0")}>
          <span className="absolute top-1.5 left-2 size-0.5 rounded-full bg-ink-on-brand" />
          <span className="absolute top-4 left-3.5 size-px rounded-full bg-ink-on-brand" />
          <span className="absolute top-2.5 left-5 size-px rounded-full bg-ink-on-brand" />
        </span>
        <span className={cx("absolute top-1 left-1 grid place-items-center rounded-full bg-action text-on-action shadow-sm transition-transform duration-slow ease-spring",
          sm ? "size-4" : "size-6", night && (sm ? "translate-x-5" : "translate-x-6"))}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
            className={cx("absolute transition-all duration-slow", sm ? "size-3" : "size-3.5", night ? "scale-50 -rotate-90 opacity-0" : "opacity-100")}>
            <circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor"
            className={cx("absolute transition-all duration-slow", sm ? "size-3" : "size-3.5", night ? "opacity-100" : "scale-50 rotate-90 opacity-0")}>
            <path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11Z" />
          </svg>
        </span>
      </span>
      {showLabel && <span className="font-mono text-data-sm tracking-wider uppercase">{night ? "Night" : "Day"}</span>}
    </button>
  );
}
