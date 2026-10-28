import * as React from "react";
import { cx } from "./cx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** Shows "used / max" under the field when maxLength is set. */
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, showCount, className, maxLength, rows = 4, onChange, value, defaultValue, ...rest },
  ref,
) {
  const [len, setLen] = React.useState(String(value ?? defaultValue ?? "").length);
  return (
    <div className="grid gap-1">
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={invalid || undefined}
        onChange={(e) => { setLen(e.target.value.length); onChange?.(e); }}
        className={cx(
          "w-full resize-y rounded-md border bg-surface px-3 py-2.5 text-body-md text-ink placeholder:text-ink-subtle",
          "transition-colors duration-fast ease-standard disabled:cursor-not-allowed disabled:bg-surface-sunken",
          invalid ? "border-danger" : "border-line-strong",
          className,
        )}
        {...rest}
      />
      {showCount && maxLength && (
        <span className="justify-self-end font-mono text-data-sm text-ink-subtle tabular-nums">{len} / {maxLength}</span>
      )}
    </div>
  );
});
