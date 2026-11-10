"use client";
import { Badge, Button, Checkbox, Drawer, Field, IconButton, Input, Menu, Popover, SegmentedControl, Select, Switch, Table, cx, useToast, type Column } from "@ds/components";
import { ArrowDownUp, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Columns3, Filter, Layers, List, Plus, Search, Table2, X } from "lucide-react";
import * as React from "react";
import { uid, useClients, type Client, type ClientTask, type TaskPriority, type TaskStatus } from "@/lib/clients";
import {
  activeFilters, applyFilters, groupRows, titleOf, groupings, isoDay, noFilters, people, priorities, rowKey, rowsOf, sortRows, sortings, statusOf, statuses, today, withStatus,
  type Filters, type Group, type GroupBy, type Row, type Sort, type SortKey,
} from "@/lib/tasks";
import { Assignee, DueLabel, PriorityFlag, PriorityMenu, StatusMark, StatusMenu, SubtaskCount, useStored } from "./parts";
import { TaskDrawer } from "./TaskDrawer";

/*
 * One set of tasks, four ways to look at it, like a project tool: a grouped List, a Board you drag cards across, a
 * Table you sort and edit in place, and a Calendar by due date. Search, filters, grouping and sorting are shared by
 * every view; the chosen view, grouping and sort are remembered per browser.
 */

export type ViewId = "list" | "board" | "table" | "calendar";
const views: { value: ViewId; label: string; icon: React.ReactNode }[] = [
  { value: "list", label: "List", icon: <List /> },
  { value: "board", label: "Board", icon: <Columns3 /> },
  { value: "table", label: "Table", icon: <Table2 /> },
  { value: "calendar", label: "Calendar", icon: <CalendarDays /> },
];
const DRAG = "application/x-cm-task";

interface Prefs { view: ViewId; group: GroupBy; sort: Sort; showDone: boolean }

