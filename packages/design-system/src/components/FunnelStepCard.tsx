import * as React from "react";
import { cx } from "./cx";
import { Heading, type HeadingLevel } from "./heading";
import { Card } from "./Card";
import { StatusBadge, type Status } from "./StatusBadge";
import type { CategoryColor } from "./WorkspaceTile";
import { FormGlyph, MailGlyph, PageGlyph, SignalGlyph, StoreGlyph } from "./icons";

export type StepType = "traffic" | "page" | "form" | "email" | "marketplace";

/** Each step type has one fixed category color, everywhere it appears. */
export const stepTypes: Record<StepType, { label: string; color: CategoryColor; Glyph: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement }> = {
  traffic: { label: "Traffic source", color: "cat-3", Glyph: SignalGlyph },
  page: { label: "Web page", color: "cat-1", Glyph: PageGlyph },
  form: { label: "Claim form", color: "cat-4", Glyph: FormGlyph },
  email: { label: "Email", color: "cat-6", Glyph: MailGlyph },
  marketplace: { label: "Marketplace", color: "cat-7", Glyph: StoreGlyph },
};


export interface FunnelStepCardProps {
  type: StepType;
  /** Position in the funnel, shown as "01". */
  step: number;
  title: string;
  /** What happens at this step, with the arrow notation: "Card number + browse professionals → booking". */
  description?: string;
  status: Status;
  /** Screenshot of the page or email, shown on the always-light embed surface. Without one, a quiet placeholder shows the step type. */
  preview?: string;
  /** Short note in the footer ("Double-click to open draft", "Not built yet"). */
  hint?: string;
  selected?: boolean;
  onOpen?: () => void;
  /** fluid: grow to share the row with the other steps (min 192px). Default: fixed 224px, for canvases. */
  fluid?: boolean;
  /** Heading level of the title, so it fits the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** One step on the Funnel Studio canvas: order, type, status, preview and what the step does. */
export function FunnelStepCard({ type, step, title, description, status, preview, hint, selected, onOpen, fluid, headingLevel = 3, className }: FunnelStepCardProps) {
  const t = stepTypes[type];
  return (
    <Card padding="none" stripe={t.color} selected={selected} interactive
      className={cx("flex flex-col", fluid ? "min-w-48 flex-1 basis-0" : "w-56 shrink-0", className)}>
      <div className="flex items-center gap-2 px-3 pt-4">
        <span className="font-mono text-data-sm text-ink-subtle tabular-nums">{String(step).padStart(2, "0")}</span>
        <span className="min-w-0 truncate text-label-sm text-ink-muted">{t.label}</span>
      </div>
      <button type="button" onClick={onOpen} onDoubleClick={onOpen} aria-label={`Open ${title}`}
        className={cx("mx-3 mt-3 block aspect-video overflow-hidden rounded-md",
          preview ? "border border-line bg-surface-embed" : "border border-dashed border-line-dashed bg-surface-sunken hover:border-line-strong")}>
        {preview
          ? <img src={preview} alt="" className="size-full object-cover object-top" />
          : (
            <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-subtle">
              <t.Glyph className="size-6" />
              <span className="text-caption">No preview yet</span>
            </span>
          )}
      </button>
      <div className="grid gap-1 px-3 pt-3">
        <Heading level={headingLevel} className="text-heading-sm text-ink">{title}</Heading>
        {description && <p className="text-body-sm text-ink-muted">{description}</p>}
      </div>
      <div className="mt-auto flex px-3 pt-3 pb-3.5">
        <StatusBadge status={status} size="sm" />
      </div>
      {hint && <p className="border-t border-line px-3 py-2 text-caption text-ink-subtle">{hint}</p>}
    </Card>
  );
}
