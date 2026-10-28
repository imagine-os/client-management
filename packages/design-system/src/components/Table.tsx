import * as React from "react";
import { cx } from "./cx";
import { ChevronDown } from "./icons";

export interface Column<Row> {
  key: string;
  header: React.ReactNode;
  /** Renders the cell. Defaults to row[key]. */
  cell?: (row: Row) => React.ReactNode;
  align?: "start" | "end";
  /** Numbers: right-aligned, tabular. */
  numeric?: boolean;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Required caption for screen readers; shown visually only if showCaption. */
  caption: string;
  showCaption?: boolean;
  sort?: { key: string; direction: "asc" | "desc" };
  onSortChange?: (sort: { key: string; direction: "asc" | "desc" }) => void;
  onRowClick?: (row: Row) => void;
  selectedKey?: string;
  density?: "comfortable" | "compact";
  empty?: React.ReactNode;
  className?: string;
}

/** Rows of records with the same fields: people, campaigns, invitations, review queue. */
export function Table<Row>({
  columns, rows, rowKey, caption, showCaption, sort, onSortChange, onRowClick, selectedKey, density = "comfortable", empty, className,
}: TableProps<Row>) {
  const pad = density === "compact" ? "h-9 px-3" : "h-12 px-4";
  return (
    <div className={cx("overflow-x-auto rounded-lg border border-line bg-surface", className)}>
      <table className="w-full border-collapse text-left text-body-md">
        <caption className={showCaption ? "px-4 pt-4 pb-2 text-left text-heading-sm text-ink" : "sr-only"}>{caption}</caption>
        <thead className="sticky top-0 z-raised bg-surface-sunken">
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const end = c.align === "end" || c.numeric;
              return (
                <th key={c.key} scope="col" style={c.width ? { width: c.width } : undefined}
                  aria-sort={active ? (sort!.direction === "asc" ? "ascending" : "descending") : undefined}
                  className={cx("border-b border-line text-label-sm font-semibold text-ink-muted", pad, end && "text-right")}>
                  {c.sortable && onSortChange ? (
                    <button type="button"
                      onClick={() => onSortChange({ key: c.key, direction: active && sort!.direction === "asc" ? "desc" : "asc" })}
                      className={cx("-my-1 inline-flex items-center gap-1 rounded-xs py-1 hover:text-ink", end && "flex-row-reverse")}>
                      {c.header}
                      <ChevronDown className={cx("size-3.5 transition-transform", !active && "opacity-0", active && sort!.direction === "asc" && "rotate-180")} />
                    </button>
                  ) : c.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-body-md text-ink-muted">{empty ?? "Nothing here yet."}</td></tr>
          )}
          {rows.map((r) => {
            const k = rowKey(r);
            return (
              <tr key={k}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(r); } } : undefined}
                aria-selected={selectedKey !== undefined ? selectedKey === k : undefined}
                className={cx(
                  "border-b border-line last:border-b-0",
                  onRowClick && "cursor-pointer hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:-outline-offset-2",
                  selectedKey === k && "bg-surface-selected",
                )}>
                {columns.map((c) => (
                  <td key={c.key} className={cx(pad, "text-ink", (c.align === "end" || c.numeric) && "text-right", c.numeric && "font-mono text-data-md tabular-nums")}>
                    {c.cell ? c.cell(r) : String((r as Record<string, unknown>)[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
