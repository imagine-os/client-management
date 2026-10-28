"use client";
import { Avatar, Menu, cx } from "@ds/components";
import { Check, Flag, UserRound } from "lucide-react";
import * as React from "react";
import { shortDate, type ClientTask, type TaskPriority, type TaskStatus } from "@/lib/clients";
import { isOverdue, people, priorities, priorityName, statusName, statusOf, statuses } from "@/lib/tasks";

/*
 * The small pieces every task view shares: the status mark, the status, priority and assignee pickers, the due date
 * and the tick. Each picker is a menu on a 44px target, so a task can be changed in place from any view.
 */

/** Where a task stands, drawn: an empty ring, a half ring, a dashed ring, a filled check. */
export function StatusMark({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span aria-hidden="true" className={cx("grid size-4 shrink-0 place-items-center rounded-full border-2",
      status === "todo" && "border-line-strong",
      status === "doing" && "border-ink-brand bg-highlight",
      status === "review" && "border-dashed border-warning",
      status === "done" && "border-ink bg-ink text-bg", className)}>
      {status === "done" && <Check className="size-3" strokeWidth={3} />}
    </span>
  );
}

const trigger = "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-label-sm text-ink-muted hover:bg-surface-hover hover:text-ink sm:min-h-8";

export function StatusMenu({ task, label, onPick, compact = false }: { task: ClientTask; label: string; onPick: (s: TaskStatus) => void; compact?: boolean }) {
  const s = statusOf(task);
  return (
    <Menu align="start" header={<span className="text-caption text-ink-subtle">Status</span>}
      items={statuses.map((x) => ({ label: x.name, icon: <StatusMark status={x.id} />, checked: s === x.id, onSelect: () => onPick(x.id) }))}
      trigger={
        <button type="button" aria-label={`${label}: ${statusName(s)}. Change status`} className={trigger}>
          <StatusMark status={s} />{!compact && <span className="whitespace-nowrap">{statusName(s)}</span>}
        </button>
      } />
  );
}

const flagTone: Record<TaskPriority, string> = { urgent: "text-danger", high: "text-warning", normal: "text-ink-brand", low: "text-ink-subtle" };
export function PriorityFlag({ priority, className }: { priority?: TaskPriority; className?: string }) {
  return <Flag aria-hidden="true" className={cx("size-4 shrink-0", priority ? flagTone[priority] : "text-ink-disabled", priority === "urgent" && "fill-current", className)} />;
}

export function PriorityMenu({ task, label, onPick, compact = false }: { task: ClientTask; label: string; onPick: (p: TaskPriority | undefined) => void; compact?: boolean }) {
  return (
    <Menu align="start" header={<span className="text-caption text-ink-subtle">Priority</span>}
      items={[...priorities.map((p) => ({ label: p.name, icon: <PriorityFlag priority={p.id} />, checked: task.priority === p.id, onSelect: () => onPick(p.id) })), "separator" as const, { label: "No priority", icon: <PriorityFlag />, checked: !task.priority, onSelect: () => onPick(undefined) }]}
      trigger={
        <button type="button" aria-label={`${label}: ${priorityName(task.priority)}. Change priority`} className={trigger}>
          <PriorityFlag priority={task.priority} />{!compact && <span className="whitespace-nowrap">{task.priority ? priorityName(task.priority) : "Priority"}</span>}
        </button>
      } />
  );
}

/** Who's on a task: their avatar, and a menu to hand it to someone else. */
export function Assignee({ owner, task, onPick, compact = false }: { owner?: string; task: string; onPick: (owner: string | undefined) => void; compact?: boolean }) {
  const who = people.find((p) => p.id === owner);
  return (
    <Menu align="end" header={<span className="text-caption text-ink-subtle">Assign to</span>}
      items={[...people.map((p) => ({ label: p.name, description: p.sub, icon: <Avatar name={p.name} size="sm" />, checked: owner === p.id, onSelect: () => onPick(p.id) })), "separator" as const, { label: "Nobody", icon: <UserRound />, checked: !owner, onSelect: () => onPick(undefined) }]}
      trigger={
        <button type="button" aria-label={`${task}: assigned to ${who?.name ?? "nobody"}. Change`} className="inline-flex min-h-11 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-label-sm text-ink-muted hover:bg-surface-hover hover:text-ink sm:min-h-8">
          {who ? <Avatar name={who.name} size="sm" /> : <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border border-dashed border-line-strong"><UserRound className="size-3.5" /></span>}
          <span className={cx(compact ? "sr-only" : "max-sm:sr-only")}>{who?.name ?? "Assign"}</span>
        </button>
      } />
  );
}

/** "Oct 30", red once it's late; "No date" when there's none. */
export function DueLabel({ task, className }: { task: ClientTask; className?: string }) {
  if (!task.due) return <span className={cx("text-caption text-ink-subtle", className)}>No date</span>;
  const late = isOverdue(task);
  return <span className={cx("text-caption whitespace-nowrap tabular-nums", late ? "font-semibold text-danger" : "text-ink-subtle", className)}>{late ? "Overdue · " : ""}{shortDate(task.due)}</span>;
}

/** Subtasks done out of all, when there are any. */
export function SubtaskCount({ task }: { task: ClientTask }) {
  if (!task.subtasks?.length) return null;
  const done = task.subtasks.filter((s) => s.done).length;
  return <span className="text-caption text-ink-subtle tabular-nums" aria-label={`${done} of ${task.subtasks.length} subtasks done`}>{done}/{task.subtasks.length}</span>;
}

/** A to-do that toggles with one tap anywhere on its row: a 24px check and the words, the whole line the target. */
export function Tick({ label, done, onToggle }: { label: string; done: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={done} onClick={onToggle}
      className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-left transition-colors duration-fast hover:bg-surface-hover">
      <span aria-hidden="true" className={cx("grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors duration-fast", done ? "border-ink bg-ink text-bg" : "border-line-strong")}>
        {done && <Check className="size-4" />}
      </span>
      <span className={cx("min-w-0 text-body-md", done ? "text-ink-subtle line-through" : "text-ink")}>{label}</span>
    </button>
  );
}

/** Persists a small piece of view state per browser (the chosen view, grouping, sort). */
export function useStored<T>(key: string, initial: T) {
  const [v, setV] = React.useState<T>(initial);
  React.useEffect(() => { try { const raw = localStorage.getItem(key); if (raw) setV({ ...initial, ...JSON.parse(raw) }); } catch { /* ignore */ } }, [key]); // eslint-disable-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  const set = React.useCallback((next: T) => { setV(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ } }, [key]);
  return [v, set] as const;
}
