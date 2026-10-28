import * as React from "react";
import { cx } from "./cx";
import { CheckCircle, Close, Info, XCircle } from "./icons";

export interface ToastOptions {
  /** Past tense, says what happened: "Changes saved", "Material change undone". */
  message: React.ReactNode;
  tone?: "neutral" | "success" | "danger";
  /** One short action, usually Undo. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it leaves. Toasts with an action stay at least 6 seconds. */
  duration?: number;
}

interface ToastItem extends ToastOptions { id: number }

const ToastContext = React.createContext<((t: ToastOptions) => void) | null>(null);

/** Returns show(toast). Requires a ToastProvider above. */
export function useToast() {
  const show = React.useContext(ToastContext);
  if (!show) throw new Error("useToast needs a <ToastProvider> above it.");
  return show;
}

const icons = { neutral: Info, success: CheckCircle, danger: XCircle };
const iconColor = { neutral: "text-ink-muted", success: "text-success", danger: "text-danger" };

/** A single toast, without the queue. Use directly only in previews and tests. */
export function Toast({ message, tone = "neutral", action, onDismiss }: ToastOptions & { onDismiss?: () => void }) {
  const Icon = icons[tone];
  return (
    <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-line bg-surface-raised py-2.5 pr-2 pl-3.5 text-body-sm text-ink shadow-md">
      <Icon className={cx("size-4 shrink-0", iconColor[tone])} />
      <span className="min-w-0 flex-1">{message}</span>
      {action && (
        <button type="button" onClick={action.onClick}
          className="shrink-0 rounded-sm px-2 py-1 text-label-sm text-link underline underline-offset-2 hover:bg-surface-hover">
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-ink-muted hover:bg-surface-hover [&_svg]:size-4">
          <Close />
        </button>
      )}
    </div>
  );
}

/** Holds the toast queue and the live region. Mount once near the app root. Toasts stack bottom-right. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const remove = React.useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const show = React.useCallback((t: ToastOptions) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs.slice(-2), { ...t, id }]);
    const ms = Math.max(t.duration ?? 4000, t.action ? 6000 : 0);
    window.setTimeout(() => remove(id), ms);
  }, [remove]);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-toast grid w-full max-w-sm justify-items-end gap-2">
        {items.map((t) => (
          <Toast key={t.id} {...t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
