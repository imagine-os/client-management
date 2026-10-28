import * as React from "react";
import { cx } from "./cx";
import { Close } from "./icons";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons, right-aligned. Primary action last. */
  footer?: React.ReactNode;
  /** center: a dialog. left / right: a drawer along that edge (navigation, inspector on small screens). */
  placement?: "center" | "left" | "right";
  size?: "sm" | "md" | "lg";
}

const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-3xl" };

/** A focused task that blocks the page until done or dismissed. Built on the native <dialog>, so focus trapping, Escape and the top layer come from the browser. */
export function Modal({ open, onClose, title, description, children, footer, placement = "center", size = "md" }: ModalProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className={cx(
        "m-0 border-0 bg-transparent p-0 text-ink backdrop:bg-scrim",
        placement === "center" && "fixed inset-4 m-auto h-fit max-h-full w-auto " + widths[size],
        placement === "right" && "fixed inset-y-0 right-0 left-auto h-dvh max-h-dvh w-full " + widths[size],
        placement === "left" && "fixed inset-y-0 left-0 right-auto h-dvh max-h-dvh w-full " + widths[size],
      )}
    >
      <div
        className={cx(
          "flex flex-col bg-surface-raised shadow-lg",
          placement === "center" && "max-h-full rounded-xl",
          placement === "right" && "h-full rounded-l-xl",
          placement === "left" && "h-full rounded-r-xl",
        )}
      >
        <header className="flex items-start gap-4 p-6 pb-4">
          <div className="grid flex-1 gap-1.5">
            <h2 id={titleId} className="text-heading-lg text-ink">{title}</h2>
            {description && <p id={descId} className="text-body-md text-ink-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="-mt-1 -mr-2 inline-flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-hover hover:text-ink [&_svg]:size-5">
            <Close />
          </button>
        </header>
        {children && <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>}
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </dialog>
  );
}
