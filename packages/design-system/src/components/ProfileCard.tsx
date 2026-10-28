import * as React from "react";
import { cx } from "./cx";
import { Tag } from "./Tag";
import { initials } from "./Avatar";
import { Heading, type HeadingLevel } from "./heading";

export interface ProfileCardProps {
  name: string;
  /** Service area ("Costume & wardrobe"). */
  specialty: string;
  /** One sentence in the professional's voice. */
  summary: string;
  /** Portrait. Without one, the initials stand in. */
  photo?: string;
  tags?: string[];
  /** Neighborhood and distance: "Silver Lake · 3 miles away". */
  location?: string;
  /** "Available this week". */
  availability?: string;
  /** Starting hourly rate in dollars. */
  rate?: number;
  /** View profile Button. */
  action: React.ReactNode;
  /** Save toggle. */
  save?: React.ReactNode;
  /** Marks fictional sample profiles. */
  sample?: boolean;
  /** Heading level of the title, so it fits the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** A professional in search results: photo, specialty, what they do, where, when and from how much. Stacks on narrow screens. */
export function ProfileCard({ name, specialty, summary, photo, tags, location, availability, rate, action, save, sample, headingLevel = 3, className }: ProfileCardProps) {
  return (
    <article className={cx("flex flex-col gap-4 rounded-lg border border-line bg-surface p-3 shadow-sm sm:flex-row", className)}>
      {photo
        ? <img src={photo} alt={name} className="aspect-video w-full shrink-0 rounded-md object-cover sm:aspect-4/3 sm:w-60 sm:self-start" />
        : <div aria-hidden="true" className="flex aspect-video w-full shrink-0 items-center justify-center rounded-md bg-surface-selected font-display text-display-sm text-ink-brand sm:aspect-4/3 sm:w-60 sm:self-start">{initials(name)}</div>}
      <div className="grid min-w-0 flex-1 content-start gap-1.5 py-1">
        <div className="flex items-center gap-2">
          <Heading level={headingLevel} className="font-display text-heading-lg text-ink">{name}</Heading>
          {sample && <span className="text-caption text-ink-subtle">Sample</span>}
        </div>
        <p className="text-label-md text-ink-brand">{specialty}</p>
        <p className="max-w-prose text-body-md text-ink-muted">{summary}</p>
        {tags && tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1.5">{tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>}
        {(location || availability) && (
          <p className="mt-1 flex flex-wrap gap-x-4 text-body-sm text-ink-muted">
            {location && <span>{location}</span>}
            {availability && <span className="text-success">{availability}</span>}
          </p>
        )}
      </div>
      <div className="flex flex-row items-end justify-between gap-3 sm:flex-col sm:items-end">
        {save}
        <div className="grid justify-items-start gap-2 sm:mt-auto sm:justify-items-end">
          {rate !== undefined && (
            <p className="grid sm:justify-items-end">
              <span className="text-caption text-ink-subtle">From</span>
              <span className="font-display text-display-sm text-ink tabular-nums">${rate}<span className="text-body-md text-ink-muted">/hr</span></span>
            </p>
          )}
          {action}
        </div>
      </div>
    </article>
  );
}