export function TaskViews({ clients, scope, storageKey, preset, defaultView = "list" }: {
  clients: Client[];
  /** A single client's tasks: hides the client column and filter, and new tasks go to them. */
  scope?: string;
  storageKey: string;
  /** Starting filters and grouping from a saved view. */
  preset?: { filters: Partial<Filters>; group?: GroupBy };
  defaultView?: ViewId;
}) {
  const { updateTask, addTask, moveTask } = useClients();
  const toast = useToast();
  const [prefs, setPrefs] = useStored<Prefs>(storageKey, { view: defaultView, group: "status", sort: { key: "due", direction: "asc" }, showDone: false });
  const [filters, setFilters] = React.useState<Filters>({ ...noFilters, ...preset?.filters });
  const [group, setGroup] = React.useState<GroupBy | undefined>(preset?.group);
  React.useEffect(() => { setFilters({ ...noFilters, ...preset?.filters }); setGroup(preset?.group); }, [preset]); // eslint-disable-line react-hooks/set-state-in-effect
  const groupBy = group ?? prefs.group;
  const [open, setOpen] = React.useState<{ clientId: string; taskId: string } | null>(null);

  const f = { ...filters, showDone: filters.showDone || prefs.showDone };
  const rows = sortRows(applyFilters(rowsOf(clients), f), prefs.sort);
  const groups = groupRows(rows, groupBy, clients);
  const label = (r: Row) => titleOf(r.task);
  const patch = (r: Row, fn: (t: ClientTask) => ClientTask) => updateTask(r.client.id, r.task.id, fn);
  const openRow = (r: Row) => setOpen({ clientId: r.client.id, taskId: r.task.id });
  const edits = {
    status: (r: Row, s: TaskStatus) => patch(r, (t) => withStatus(t, s)),
    priority: (r: Row, p: TaskPriority | undefined) => patch(r, (t) => ({ ...t, priority: p })),
    owner: (r: Row, o: string | undefined) => patch(r, (t) => ({ ...t, owner: o })),
    due: (r: Row, d: string | undefined) => patch(r, (t) => ({ ...t, due: d })),
  };
  /** Puts a task into a group: what dropping a card on a board column, or adding a task under a group, means. */
  const intoGroup = (r: Row, g: Group) => {
    if (groupBy === "status") edits.status(r, g.id as TaskStatus);
    else if (groupBy === "priority") edits.priority(r, g.id === "none" ? undefined : (g.id as TaskPriority));
    else if (groupBy === "owner") edits.owner(r, g.id || undefined);
    else if (groupBy === "client") moveTask(r.client.id, r.task.id, g.id);
  };
  const droppable = groupBy === "status" || groupBy === "priority" || groupBy === "owner" || groupBy === "client";
  /**
   * A task added in this view. It takes the view's single filter values (one assignee, one priority, one status, one
   * client), then the group it was added under, so it lands where it was added instead of vanishing. If it still
   * doesn't match (a search, say), a toast says it was added but is hidden.
   */
  const create = (title: string, clientId: string, g?: Group, by: GroupBy = groupBy) => {
    let t: ClientTask = { id: uid(), title, done: false, status: "todo", priority: undefined, owner: "Studio" };
    if (filters.owners.length === 1) t.owner = filters.owners[0] || undefined;
    if (filters.priorities.length === 1 && filters.priorities[0] !== "none") t.priority = filters.priorities[0] as TaskPriority;
    if (filters.statuses.length === 1) t = withStatus(t, filters.statuses[0]);
    if (filters.due === "week" || filters.due === "overdue") t.due = today();
    if (!scope && filters.clients.length === 1) clientId = filters.clients[0];
    if (g && by === "status") t = withStatus(t, g.id as TaskStatus);
    if (g && by === "priority") t.priority = g.id === "none" ? undefined : (g.id as TaskPriority);
    if (g && by === "owner") t.owner = g.id || undefined;
    if (g && by === "client") clientId = g.id;
    addTask(clientId, t);
    const client = clients.find((c) => c.id === clientId);
    if (client && applyFilters([{ client, task: t }], f).length === 0) toast({ message: `Added “${title}”. It's hidden by this view's search or filters.`, tone: "neutral" });
  };
  // Done tasks the "Show done" switch is hiding right now, so the Done group can say so instead of reading 0.
  const hiddenDone = f.showDone ? 0 : applyFilters(rowsOf(clients), { ...f, showDone: true }).filter((r) => r.task.done).length;
  const showDone = () => setPrefs({ ...prefs, showDone: true });
  const narrowed = activeFilters(filters) > 0 || filters.q.trim() !== "";
  const defaultClient = scope ?? (filters.clients.length === 1 ? filters.clients[0] : clients[0]?.id ?? "");
  const total = rowsOf(clients).length;

  return (
    <div className="grid gap-4">
      <Toolbar clients={clients} scope={scope} prefs={prefs} setPrefs={setPrefs} filters={filters} setFilters={setFilters} groupBy={groupBy} setGroup={(g) => { setGroup(undefined); setPrefs({ ...prefs, group: g }); }} count={rows.length} />
      <p className="text-caption text-ink-subtle" aria-live="polite">{rows.length} of {total} tasks{hiddenDone > 0 ? ` · ${hiddenDone} done hidden` : ""}</p>

      {rows.length === 0 && total > 0 && prefs.view !== "table" && (
        <div className="grid justify-items-start gap-3 border-t-2 border-line-strong pt-4" role="status">
          <p className="text-heading-md text-ink">No tasks match</p>
          <p className="text-body-sm text-ink-muted">{narrowed ? "Nothing fits this search and these filters." : "Every task here is done."}{hiddenDone > 0 ? ` ${hiddenDone} done ${hiddenDone === 1 ? "task is" : "tasks are"} hidden.` : ""}</p>
          <div className="flex flex-wrap gap-2">
            {narrowed && <Button size="sm" variant="secondary" iconStart={<X />} onClick={() => setFilters({ ...noFilters })}>Clear search and filters</Button>}
            {hiddenDone > 0 && <Button size="sm" variant="ghost" onClick={showDone}>Show done tasks</Button>}
          </div>
        </div>
      )}
      {prefs.view === "list" && <ListView groups={groups} grouped={groupBy !== "none"} scope={scope} label={label} edits={edits} openRow={openRow} clients={clients} defaultClient={defaultClient} create={create} hiddenDone={hiddenDone} onShowDone={showDone} />}
      {prefs.view === "board" && <BoardView groups={groupBy === "none" || groupBy === "due" ? groupRows(rows, "status", clients) : groups} droppable={droppable || groupBy === "none" || groupBy === "due"}
        onDrop={(key, g) => { const r = rows.find((x) => rowKey(x) === key); if (!r) return; if (groupBy === "none" || groupBy === "due") edits.status(r, g.id as TaskStatus); else intoGroup(r, g); }}
        scope={scope} label={label} edits={edits} openRow={openRow} clients={clients} defaultClient={defaultClient} create={(title, c, g) => create(title, c, g, groupBy === "none" || groupBy === "due" ? "status" : groupBy)} hiddenDone={hiddenDone} onShowDone={showDone} />}
      {prefs.view === "table" && <TableView rows={rows} scope={scope} sort={prefs.sort} setSort={(s) => setPrefs({ ...prefs, sort: s })} label={label} edits={edits} openRow={openRow} />}
      {prefs.view === "calendar" && <CalendarView rows={rows} scope={scope} openRow={openRow} onDrop={(key, day) => { const r = rows.find((x) => rowKey(x) === key); if (r) edits.due(r, day); }} />}

      <TaskDrawer clients={clients} open={open} onClose={() => setOpen(null)} />
    </div>
  );
}

