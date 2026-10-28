import * as React from "react";
import { flushSync } from "react-dom";

/** Page transition effects. Each one is a pair of keyframes in the theme CSS (see MOTION.md). */
export type PageEffect = "shift" | "reveal" | "slide" | "push" | "zoom" | "flip" | "wipe" | "dissolve";
export const pageEffects: PageEffect[] = ["shift", "slide", "push", "zoom", "reveal", "wipe", "flip", "dissolve"];

export interface PageTransitionOptions {
  /** Which effect plays. Default "slide". "theme" is reserved for the theme switch. */
  effect?: PageEffect | "theme";
  /** "back" mirrors directional effects (slide, flip). Default "forward". */
  direction?: "forward" | "back";
  /** Where reveal circles grow from: a point, an element, or the pointer event that started it. */
  origin?: { x: number; y: number } | Element | { clientX: number; clientY: number } | null;
  /** The region that moves. Default: the first `.vt-page` in the document. Pass it when a page holds several. */
  target?: HTMLElement | null;
}

type VT = { ready: Promise<void>; finished: Promise<void> };
type DocWithVT = Document & { startViewTransition?: (cb: () => void) => VT };

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function point(origin: PageTransitionOptions["origin"]) {
  if (!origin) return null;
  if (origin instanceof Element) { const r = origin.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  if ("clientX" in origin) return { x: origin.clientX, y: origin.clientY };
  return origin;
}

/**
 * Runs `update` (a state change, a route change) inside a view transition, so the old page animates out
 * and the new one in. The element with `vt-page` is what moves; everything else holds still.
 * Falls back to a plain update without the API or under reduced motion.
 */
export function startPageTransition(update: () => void, { effect = "slide", direction = "forward", origin, target }: PageTransitionOptions = {}) {
  const doc = document as DocWithVT;
  if (!doc.startViewTransition || reduced()) { update(); return null; }
  const root = document.documentElement;
  const p = point(origin);
  // The theme reveal covers the viewport; page effects play on the `vt-page` element's own box.
  const page = effect === "theme" ? null : target ?? document.querySelector<HTMLElement>(".vt-page");
  const box = page ? page.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  // Reveal origin and radius, relative to the moving element.
  const x = p ? p.x - box.left : box.width / 2, y = p ? p.y - box.top : box.height / 2;
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-r", `${Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y))}px`);
  root.style.setProperty("--vt-dir", direction === "back" ? "-1" : "1");
  root.dataset.vt = effect;
  if (page) page.style.viewTransitionName = "page";
  const t = doc.startViewTransition(() => flushSync(update));
  t.finished.finally(() => { delete root.dataset.vt; if (page) page.style.viewTransitionName = ""; });
  return t;
}

/** Hook form: `const go = useViewTransition("zoom"); go(() => setPage("studio"), event)`. */
export function useViewTransition(effect: PageEffect = "slide") {
  return React.useCallback(
    (update: () => void, origin?: PageTransitionOptions["origin"], direction?: PageTransitionOptions["direction"]) =>
      startPageTransition(update, { effect, origin, direction }),
    [effect],
  );
}
