import * as React from "react";

export interface LayerOptions {
  /** Make the layer at least as wide as the anchor (lists under a field). */
  matchWidth?: boolean;
  /** Line the layer up with the anchor's left (start) or right (end) edge. */
  align?: "start" | "end";
  /** Gap between anchor and layer, in px. */
  offset?: number;
}

/**
 * Lifts a dropdown into the browser's top layer (the Popover API) and pins it to its anchor, so no
 * scrolling panel, card or dialog can clip it. Flips above the anchor when there's no room below.
 * Browsers without the Popover API keep the layer's own absolute positioning.
 * The layer element needs popover="manual" and the classes `fixed m-0` handled here via style.
 */
export function useAnchoredLayer(
  open: boolean,
  anchor: React.RefObject<HTMLElement | null>,
  layer: React.RefObject<HTMLElement | null>,
  { matchWidth = false, align = "start", offset = 8 }: LayerOptions = {},
) {
  React.useLayoutEffect(() => {
    const el = layer.current as (HTMLElement & { showPopover?: () => void; hidePopover?: () => void }) | null;
    const a = anchor.current;
    if (!open || !el || !a || typeof el.showPopover !== "function") return;
    try { el.showPopover(); } catch { return; }
    const place = () => {
      const r = a.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      el.style.position = "fixed";
      el.style.margin = "0";
      el.style.inset = "auto";
      if (matchWidth) el.style.minWidth = `${r.width}px`;
      const w = el.offsetWidth, h = el.offsetHeight;
      const below = vh - r.bottom - offset, above = r.top - offset;
      const up = h > below && above > below;
      el.style.maxHeight = `${Math.max(120, (up ? above : below) - 8)}px`;
      const top = up ? Math.max(8, r.top - offset - Math.min(h, above - 8)) : r.bottom + offset;
      let left = align === "end" ? r.right - w : r.left;
      left = Math.min(Math.max(8, left), vw - w - 8);
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      try { el.hidePopover?.(); } catch { /* already closed */ }
    };
  }, [open, matchWidth, align, offset]);
}

/** Spread on the layer element: `popover="manual"` where the Popover API exists, nothing elsewhere (so it stays visible). */
export const layerAttrs: Record<string, string> =
  typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype ? { popover: "manual" } : {};
