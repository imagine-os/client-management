import * as React from "react";
import { cx } from "./cx";
import { Heading, type HeadingLevel } from "./heading";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** raised: on the page ground, with shadow. flat: inside a panel, hairline only. sunken: a recessed well. */
  variant?: "raised" | "flat" | "sunken";
  /** Selected or featured: focus-color outline plus glow. One per view. */
  selected?: boolean;
  /** Adds hover feedback. Put the real link or button inside; don't make the div clickable. */
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  /** Category stripe color along the top edge (funnel step types). */
  stripe?: "cat-1" | "cat-2" | "cat-3" | "cat-4" | "cat-5" | "cat-6" | "cat-7" | "cat-8";
  as?: "div" | "article" | "section" | "li";
}

const pads = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };
const stripes = {
  "cat-1": "before:bg-cat-1", "cat-2": "before:bg-cat-2", "cat-3": "before:bg-cat-3", "cat-4": "before:bg-cat-4",
  "cat-5": "before:bg-cat-5", "cat-6": "before:bg-cat-6", "cat-7": "before:bg-cat-7", "cat-8": "before:bg-cat-8",
};

/** The one container for grouped content. Panels, module cards and profile cards all start here. */
export function Card({ variant = "raised", selected, interactive, padding = "md", stripe, as: Tag = "div", className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cx(
        "relative overflow-hidden rounded-lg border text-ink",
        variant === "raised" && "border-line bg-surface shadow-sm",
        variant === "flat" && "border-line bg-surface",
        variant === "sunken" && "border-transparent bg-surface-sunken",
        interactive && "transition-[border-color,box-shadow] duration-fast ease-standard hover:border-line-strong",
        selected && "border-2 border-focus shadow-glow",
        stripe && "before:absolute before:inset-x-0 before:top-0 before:h-0.75",
        stripe && stripes[stripe],
        pads[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export interface CardHeaderProps {
  title: React.ReactNode;
  /** Eyebrow above the title (type, category). */
  kicker?: React.ReactNode;
  description?: React.ReactNode;
  /** Actions or a badge on the right. */
  aside?: React.ReactNode;
  /** Heading level of the title, so it fits the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  className?: string;
}

export function CardHeader({ title, kicker, description, aside, headingLevel = 3, className }: CardHeaderProps) {
  return (
    <div className={cx("flex items-start justify-between gap-3", className)}>
      <div className="grid min-w-0 gap-1">
        {kicker && <span className="text-eyebrow text-ink-brand uppercase">{kicker}</span>}
        <Heading level={headingLevel} className="text-heading-md text-ink">{title}</Heading>
        {description && <p className="text-body-sm text-ink-muted">{description}</p>}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
    </div>
  );
}
