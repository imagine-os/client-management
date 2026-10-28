import * as React from "react";
import { cx } from "./cx";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Shared input name. */
  name: string;
  /** Visible group label. */
  label: React.ReactNode;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

/** One choice from 2 to 5 visible options. More than 5: use Select. */
export function RadioGroup({ name, label, options, value, onChange, orientation = "vertical", className }: RadioGroupProps) {
  return (
    <fieldset className={cx("grid gap-2", className)}>
      <legend className="mb-2 text-label-md text-ink">{label}</legend>
      <div className={cx("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-6")}>
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          return (
            <div key={o.value} className="flex items-start gap-3">
              <input
                id={id}
                type="radio"
                name={name}
                value={o.value}
                checked={value === o.value}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
                className={cx(
                  "mt-0.5 size-4.5 shrink-0 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface",
                  "transition-[border-width,border-color] duration-fast checked:border-5 checked:border-ink-brand",
                  "disabled:cursor-not-allowed disabled:opacity-45",
                )}
              />
              <label htmlFor={id} className="grid cursor-pointer gap-0.5">
                <span className={cx("text-body-md", o.disabled ? "text-ink-disabled" : "text-ink")}>{o.label}</span>
                {o.description && <span className="text-body-sm text-ink-muted">{o.description}</span>}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
