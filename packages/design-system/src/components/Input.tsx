import * as React from "react";
import { cx } from "./cx";

export type ControlSize = "sm" | "md" | "lg";

/** Shared frame for inputs and selects: border, fill, focus ring on the frame, invalid state. */
export function controlFrame(size: ControlSize, invalid?: boolean, disabled?: boolean) {
  return cx(
    "flex items-center gap-2 rounded-md border bg-surface text-ink transition-colors duration-fast ease-standard",
    // Only the field itself lights the frame, so a button inside (clear, unit picker) keeps its own single ring.
    "has-[:is(input,select,textarea):focus-visible]:outline-2 has-[:is(input,select,textarea):focus-visible]:outline-offset-2 has-[:is(input,select,textarea):focus-visible]:outline-focus",
    invalid ? "border-danger" : "border-line-strong",
    disabled && "cursor-not-allowed bg-surface-sunken text-ink-disabled",
    size === "sm" && "h-8 px-2.5 text-body-sm",
    size === "md" && "h-10 px-3 text-body-md",
    size === "lg" && "h-12 px-4 text-body-lg",
    "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-subtle",
  );
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: ControlSize;
  invalid?: boolean;
  /** Icon or text before the value (a search icon, "$"). */
  start?: React.ReactNode;
  /** Icon, unit or small button after the value ("mi", a clear button). */
  end?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", invalid, start, end, className, disabled, ...rest },
  ref,
) {
  return (
    <div className={cx(controlFrame(size, invalid, disabled), className)}>
      {start}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-subtle focus-visible:outline-none disabled:cursor-not-allowed"
        {...rest}
      />
      {end}
    </div>
  );
});
