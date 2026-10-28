import * as React from "react";
import { cx } from "./cx";
import { Check } from "./icons";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** A yes/no choice inside a form ("Add me to the Founding Members wall"). */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, disabled, ...rest },
  ref,
) {
  const auto = React.useId();
  const cid = id ?? auto;
  return (
    <div className={cx("flex items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex size-4.5 shrink-0">
        <input
          ref={ref}
          id={cid}
          type="checkbox"
          disabled={disabled}
          className={cx(
            "peer size-4.5 cursor-pointer appearance-none rounded-xs border border-line-strong bg-surface",
            "transition-colors duration-fast checked:border-ink-brand checked:bg-ink-brand",
            "aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-45",
          )}
          {...rest}
        />
        <Check className="pointer-events-none absolute inset-0.5 hidden size-3.5 text-bg peer-checked:block" strokeWidth={3} />
      </span>
      {(label || description) && (
        <label htmlFor={cid} className={cx("grid gap-0.5", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
          {label && <span className={cx("text-body-md", disabled ? "text-ink-disabled" : "text-ink")}>{label}</span>}
          {description && <span className="text-body-sm text-ink-muted">{description}</span>}
        </label>
      )}
    </div>
  );
});