/* ---------- Toolbar: view, search, filter, group, sort, done ---------- */

function Toolbar({ clients, scope, prefs, setPrefs, filters, setFilters, groupBy, setGroup, count }: {
  clients: Client[]; scope?: string; prefs: Prefs; setPrefs: (p: Prefs) => void; filters: Filters; setFilters: (f: Filters) => void; groupBy: GroupBy; setGroup: (g: GroupBy) => void; count: number;
}) {
  const n = activeFilters(filters);
  const toggle = <K extends "statuses" | "priorities" | "owners" | "clients">(k: K, v: Filters[K][number]) =>
    setFilters({ ...filters, [k]: (filters[k] as string[]).includes(v as string) ? (filters[k] as string[]).filter((x) => x !== v) : [...filters[k], v] });
  const sortName = sortings.find((s) => s.id === prefs.sort.key)?.name;
  const tool = "inline-flex h-10 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-label-md text-ink hover:border-line-strong [&_svg]:size-4 [&_svg]:text-ink-subtle";
  // Wider screens: a popover under the button. Phones: the same panel in a side sheet, which has room to scroll.
  const [sheet, setSheet] = React.useState(false);
  const filterPanel = (
    <>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="grid content-start gap-6">
              <fieldset className="grid content-start gap-0.5"><legend className="pb-2 text-eyebrow text-ink-subtle uppercase">Status</legend>
                {statuses.map((s) => <Checkbox key={s.id} id={`f-${scope ?? "all"}-s-${s.id}`} label={s.name} checked={filters.statuses.includes(s.id)} onChange={() => toggle("statuses", s.id)} />)}
              </fieldset>
              <fieldset className="grid content-start gap-0.5"><legend className="pb-2 text-eyebrow text-ink-subtle uppercase">Priority</legend>
                {[...priorities.map((p) => ({ id: p.id as TaskPriority | "none", name: p.name })), { id: "none" as const, name: "No priority" }].map((p) => <Checkbox key={p.id} id={`f-${scope ?? "all"}-p-${p.id}`} label={p.name} checked={filters.priorities.includes(p.id)} onChange={() => toggle("priorities", p.id)} />)}
              </fieldset>
            </div>
            <div className="grid content-start gap-6">
              <fieldset className="grid content-start gap-0.5"><legend className="pb-2 text-eyebrow text-ink-subtle uppercase">Assignee</legend>
                {people.map((p) => <Checkbox key={p.id} id={`f-${scope ?? "all"}-o-${p.id}`} label={p.name} checked={filters.owners.includes(p.id)} onChange={() => toggle("owners", p.id)} />)}
              </fieldset>
              {!scope && (
                <fieldset className="grid content-start gap-0.5"><legend className="pb-2 text-eyebrow text-ink-subtle uppercase">Client</legend>
                  {clients.map((c) => <Checkbox key={c.id} id={`f-all-c-${c.id}`} label={c.name} checked={filters.clients.includes(c.id)} onChange={() => toggle("clients", c.id)} />)}
                </fieldset>
              )}
            </div>
            <div className="sm:col-span-2 sm:w-56">
              <Field label="Due"><Select value={filters.due} onValueChange={(v) => setFilters({ ...filters, due: v as Filters["due"] })} options={[{ value: "any", label: "Any time" }, { value: "overdue", label: "Overdue" }, { value: "week", label: "Next 7 days" }, { value: "none", label: "No due date" }]} /></Field>
            </div>
          </div>
          {n > 0 && <div className="mt-4 border-t border-line pt-3"><Button size="sm" variant="ghost" iconStart={<X />} onClick={() => setFilters({ ...noFilters, q: filters.q })}>Clear filters</Button></div>}
    </>
  );
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-full overflow-x-auto"><SegmentedControl label="View" size="sm" value={prefs.view} onChange={(v) => setPrefs({ ...prefs, view: v as ViewId })} options={views} /></div>
        <div className="relative w-full sm:ml-auto sm:w-72">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" />
          <Input id={`${scope ?? "all"}-task-search`} type="search" aria-label="Search tasks" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search tasks" className="pl-9" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="max-sm:hidden">
          <Popover align="start" width="lg" label="Filter tasks" trigger={<button type="button" className={cx(tool, n > 0 && "border-action")} aria-label={n ? `Filter, ${n} on` : "Filter"}><Filter />Filter{n > 0 && <span className="tabular-nums text-ink-brand">{n}</span>}</button>}>
            {filterPanel}
          </Popover>
        </span>
        <button type="button" className={cx(tool, "sm:hidden", n > 0 && "border-action")} aria-label={n ? `Filter, ${n} on` : "Filter"} onClick={() => setSheet(true)}><Filter />Filter{n > 0 && <span className="tabular-nums text-ink-brand">{n}</span>}</button>
        <Drawer side="right" size="md" open={sheet} onClose={() => setSheet(false)} title="Filter tasks" footer={<Button variant="secondary" onClick={() => setSheet(false)}>Show {count} tasks</Button>}>{filterPanel}</Drawer>
        {prefs.view !== "calendar" && (
          <Menu align="start" header={<span className="text-caption text-ink-subtle">Group by</span>} items={groupings.filter((g) => !(scope && g.id === "client")).map((g) => ({ label: g.name, checked: groupBy === g.id, onSelect: () => setGroup(g.id) }))}
            trigger={<button type="button" className={tool}><Layers />Group: {groupings.find((g) => g.id === groupBy)?.name}<ChevronDown /></button>} />
        )}
        {(prefs.view === "list" || prefs.view === "table") && (
          <Menu align="start" header={<span className="text-caption text-ink-subtle">Sort by</span>}
            items={[...sortings.filter((s) => !(scope && s.id === "client")).map((s) => ({ label: s.name, checked: prefs.sort.key === s.id, onSelect: () => setPrefs({ ...prefs, sort: { ...prefs.sort, key: s.id } }) })), "separator" as const,
              { label: "Ascending", checked: prefs.sort.direction === "asc", onSelect: () => setPrefs({ ...prefs, sort: { ...prefs.sort, direction: "asc" } }) },
              { label: "Descending", checked: prefs.sort.direction === "desc", onSelect: () => setPrefs({ ...prefs, sort: { ...prefs.sort, direction: "desc" } }) }]}
            trigger={<button type="button" className={tool}><ArrowDownUp />Sort: {sortName}{prefs.sort.direction === "desc" ? " ↓" : " ↑"}</button>} />
        )}
        <Switch id={`${scope ?? "all"}-show-done`} checked={prefs.showDone} onChange={(v) => setPrefs({ ...prefs, showDone: v })} label="Show done" className="ml-1" />
      </div>
      {n > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Filters on">
          {[...filters.statuses.map((v) => ({ k: "statuses" as const, v, name: statuses.find((s) => s.id === v)?.name })), ...filters.priorities.map((v) => ({ k: "priorities" as const, v, name: v === "none" ? "No priority" : priorities.find((p) => p.id === v)?.name })),
            ...filters.owners.map((v) => ({ k: "owners" as const, v, name: v })), ...filters.clients.map((v) => ({ k: "clients" as const, v, name: clients.find((c) => c.id === v)?.name }))].map((x) => (
            <li key={`${x.k}-${x.v}`}><button type="button" onClick={() => toggle(x.k, x.v as never)} aria-label={`Remove filter ${x.name}`} className="inline-flex min-h-11 items-center gap-1 border border-line-strong px-2.5 text-label-sm text-ink hover:bg-surface-hover sm:min-h-8">{x.name}<X className="size-3.5" aria-hidden="true" /></button></li>
          ))}
          {filters.due !== "any" && <li><button type="button" onClick={() => setFilters({ ...filters, due: "any" })} aria-label="Remove the due date filter" className="inline-flex min-h-11 items-center gap-1 border border-line-strong px-2.5 text-label-sm text-ink hover:bg-surface-hover sm:min-h-8">{dueLabel(filters.due)}<X className="size-3.5" aria-hidden="true" /></button></li>}
        </ul>
      )}
    </div>
  );
}
const dueLabel = (d: Filters["due"]) => (d === "overdue" ? "Overdue" : d === "week" ? "Due in 7 days" : d === "none" ? "No due date" : "Any time");

