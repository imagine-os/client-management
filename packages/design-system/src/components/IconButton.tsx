import * as React from "react";
import { cx } from "./cx";
import { buttonVariants, type ButtonVariant } from "./Button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: the accessible name, also shown as the native tooltip. */
  label: string;
  icon: React.ReactNode;
  variant?: Exclude<ButtonVariant, "danger">;
  size?: "sm" | "md";
  /** For toggles in toolbars (layout modes, sketch tools). */
  pressed?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = "ghost", size = "md", pressed, className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-md transition-colors duration-fast ease-standard",
        "disabled:cursor-not-allowed disabled:text-ink-disabled disabled:hover:bg-transparent",
        size === "sm" ? "size-8 [&_svg]:size-4" : "size-10 [&_svg]:size-5",
        buttonVariants[variant],
        pressed && "bg-surface-selected text-ink-brand",
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
