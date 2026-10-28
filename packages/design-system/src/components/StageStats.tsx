import * as React from "react";
import { cx } from "./cx";
import { Heading, type HeadingLevel } from "./heading";

export interface Stage {
  label: string;
  /** null shows a dash: the stage exists but nothing is measured yet. */
  value: number | null;
  /** Highlights stages that need someone's action ("Submitted", "Changes requested"). */
  attention?: boolean;
}

export interface StageStatsProps {
  /** Short heading on the left ("Stage statistics"). */
  title: string;
  stages: Stage[];
  /** Heading level of the title, so it fits the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** Counts per stage of a pipeline, left to right: Invited → Signed in → Draft → Submitted → Approved → In gallery. */
export function StageStats({ title, stages, headingLevel = 3, className }: StageStatsProps) {
  return (
    <section className={cx("grid gap-3 rounded-lg border border-line bg-surface p-4 lg:flex lg:items-center lg:gap-6", className)}>
      <Heading level={headingLevel} className="shrink-0 text-heading-sm text-ink">{title}</Heading>
      <ol className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
        {stages.map((s) => (
          <li key={s.label} className={cx("grid min-w-0 flex-1 gap-0.5 rounded-md px-3 py-2.5", s.attention ? "bg-warning-soft" : "bg-surface-sunken")}>
            <span className="truncate text-label-sm text-ink-muted">{s.label}</span>
            <span className="font-display text-heading-lg text-ink tabular-nums">{s.value === null ? "—" : s.value.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
