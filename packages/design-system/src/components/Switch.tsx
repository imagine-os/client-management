import * as React from "react";
import { cx } from "./cx";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Visible label. Without it, pass aria-label. */
  label?: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
}

/** An instant on/off setting (Typewriter, Use Hub pointer, Highlight edits). For choices saved with a form, use Checkbox. */
export function Switch({ checked, onChange, label, description, disabled, className, id, ...rest }: SwitchProps) {
  const auto = React.useId();
  const sid = id ?? auto;
  const control = (
    <button
      id={sid}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-fast ease-standard",
        checked ? "bg-ink-brand" : "bg-line-strong",
        "disabled:cursor-not-allowed disabled:opacity-45",
        !label && className,
      )}
      {...rest}
    >
      <span className={cx("size-5 rounded-full bg-white shadow-xs transition-transform duration-fast ease-standard",
        checked ? "translate-x-5.5" : "translate-x-0.5")} />
    </button>
  );
  if (!label) return control;
  return (
    <div className={cx("flex items-start gap-3", className)}>
      {control}
      <label htmlFor={sid} className="grid gap-0.5 pt-0.5">
        <span className="text-label-md text-ink">{label}</span>
        {description && <span className="text-body-sm text-ink-muted">{description}</span>}
      </label>
    </div>
  );
}
