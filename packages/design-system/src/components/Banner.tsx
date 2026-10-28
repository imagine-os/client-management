import * as React from "react";
import { cx } from "./cx";
import { Alert, CheckCircle, Close, Info, XCircle } from "./icons";

export type BannerTone = "info" | "success" | "warning" | "danger";

export interface BannerProps {
  tone?: BannerTone;
  /** inline: a rounded notice inside content. strip: a full-width band at the top of a page ("Draft · not public"). */
  layout?: "inline" | "strip";
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Links or a small button on the right. */
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const tone = {
  info: { bg: "bg-info-soft", fg: "text-info", Icon: Info },
  success: { bg: "bg-success-soft", fg: "text-success", Icon: CheckCircle },
  warning: { bg: "bg-warning-soft", fg: "text-warning", Icon: Alert },
  danger: { bg: "bg-danger-soft", fg: "text-danger", Icon: XCircle },
};

/** A message about the page or a section that stays until it is resolved. For a passing confirmation use a Toast. */
export function Banner({ tone: t = "info", layout = "inline", title, children, action, onDismiss, className }: BannerProps) {
  const { bg, fg, Icon } = tone[t];
  return (
    <div
      role={t === "danger" ? "alert" : "status"}
      className={cx(
        "flex items-start gap-3 text-body-sm text-ink",
        bg,
        layout === "inline" ? "rounded-lg p-3 pr-2" : "px-4 py-2",
        className,
      )}
    >
      <Icon className={cx("mt-px size-4 shrink-0", fg)} />
      <div className={cx("min-w-0 flex-1", layout === "strip" && "flex flex-wrap items-baseline gap-x-2")}>
        {title && <strong className="font-semibold">{title}</strong>}
        {children && <span className={cx(layout === "inline" && Boolean(title) && "mt-0.5 block text-ink-muted")}>{children}</span>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss"
          className="-my-1 inline-flex size-6 shrink-0 items-center justify-center rounded-sm hover:bg-surface-hover [&_svg]:size-4">
          <Close />
        </button>
      )}
    </div>
  );
}
