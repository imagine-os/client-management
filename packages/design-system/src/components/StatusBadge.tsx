import * as React from "react";
import { Badge, type BadgeProps, type BadgeTone } from "./Badge";

export type Status =
  | "draft" | "not-started" | "working" | "preview" | "needs-review"
  | "changes-requested" | "approved" | "published" | "live" | "archived";

export const statusMeta: Record<Status, { label: string; tone: BadgeTone }> = {
  "draft": { label: "Draft", tone: "warning" },
  "not-started": { label: "Not started", tone: "neutral" },
  "working": { label: "Working", tone: "info" },
  "preview": { label: "Preview", tone: "info" },
  "needs-review": { label: "Needs review", tone: "warning" },
  "changes-requested": { label: "Changes requested", tone: "warning" },
  "approved": { label: "Approved", tone: "success" },
  "published": { label: "Published", tone: "success" },
  "live": { label: "Live", tone: "success" },
  "archived": { label: "Archived", tone: "neutral" },
};

export interface StatusBadgeProps extends Omit<BadgeProps, "tone" | "children"> {
  status: Status;
}

/** The product's fixed status vocabulary, each word always in the same color. */
export function StatusBadge({ status, ...rest }: StatusBadgeProps) {
  const m = statusMeta[status];
  return <Badge tone={m.tone} {...rest}>{m.label}</Badge>;
}