type Edits = {
  status: (r: Row, s: TaskStatus) => void; priority: (r: Row, p: TaskPriority | undefined) => void; owner: (r: Row, o: string | undefined) => void; due: (r: Row, d: string | undefined) => void;
};
interface ViewProps { scope?: string; label: (r: Row) => string; edits: Edits; openRow: (r: Row) => void }

/* ---------- List ---------- */

function ListView({ groups, grouped, scope, label, edits, openRow, clients, defaultClient, create, hiddenDone, onShowDone }: ViewProps & {
  groups: Group[]; grouped: boolean; clients: Client[]; defaultClient: string; create: (title: string, clientId: string, g?: Group) => void; hiddenDone: number; onShowDone: () => void;
}) {
  const [closed, setClosed] = React.useState<string[]>([]);
  return (
    <div className="grid gap-6">
      {groups.map((g) => {
        const isClosed = closed.includes(g.id);
        return (
          <section key={g.id} aria-labelledby={`lg-${g.id || "none"}`} className="grid gap-1">
            {grouped && (
              <h2 id={`lg-${g.id || "none"}`} className="border-b-2 border-line-strong pb-1">
                <button type="button" aria-expanded={!isClosed} onClick={() => setClosed(isClosed ? closed.filter((x) => x !== g.id) : [...closed, g.id])}
                  className="inline-flex min-h-11 items-center gap-2 text-label-md text-ink sm:min-h-8">
                  <ChevronDown aria-hidden="true" className={cx("size-4 text-ink-subtle transition-transform", isClosed && "-rotate-90")} />
                  <GroupIcon g={g} />{g.name}<span className="text-ink-subtle tabular-nums">{g.rows.length}</span>
                </button>
              </h2>
            )}
            {!grouped && <h2 id={`lg-${g.id}`} className="sr-only">{g.name}</h2>}
            {!isClosed && (
              <>
                {g.rows.length > 0 && (
                  <ul className="divide-y divide-line">
                    {g.rows.map((r) => (
                      <li key={rowKey(r)} className="row-lift flex items-start gap-2 py-1 pr-1 sm:items-center">
                        <StatusMenu task={r.task} label={label(r)} compact onPick={(s) => edits.status(r, s)} />
                        {/* Phones: the meta drops to a second line under the title, so the title keeps the full width. */}
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2">
                          <button type="button" onClick={() => openRow(r)} className="min-h-11 min-w-0 flex-1 basis-full text-left text-body-md text-ink hover:underline sm:min-h-8 sm:basis-0">
                            <span className={cx(r.task.done && "text-ink-subtle line-through")}>{titleOf(r.task)}</span>
                          </button>
                          <div className="flex items-center gap-1 max-sm:-mt-2 max-sm:w-full">
                            {!scope && <span className="w-36 truncate text-caption text-ink-subtle max-lg:hidden">{r.client.name}</span>}
                            {!scope && <span className="mr-1 min-w-0 truncate text-caption text-ink-subtle lg:hidden">{r.client.name}</span>}
                            <SubtaskCount task={r.task} />
                            <PriorityMenu task={r.task} label={label(r)} compact onPick={(p) => edits.priority(r, p)} />
                            <span className="sm:w-28 sm:text-right"><DueLabel task={r.task} /></span>
                            <span className="max-sm:ml-auto"><Assignee owner={r.task.owner} task={label(r)} compact onPick={(o) => edits.owner(r, o)} /></span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {g.id === "done" && hiddenDone > 0 && <DoneHidden n={hiddenDone} onShow={onShowDone} />}
                <QuickAdd id={`qa-${scope ?? "all"}-${g.id || "none"}`} clients={clients} scope={scope} defaultClient={defaultClient} onAdd={(t, c) => create(t, c, grouped ? g : undefined)} where={grouped ? g.name : undefined} />
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

function GroupIcon({ g }: { g: Group }) {
  if (statuses.some((s) => s.id === g.id)) return <StatusMark status={g.id as TaskStatus} />;
  if (priorities.some((p) => p.id === g.id) || g.id === "none") return <PriorityFlag priority={g.id === "none" ? undefined : (g.id as TaskPriority)} />;
  return null;
}

/** In the Done group while done tasks are hidden: how many, and a way to show them, so the group never just reads 0. */
function DoneHidden({ n, onShow }: { n: number; onShow: () => void }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 px-1 py-2 text-body-sm text-ink-muted">
      {n} done {n === 1 ? "task" : "tasks"} hidden.
      <button type="button" onClick={onShow} className="min-h-6 text-link underline underline-offset-2 hover:no-underline">Show {n === 1 ? "it" : "them"}</button>
    </p>
  );
}

/** "+ Add task": opens a one-line form in place. Enter saves and keeps it open for the next one; Esc closes. */
function QuickAdd({ id, clients, scope, defaultClient, onAdd, where }: { id: string; clients: Client[]; scope?: string; defaultClient: string; onAdd: (title: string, clientId: string) => void; where?: string }) {
  const [on, setOn] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [client, setClient] = React.useState(defaultClient);
  React.useEffect(() => setClient(defaultClient), [defaultClient]); // eslint-disable-line react-hooks/set-state-in-effect
  if (!on) return <button type="button" onClick={() => setOn(true)} className="inline-flex min-h-11 w-fit items-center gap-1.5 px-1 text-label-sm text-ink-subtle hover:text-ink sm:min-h-8"><Plus className="size-4" aria-hidden="true" />Add task{where ? <span className="sr-only"> to {where}</span> : null}</button>;
  return (
    <form className="flex flex-wrap items-end gap-2 py-2" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onAdd(title.trim(), client); setTitle(""); }}
      onKeyDown={(e) => { if (e.key === "Escape") { setOn(false); setTitle(""); } }}>
      <Field label={where ? `New task in ${where}` : "New task"} className="min-w-48 flex-1"><Input id={id} autoFocus value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      {!scope && <Field label="Client" className="w-48"><Select value={client} onValueChange={setClient} options={clients.map((c) => ({ value: c.id, label: c.name }))} /></Field>}
      <Button type="submit" variant="secondary" iconStart={<Plus />}>Add</Button>
      <Button type="button" variant="ghost" onClick={() => { setOn(false); setTitle(""); }}>Cancel</Button>
    </form>
  );
}

/* ---------- Board ---------- */

function BoardView({ groups, droppable, onDrop, scope, label, edits, openRow, clients, defaultClient, create, hiddenDone, onShowDone }: ViewProps & {
  groups: Group[]; droppable: boolean; onDrop: (key: string, g: Group) => void; clients: Client[]; defaultClient: string; create: (title: string, clientId: string, g: Group) => void; hiddenDone: number; onShowDone: () => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <ol className="flex gap-4">
        {groups.map((g) => (
          <BoardColumn key={g.id || "none"} g={g} droppable={droppable} onDrop={(key) => onDrop(key, g)}>
            <h2 className="flex items-center gap-2 px-1 text-label-md text-ink"><GroupIcon g={g} />{g.name}<span className="text-ink-subtle tabular-nums">{g.rows.length}</span></h2>
            {g.rows.map((r) => (
              <article key={rowKey(r)} draggable={droppable} onDragStart={(e) => { e.dataTransfer.setData(DRAG, rowKey(r)); e.dataTransfer.effectAllowed = "move"; }}
                className={cx("grid gap-2 border-t border-line bg-surface px-3 pt-3 pb-3 transition-colors duration-fast hover:bg-surface-hover", droppable && "cursor-grab active:cursor-grabbing")}>
                <button type="button" onClick={() => openRow(r)} className="min-h-11 text-left text-body-md text-ink hover:underline sm:min-h-6">
                  <span className={cx(r.task.done && "text-ink-subtle line-through")}>{titleOf(r.task)}</span>
                </button>
                {!scope && <span className="text-caption text-ink-subtle">{r.client.name}</span>}
                <div className="flex flex-wrap items-center gap-1">
                  <StatusMenu task={r.task} label={label(r)} compact onPick={(s) => edits.status(r, s)} />
                  <PriorityMenu task={r.task} label={label(r)} compact onPick={(p) => edits.priority(r, p)} />
                  <DueLabel task={r.task} className="px-1" />
                  <SubtaskCount task={r.task} />
                  <span className="ml-auto"><Assignee owner={r.task.owner} task={label(r)} compact onPick={(o) => edits.owner(r, o)} /></span>
                </div>
              </article>
            ))}
            {g.id === "done" && hiddenDone > 0 && <DoneHidden n={hiddenDone} onShow={onShowDone} />}
            <QuickAdd id={`ba-${scope ?? "all"}-${g.id || "none"}`} clients={clients} scope={scope} defaultClient={defaultClient} onAdd={(t, c) => create(t, c, g)} where={g.name} />
          </BoardColumn>
        ))}
      </ol>
    </div>
  );
}

function BoardColumn({ g, droppable, onDrop, children }: { g: Group; droppable: boolean; onDrop: (key: string) => void; children: React.ReactNode }) {
  const [over, setOver] = React.useState(false);
  return (
    <li data-column={g.name} className={cx("flex w-72 shrink-0 flex-col gap-2 border-t-4 border-line-strong pt-3 transition-colors duration-fast", over && "bg-surface-selected")}
      onDragOver={(e) => { if (droppable && e.dataTransfer.types.includes(DRAG)) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false); }}
      onDrop={(e) => { e.preventDefault(); setOver(false); const key = e.dataTransfer.getData(DRAG); if (key) onDrop(key); }}>
      {children}
    </li>
  );
}

/* ---------- Table ---------- */

function TableView({ rows, scope, sort, setSort, label, edits, openRow }: ViewProps & { rows: Row[]; sort: Sort; setSort: (s: Sort) => void }) {
  const columns: Column<Row>[] = [
    { key: "title", header: "Task", sortable: true, cell: (r) => <button type="button" onClick={() => openRow(r)} className="min-h-11 text-left text-body-md text-ink hover:underline sm:min-h-8"><span className={cx(r.task.done && "text-ink-subtle line-through")}>{titleOf(r.task)}</span></button> },
    ...(scope ? [] : [{ key: "client", header: "Client", sortable: true, cell: (r: Row) => <span className="text-body-sm whitespace-nowrap text-ink-muted">{r.client.name}</span> }]),
    { key: "status", header: "Status", sortable: true, cell: (r) => <StatusMenu task={r.task} label={label(r)} onPick={(s) => edits.status(r, s)} /> },
    { key: "priority", header: "Priority", sortable: true, cell: (r) => <PriorityMenu task={r.task} label={label(r)} onPick={(p) => edits.priority(r, p)} /> },
    { key: "owner", header: "Assignee", sortable: true, cell: (r) => <Assignee owner={r.task.owner} task={label(r)} onPick={(o) => edits.owner(r, o)} /> },
    { key: "due", header: "Due", sortable: true, cell: (r) => <Input type="date" size="sm" aria-label={`Due date for ${titleOf(r.task)}`} value={r.task.due ?? ""} className="w-36 max-sm:h-11" onChange={(e) => edits.due(r, e.target.value || undefined)} /> },
    { key: "subtasks", header: "Subtasks", cell: (r) => <SubtaskCount task={r.task} /> },
  ];
  return (
    <Table caption="Tasks" columns={columns} rows={rows} rowKey={rowKey} density="compact" sort={sort} onSortChange={(s) => setSort({ key: s.key as SortKey, direction: s.direction })}
      empty={<p className="p-6 text-body-md text-ink-muted">No tasks match. Clear a filter or turn on Show done.</p>} />
  );
}

/* ---------- Calendar ---------- */

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarView({ rows, scope, openRow, onDrop }: { rows: Row[]; scope?: string; openRow: (r: Row) => void; onDrop: (key: string, day: string) => void }) {
  const [month, setMonth] = React.useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const now = today();
  const first = new Date(month);
  const lead = (first.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(month.getFullYear(), month.getMonth(), 1 - lead + i); return d; });
  const weeks = days.slice(35).some((d) => d.getMonth() === month.getMonth()) ? 6 : 5;
  const byDay = (iso: string) => rows.filter((r) => r.task.due === iso);
  const undated = rows.filter((r) => !r.task.due);
  const inMonth = rows.filter((r) => r.task.due && r.task.due.slice(0, 7) === isoDay(month).slice(0, 7)).sort((a, b) => a.task.due!.localeCompare(b.task.due!));
  const title = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const chip = (r: Row) => (
    <button key={rowKey(r)} type="button" draggable onDragStart={(e) => { e.dataTransfer.setData(DRAG, rowKey(r)); e.dataTransfer.effectAllowed = "move"; }} onClick={() => openRow(r)}
      className={cx("flex min-h-6 w-full items-center gap-1.5 border-l-2 bg-surface-sunken px-1.5 text-left text-caption text-ink hover:bg-surface-hover", r.task.done ? "border-line text-ink-subtle line-through" : r.task.priority === "urgent" ? "border-danger" : r.task.priority === "high" ? "border-warning" : "border-action")}
      aria-label={`${titleOf(r.task)}${scope ? "" : `, ${r.client.name}`}. Open`}>
      <span className="truncate">{titleOf(r.task)}</span>
    </button>
  );
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-heading-lg text-ink" aria-live="polite">{title}</h2>
        <span className="ml-auto flex items-center gap-1">
          <IconButton label="Previous month" variant="ghost" icon={<ChevronLeft />} onClick={() => shift(-1)} />
          <Button size="sm" variant="ghost" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</Button>
          <IconButton label="Next month" variant="ghost" icon={<ChevronRight />} onClick={() => shift(1)} />
        </span>
      </div>
      {/* Phones: the month as an agenda; a 7-column grid is too narrow to read. */}
      <ol className="grid gap-3 sm:hidden">
        {inMonth.length === 0 && <li className="text-body-md text-ink-muted">Nothing due in {title}.</li>}
        {Array.from(new Set(inMonth.map((r) => r.task.due!))).map((day) => (
          <li key={day} className="grid gap-1 border-t-2 border-line-strong pt-2">
            <h3 className={cx("text-label-md", day === now ? "text-ink-brand" : "text-ink")}>{new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</h3>
            {byDay(day).map((r) => <button key={rowKey(r)} type="button" onClick={() => openRow(r)} className="flex min-h-11 items-center gap-2 text-left text-body-md text-ink"><StatusMark status={statusOf(r.task)} /><span className="min-w-0 flex-1">{titleOf(r.task)}</span><PriorityFlag priority={r.task.priority} /></button>)}
          </li>
        ))}
      </ol>
      <div className="max-sm:hidden">
        <div className="grid grid-cols-7 border-b-2 border-line-strong">{weekdays.map((w) => <span key={w} className="px-1.5 pb-1 text-label-sm text-ink-muted">{w}</span>)}</div>
        <div className="grid grid-cols-7">
          {days.slice(0, weeks * 7).map((d) => {
            const iso = isoDay(d);
            const out = d.getMonth() !== month.getMonth();
            return <DayCell key={iso} iso={iso} day={d.getDate()} out={out} isToday={iso === now} onDrop={(key) => onDrop(key, iso)}>{byDay(iso).slice(0, 4).map(chip)}{byDay(iso).length > 4 && <span className="px-1.5 text-caption text-ink-subtle">+{byDay(iso).length - 4} more</span>}</DayCell>;
          })}
        </div>
        <p className="mt-2 text-caption text-ink-subtle">Drag a task onto a day to change its due date.</p>
      </div>
      {undated.length > 0 && (
        <section aria-labelledby="undated-h" className="grid gap-1 border-t-2 border-line-strong pt-3">
          <h3 id="undated-h" className="text-label-md text-ink">No due date <span className="text-ink-subtle tabular-nums">{undated.length}</span></h3>
          <ul className="flex flex-wrap gap-2">{undated.map((r) => <li key={rowKey(r)}><Badge tone="neutral" size="sm">{r.client.name}</Badge> <button type="button" onClick={() => openRow(r)} className="min-h-11 text-body-sm text-ink underline-offset-2 hover:underline sm:min-h-6">{titleOf(r.task)}</button></li>)}</ul>
        </section>
      )}
    </div>
  );
}

function DayCell({ iso, day, out, isToday, onDrop, children }: { iso: string; day: number; out: boolean; isToday: boolean; onDrop: (key: string) => void; children: React.ReactNode }) {
  const [over, setOver] = React.useState(false);
  return (
    <div data-day={iso} className={cx("grid min-h-28 content-start gap-1 border-r border-b border-line p-1.5 nth-[7n+1]:border-l", out && "bg-surface-sunken", over && "bg-surface-selected")}
      onDragOver={(e) => { if (e.dataTransfer.types.includes(DRAG)) { e.preventDefault(); setOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false); }}
      onDrop={(e) => { e.preventDefault(); setOver(false); const key = e.dataTransfer.getData(DRAG); if (key) onDrop(key); }}>
      <span className={cx("grid size-6 place-items-center text-caption tabular-nums", isToday ? "bg-action font-semibold text-on-action" : out ? "text-ink-subtle" : "text-ink")}>{day}</span>
      {children}
    </div>
  );
}


