"use client";
import { Button, Field, Input, Modal, Select, Skeleton, useToast } from "@ds/components";
import { Bookmark, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { uid, useClients, type TaskPriority, type TaskStatus } from "@/lib/clients";
import { scoped, useTeam } from "@/lib/team";
import { applyFilters, noFilters, people, presets, priorities, rowsOf, statuses, withStatus } from "@/lib/tasks";
import { MainNav, Shell, SideLink, SideSection } from "./Shell";
import { TaskViews } from "./tasks/TaskViews";

/*
 * /tasks/: every client's tasks in one place, like a project tool's "Everything" view. Saved views in the left bar
 * (?saved=week) start the list with their filters; List, Board, Table and Calendar show the same tasks.
 */
export function TasksPage() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const team = useTeam();
  const { clients: everyone, ready, addTask } = useClients();
  const clients = scoped(everyone, team.id);
  const saved = presets.find((p) => p.id === params.get("saved")) ?? presets[0];
  const preset = React.useMemo(() => ({ filters: saved.filters, group: saved.group }), [saved]);
  const [creating, setCreating] = React.useState(false);
  const open = rowsOf(clients).filter((r) => !r.task.done).length;

  const sidebar = (
    <>
      <MainNav active="tasks" clients={clients.length} tasks={open} />
      <SideSection title="Saved views">
        {presets.map((p) => <SideLink key={p.id} href={p.id === "open" ? "/tasks/" : `/tasks/?saved=${p.id}`} label={p.name} icon={<Bookmark />} active={saved.id === p.id}
          count={applyFilters(rowsOf(clients), { ...noFilters, ...p.filters }).length} />)}
      </SideSection>
    </>
  );
  const commands = [
    { id: "new-task", label: "New task", group: "Actions", icon: <Plus />, onRun: () => setCreating(true) },
    ...presets.map((p) => ({ id: `saved-${p.id}`, label: p.name, group: "Saved views", icon: <Bookmark />, onRun: () => router.push(p.id === "open" ? "/tasks/" : `/tasks/?saved=${p.id}`) })),
  ];

  return (
    <Shell sidebar={sidebar} sidebarTitle="Tasks" commands={commands} status={<><span>{open} open tasks across {clients.length} clients</span><span className="max-sm:hidden">Kept in this browser</span></>}>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-eyebrow text-ink-brand uppercase">{saved.id === "open" ? "Every client" : "Saved view"}</p>
            <h1 className="font-display text-display-md text-ink">{saved.id === "open" ? "Tasks" : saved.name}</h1>
            <p className="max-w-2xl text-body-md text-ink-muted">Everything we and our clients have to do. Switch views, filter and group; open a task for its details and subtasks.</p>
          </div>
          <Button variant="primary" iconStart={<Plus />} onClick={() => setCreating(true)}>New task</Button>
        </div>
        {!ready ? <div aria-busy="true" aria-label="Loading tasks" className="grid gap-3"><Skeleton className="h-10 w-1/2" /><Skeleton shape="block" className="h-80" /></div>
          : <TaskViews key={saved.id} clients={clients} storageKey="cm-tasks" preset={preset} />}
      </div>
      <NewTaskDialog open={creating} onClose={() => setCreating(false)} clients={clients.map((c) => ({ value: c.id, label: c.name }))}
        onCreate={(clientId, t) => { addTask(clientId, t); setCreating(false); toast({ message: `${t.title} added`, tone: "success" }); }} />
    </Shell>
  );
}

function NewTaskDialog({ open, onClose, clients, onCreate }: { open: boolean; onClose: () => void; clients: { value: string; label: string }[]; onCreate: (clientId: string, t: Parameters<ReturnType<typeof useClients>["addTask"]>[1]) => void }) {
  const [title, setTitle] = React.useState("");
  const [client, setClient] = React.useState(clients[0]?.value ?? "");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [priority, setPriority] = React.useState<string>("normal");
  const [owner, setOwner] = React.useState("Studio");
  const [due, setDue] = React.useState("");
  const [err, setErr] = React.useState<string>();
  React.useEffect(() => { if (open) { setClient((c) => c || clients[0]?.value || ""); setErr(undefined); } }, [open, clients]); // eslint-disable-line react-hooks/set-state-in-effect
  const submit = () => {
    if (!title.trim()) { setErr("Give the task a name."); return; }
    onCreate(client, withStatus({ id: uid(), title: title.trim(), done: false, priority: priority === "none" ? undefined : (priority as TaskPriority), owner: owner === "none" ? undefined : owner, due: due || undefined }, status));
    setTitle(""); setDue("");
  };
  return (
    <Modal open={open} onClose={onClose} size="md" title="New task" description="Add the details now or later; open the task any time to change them."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" iconStart={<Plus />} onClick={submit}>Add task</Button></>}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="Name" error={err} className="sm:col-span-2"><Input id="nt-name" value={title} onChange={(e) => { setTitle(e.target.value); setErr(undefined); }} /></Field>
        <Field label="Client"><Select value={client} onValueChange={setClient} options={clients} /></Field>
        <Field label="Status"><Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)} options={statuses.map((s) => ({ value: s.id, label: s.name }))} /></Field>
        <Field label="Priority"><Select value={priority} onValueChange={setPriority} options={[...priorities.map((p) => ({ value: p.id, label: p.name })), { value: "none", label: "No priority" }]} /></Field>
        <Field label="Assignee"><Select value={owner} onValueChange={setOwner} options={[...people.map((p) => ({ value: p.id, label: p.name })), { value: "none", label: "Nobody" }]} /></Field>
        <Field label="Due date" optional className="sm:col-span-2"><Input id="nt-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        <button type="submit" hidden>Add task</button>
      </form>
    </Modal>
  );
}
