import * as React from "react";
import { cx } from "./cx";
import { Spinner } from "./icons";

export type ButtonVariant = "primary" | "strong" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = the one mint action per view; strong = decisive step in a flow; secondary = outline; ghost = toolbar; danger = destructive. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label (16px). */
  iconStart?: React.ReactNode;
  /** Icon after the label, e.g. an arrow for links that leave the page. */
  iconEnd?: React.ReactNode;
  /** Shows a spinner, keeps the label, and blocks clicks. */
  loading?: boolean;
  fullWidth?: boolean;
}

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-action text-on-action hover:bg-action-hover",
  strong: "bg-action-strong text-on-action-strong hover:bg-action-strong-hover",
  secondary: "border border-line-strong text-ink hover:bg-surface-hover",
  ghost: "text-ink hover:bg-surface-hover",
  danger: "bg-action-danger text-on-action-danger hover:opacity-90",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 gap-1.5 text-label-sm",
  md: "h-10 px-4 gap-2 text-label-md",
  lg: "h-12 px-5 gap-2 text-label-md",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", iconStart, iconEnd, loading = false, fullWidth, disabled, className, children, type = "button", onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-md font-sans whitespace-nowrap select-none",
        "transition-colors duration-fast ease-standard [&_svg]:size-4 [&_svg]:shrink-0",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-sunken disabled:text-ink-disabled disabled:hover:opacity-100",
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && "w-full",
        loading && "cursor-progress",
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : iconStart}
      {children}
      {iconEnd}
    </button>
  );
});
