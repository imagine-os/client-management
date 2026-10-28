import * as React from "react";
import { cx } from "./cx";
import { layerAttrs, useAnchoredLayer } from "./layer";

export interface PopoverProps {
  /** A Button or IconButton that opens the panel. */
  trigger: React.ReactElement;
  /** Names the panel for screen readers ("Appearance"). */
  label: string;
  /** Optional heading inside the panel. */
  title?: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  /** Panel width. */
  width?: "sm" | "md" | "lg";
  /** Controlled open state. Omit to let the popover manage itself. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Starts open. For documentation and tests. */
  defaultOpen?: boolean;
  className?: string;
}

const widths = { sm: "w-64", md: "w-80", lg: "w-96" };

/** A small non-blocking panel of settings or details anchored to a button: Appearance, Material box, Mouse & gestures. For a list of actions use Menu; for a blocking task use Modal. */
export function Popover({ trigger, label, title, children, align = "start", width = "md", open: controlled, onOpenChange, defaultOpen = false, className }: PopoverProps) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = controlled ?? inner;
  const setOpen = (v: boolean) => { if (controlled === undefined) setInner(v); onOpenChange?.(v); };
  const wrap = React.useRef<HTMLSpanElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const id = React.useId();
  useAnchoredLayer(open, triggerRef, panel, { align });

  React.useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const first = panel.current?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      (first ?? panel.current)?.focus();
    });
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const tp = (trigger as React.ReactElement<Record<string, unknown>>).props as { onClick?: (e: React.MouseEvent) => void };
  const t = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => { triggerRef.current = el; },
    "aria-expanded": open,
    "aria-controls": open ? id : undefined,
    "aria-haspopup": "dialog",
    onClick: (e: React.MouseEvent) => { tp.onClick?.(e); setOpen(!open); },
  });

  return (
    <span ref={wrap} className="relative inline-flex">
      {t}
      {open && (
        <div
          ref={panel}
          {...layerAttrs}
          id={id}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); triggerRef.current?.focus(); } }}
          className={cx(
            "absolute top-full z-popover mt-2 grid max-h-96 gap-3 overflow-auto rounded-lg border border-line bg-surface-raised p-4 text-ink shadow-md outline-none",
            widths[width],
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {title && <div className="text-heading-sm text-ink">{title}</div>}
          {children}
        </div>
      )}
    </span>
  );
}
