import { cx } from "@ds/components";

/** JAM Studio's mark for Swiss Grid: a solid blue square and the name, set in Archivo. Compact drops the name on phones. */
export function Wordmark({ name = "JAM Studio", compact = false }: { name?: string; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="size-5 shrink-0 bg-logo-mark" />
      <span className={cx("font-display text-heading-md text-logo-ink", compact && "max-sm:sr-only")}>{name}</span>
    </span>
  );
}
