"use client";
import { Button, ConfirmDialog, Drawer, Field, IconButton, Input, Select, Textarea, useToast } from "@ds/components";
import { ArrowUpRight, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { uid, useClients, type Client, type TaskPriority, type TaskStatus } from "@/lib/clients";
import { people, priorities, statusOf, statuses, withStatus } from "@/lib/tasks";
import { Tick } from "./parts";

/*
 * A task opened from any view: everything about it in one panel on the right, edited in place. Changes save as you
 * make them (to this browser); moving it to another client closes the panel, since it becomes that client's task.
 */
export function TaskDrawer({ clients, open, onClose }: { clients: Client[]; open: { clientId: string; taskId: string } | null; onClose: () => void }) {
  const { updateTask, removeTask, moveTask } = useClients();
  const toast = useToast();
  const [confirm, setConfirm] = React.useState(false);
  const [sub, setSub] = React.useState("");
  // Keep the last task in the panel while it animates closed.
  const [last, setLast] = React.useState(open);
  React.useEffect(() => { if (open) setLast(open); }, [open]); // eslint-disable-line react-hooks/set-state-in-effect
  const target = open ?? last;
  const c = clients.find((x) => x.id === target?.clientId);
  const t = c?.tasks.find((x) => x.id === target?.taskId);
  if (!c || !t) return null;
  const set = (fn: Parameters<typeof updateTask>[2]) => updateTask(c.id, t.id, fn);
  const subtasks = t.subtasks ?? [];

  return (
    <>
      <Drawer side="right" size="md" open={!!open} onClose={onClose} title="Task" description={<Link href={`/?c=${c.id}`} className="inline-flex min-h-11 items-center gap-1 text-link underline-offset-2 hover:underline sm:min-h-6">{c.name}<ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>}
        footer={<div className="flex w-full items-center justify-between gap-2"><Button variant="ghost" iconStart={<Trash2 />} onClick={() => setConfirm(true)}>Delete task</Button><Button variant="secondary" onClick={onClose}>Done</Button></div>}>
        <div className="grid gap-5">
          <Field label="Name"><Input id="task-name" value={t.title} onChange={(e) => set((x) => ({ ...x, title: e.target.value }))} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status"><Select value={statusOf(t)} onValueChange={(v) => set((x) => withStatus(x, v as TaskStatus))} options={statuses.map((s) => ({ value: s.id, label: s.name }))} /></Field>
            <Field label="Priority"><Select value={t.priority ?? "none"} onValueChange={(v) => set((x) => ({ ...x, priority: v === "none" ? undefined : (v as TaskPriority) }))} options={[...priorities.map((p) => ({ value: p.id, label: p.name })), { value: "none", label: "No priority" }]} /></Field>
            <Field label="Assignee"><Select value={t.owner ?? "none"} onValueChange={(v) => set((x) => ({ ...x, owner: v === "none" ? undefined : v }))} options={[...people.map((p) => ({ value: p.id, label: p.name })), { value: "none", label: "Nobody" }]} /></Field>
            <Field label="Due date" optional><Input id="task-due" type="date" value={t.due ?? ""} onChange={(e) => set((x) => ({ ...x, due: e.target.value || undefined }))} /></Field>
          </div>
          <Field label="Client" hint="Moving a task hands it to that client's list.">
            <Select value={c.id} onValueChange={(v) => { moveTask(c.id, t.id, v); onClose(); toast({ message: `Moved to ${clients.find((x) => x.id === v)?.name}`, tone: "success" }); }} options={clients.map((x) => ({ value: x.id, label: x.name }))} />
          </Field>
          <Field label="Description" optional><Textarea id="task-desc" rows={4} value={t.description ?? ""} onChange={(e) => set((x) => ({ ...x, description: e.target.value || undefined }))} /></Field>

          <section aria-labelledby="sub-h" className="grid gap-2">
            <h3 id="sub-h" className="text-label-md text-ink">Subtasks {subtasks.length > 0 && <span className="text-ink-subtle tabular-nums">{subtasks.filter((s) => s.done).length}/{subtasks.length}</span>}</h3>
            {subtasks.length > 0 && (
              <ul className="grid">
                {subtasks.map((s) => (
                  <li key={s.id} className="flex items-center gap-1">
                    <div className="min-w-0 flex-1"><Tick label={s.title} done={s.done} onToggle={() => set((x) => ({ ...x, subtasks: (x.subtasks ?? []).map((y) => (y.id === s.id ? { ...y, done: !y.done } : y)) }))} /></div>
                    <IconButton label={`Remove subtask ${s.title}`} variant="ghost" size="sm" icon={<X />} onClick={() => set((x) => ({ ...x, subtasks: (x.subtasks ?? []).filter((y) => y.id !== s.id) }))} />
                  </li>
                ))}
              </ul>
            )}
            <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (!sub.trim()) return; set((x) => ({ ...x, subtasks: [...(x.subtasks ?? []), { id: uid(), title: sub.trim(), done: false }] })); setSub(""); }}>
              <Field label="Add a subtask" className="flex-1"><Input id="task-sub" value={sub} onChange={(e) => setSub(e.target.value)} /></Field>
              <Button type="submit" variant="secondary" iconStart={<Plus />}>Add</Button>
            </form>
          </section>
          <p className="text-caption text-ink-subtle">Changes save as you make them, in this browser.</p>
        </div>
      </Drawer>
      <ConfirmDialog open={confirm} onCancel={() => setConfirm(false)} title={`Delete “${t.title}”?`} description="It goes from this client's list and their portal. This can't be undone." confirmLabel="Delete task"
        onConfirm={() => { removeTask(c.id, t.id); setConfirm(false); onClose(); toast({ message: "Task deleted", tone: "success" }); }} />
    </>
  );
}
