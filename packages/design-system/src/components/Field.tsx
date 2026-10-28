import * as React from "react";
import { cx } from "./cx";

export interface FieldProps {
  label: React.ReactNode;
  /** Help text under the control. Replaced by the error when there is one. */
  hint?: React.ReactNode;
  /** Says what went wrong and how to fix it. Marks the control invalid. */
  error?: React.ReactNode;
  /** Adds "Optional" after the label. Required is the default; don't mark it. */
  optional?: boolean;
  /** Exactly one form control: Input, Textarea or Select. */
  children: React.ReactElement;
  className?: string;
}

/** Wraps one control with its label and help or error text, and wires the ids and aria attributes. */
export function Field({ label, hint, error, optional, children, className }: FieldProps) {
  const auto = React.useId();
  const id = (children.props as { id?: string }).id ?? auto;
  const noteId = `${id}-note`;
  const note = error ?? hint;
  const control = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    id,
    invalid: Boolean(error) || undefined,
    "aria-describedby": note ? noteId : undefined,
  });
  return (
    <div className={cx("grid gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-label-md text-ink">
        {label}
        {optional && <span className="text-body-sm font-normal text-ink-subtle">Optional</span>}
      </label>
      {control}
      {note && (
        <p id={noteId} className={cx("text-body-sm", error ? "text-danger" : "text-ink-muted")}>{note}</p>
      )}
    </div>
  );
}
