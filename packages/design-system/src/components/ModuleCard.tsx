import * as React from "react";
import { cx } from "./cx";
import { Heading, type HeadingLevel } from "./heading";
import { Card } from "./Card";
import { Progress } from "./Progress";
import { StatusBadge, type Status } from "./StatusBadge";

export interface ModuleCardProps {
  title: string;
  status: Status;
  /** Version tag ("v3.46"). */
  version?: string;
  /** Screenshot of the module. Shown on surface-embed so light UIs read the same in both themes. */
  preview?: string;
  /** 0–100, with the stage word ("Building", "Planned"). */
  progress?: { value: number; label: string };
  /** The open action: usually a Button with variant="secondary" and an arrow. */
  action?: React.ReactNode;
  /** Pin / favorite toggle, top right. */
  pin?: React.ReactNode;
  selected?: boolean;
  /** Makes the title a button that selects the card (keyboard and mouse), e.g. to show it in the inspector. */
  onSelect?: () => void;
  /** Heading level of the title, so it fits the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** A module in the Workspace hub: status, version, live preview, open action and build progress. */
export function ModuleCard({ title, status, version, preview, progress, action, pin, selected, onSelect, headingLevel = 3, className }: ModuleCardProps) {
  return (
    <Card as="article" padding="none" interactive selected={selected} className={cx("flex w-60 flex-col", className)}>
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <StatusBadge status={status} size="sm" />
        <div className="flex items-center gap-1">
          {version && <span className="font-mono text-data-sm text-ink-subtle">{version}</span>}
          {pin}
        </div>
      </div>
      <div className="mx-3 mt-3 aspect-video overflow-hidden rounded-sm border border-line bg-surface-embed">
        {preview
          ? <img src={preview} alt="" className="size-full object-cover object-top" />
          : <div className="flex size-full items-center justify-center text-label-sm text-ink-on-embed opacity-60">No preview yet</div>}
      </div>
      <div className="grid flex-1 content-start gap-3 p-3">
        <Heading level={headingLevel} className="text-heading-sm text-ink">
          {onSelect
            ? <button type="button" onClick={onSelect} aria-pressed={selected} className="-my-0.5 rounded-xs py-0.5 text-left hover:underline">{title}</button>
            : title}
        </Heading>
        {action}
      </div>
      {progress && (
        <div className="border-t border-line px-3 py-2.5">
          <Progress value={progress.value} label={progress.label} valueText={`${progress.value}% est.`} />
        </div>
      )}
    </Card>
  );
}
