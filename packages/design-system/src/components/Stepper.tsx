import * as React from "react";
import { cx } from "./cx";
import { Check } from "./icons";

export interface StepperProps {
  /** Step names, short: Details, Skills, Availability, Preview. */
  steps: string[];
  /** 0-based index of the current step. Earlier steps show as done. */
  current: number;
  /** Lets people jump back to a finished step. */
  onStepClick?: (index: number) => void;
  className?: string;
}

/** Shows where someone is in a multi-step flow (the four-step profile builder). Not for navigation between unrelated pages. */
export function Stepper({ steps, current, onStepClick, className }: StepperProps) {
  return (
    <ol className={cx("flex w-full items-start", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const now = i === current;
        const dot = (
          <span
            className={cx(
              "relative z-raised inline-flex size-8 items-center justify-center rounded-full border-2 text-label-sm transition-colors duration-fast",
              done && "border-ink-brand bg-ink-brand text-bg",
              now && "border-ink-brand bg-surface text-ink-brand",
              !done && !now && "border-line-strong bg-surface text-ink-muted",
            )}
          >
            {done ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
          </span>
        );
        return (
          <li key={label} aria-current={now ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className={cx("absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2", i <= current ? "bg-ink-brand" : "bg-line")} />
            )}
            {done && onStepClick
              ? <button type="button" onClick={() => onStepClick(i)} aria-label={`Back to ${label}`} className="rounded-full">{dot}</button>
              : dot}
            <span className={cx("text-center text-label-sm", now ? "text-ink" : "text-ink-muted")}>
              {label}
              {done && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
