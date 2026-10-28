/*
 * Tasks across every client, the way a project tool (ClickUp, Linear) handles them: a status and a priority on each,
 * subtasks, and one set of filters, grouping and sorting that every view (list, board, table, calendar) shares.
 * The tasks themselves live on their client (lib/clients.ts); this is how the views read and slice them.
 */
import type { Client, ClientTask, TaskPriority, TaskStatus } from "./clients";

/** Who a task can be assigned to. "Studio" is us; "Client" shows in their portal under Waiting on you. */
export const people = [
  { id: "Studio", name: "JAM Studio", sub: "Us, the team" },
  { id: "Anu", name: "Anu", sub: "Design lead" },
  { id: "Justin", name: "Justin", sub: "Product" },
  { id: "Client", name: "Client", sub: "Shows in their portal" },
];

export const statuses: { id: TaskStatus; name: string; tone: "neutral" | "info" | "warning" | "success" }[] = [
  { id: "todo", name: "To do", tone: "neutral" },
  { id: "doing", name: "In progress", tone: "info" },
  { id: "review", name: "In review", tone: "warning" },
  { id: "done", name: "Done", tone: "success" },
];

export const priorities: { id: TaskPriority; name: string; rank: number }[] = [
  { id: "urgent", name: "Urgent", rank: 0 },
  { id: "high", name: "High", rank: 1 },
  { id: "normal", name: "Normal", rank: 2 },
  { id: "low", name: "Low", rank: 3 },
];

export const statusOf = (t: ClientTask): TaskStatus => t.status ?? (t.done ? "done" : "todo");
export const statusName = (s: TaskStatus) => statuses.find((x) => x.id === s)!.name;
export const priorityName = (p?: TaskPriority) => priorities.find((x) => x.id === p)?.name ?? "No priority";
/** A task with a new status, keeping done in step. */
export const withStatus = (t: ClientTask, status: TaskStatus): ClientTask => ({ ...t, status, done: status === "done" });

export interface Row { client: Client; task: ClientTask }
export const rowsOf = (clients: Client[]): Row[] => clients.flatMap((client) => client.tasks.map((task) => ({ client, task })));
export const rowKey = (r: Row) => `${r.client.id}:${r.task.id}`;

/* Dates are plain YYYY-MM-DD strings, compared as text. */
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const today = () => isoDay(new Date());
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return isoDay(d); };
export const isOverdue = (t: ClientTask) => !!t.due && !t.done && t.due < today();

export type DueBucket = "overdue" | "today" | "week" | "later" | "none";
export const dueBuckets: { id: DueBucket; name: string }[] = [
  { id: "overdue", name: "Overdue" }, { id: "today", name: "Today" }, { id: "week", name: "Next 7 days" }, { id: "later", name: "Later" }, { id: "none", name: "No due date" },
];
export function dueBucket(t: ClientTask): DueBucket {
  if (!t.due) return "none";
  const now = today();
  if (t.due < now) return t.done ? "later" : "overdue";
  if (t.due === now) return "today";
  return t.due <= addDays(now, 7) ? "week" : "later";
}

export interface Filters {
  q: string;
  statuses: TaskStatus[];
  priorities: (TaskPriority | "none")[];
  owners: string[];
  clients: string[];
  due: "any" | "overdue" | "week" | "none";
  showDone: boolean;
}
export const noFilters: Filters = { q: "", statuses: [], priorities: [], owners: [], clients: [], due: "any", showDone: false };
/** How many filters are narrowing the view (search and the done toggle aside). */
export const activeFilters = (f: Filters) => f.statuses.length + f.priorities.length + f.owners.length + f.clients.length + (f.due !== "any" ? 1 : 0);

export function applyFilters(rows: Row[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  return rows.filter(({ client, task: t }) => {
    const s = statusOf(t);
    if (!f.showDone && s === "done" && !f.statuses.includes("done")) return false;
    if (f.statuses.length && !f.statuses.includes(s)) return false;
    if (f.priorities.length && !f.priorities.includes(t.priority ?? "none")) return false;
    if (f.owners.length && !f.owners.includes(t.owner ?? "")) return false;
    if (f.clients.length && !f.clients.includes(client.id)) return false;
    if (f.due === "overdue" && !isOverdue(t)) return false;
    if (f.due === "week" && !(t.due && !t.done && t.due <= addDays(today(), 7))) return false;
    if (f.due === "none" && t.due) return false;
    if (q && !`${t.title} ${t.description ?? ""} ${client.name} ${t.owner ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export type GroupBy = "status" | "priority" | "owner" | "client" | "due" | "none";
export const groupings: { id: GroupBy; name: string }[] = [
  { id: "status", name: "Status" }, { id: "priority", name: "Priority" }, { id: "owner", name: "Assignee" }, { id: "client", name: "Client" }, { id: "due", name: "Due date" }, { id: "none", name: "No grouping" },
];
export interface Group { id: string; name: string; rows: Row[] }

/** Splits rows into groups, in the group's natural order. Empty status and priority groups stay, so there's a place to drop. */
export function groupRows(rows: Row[], by: GroupBy, clients: Client[]): Group[] {
  const pick = (id: string, name: string, test: (r: Row) => boolean) => ({ id, name, rows: rows.filter(test) });
  switch (by) {
    case "status": return statuses.map((s) => pick(s.id, s.name, (r) => statusOf(r.task) === s.id));
    case "priority": return [...priorities.map((p) => pick(p.id, p.name, (r) => r.task.priority === p.id)), pick("none", "No priority", (r) => !r.task.priority)];
    case "owner": return [...people.map((p) => pick(p.id, p.name, (r) => r.task.owner === p.id)), pick("", "Unassigned", (r) => !r.task.owner)].filter((g) => g.rows.length || g.id !== "");
    case "client": return clients.map((c) => pick(c.id, c.name, (r) => r.client.id === c.id)).filter((g) => g.rows.length);
    case "due": return dueBuckets.map((b) => pick(b.id, b.name, (r) => dueBucket(r.task) === b.id)).filter((g) => g.rows.length);
    default: return [{ id: "all", name: "All tasks", rows }];
  }
}

export type SortKey = "due" | "priority" | "title" | "client" | "status" | "owner";
export interface Sort { key: SortKey; direction: "asc" | "desc" }
export const sortings: { id: SortKey; name: string }[] = [
  { id: "due", name: "Due date" }, { id: "priority", name: "Priority" }, { id: "status", name: "Status" }, { id: "title", name: "Name" }, { id: "client", name: "Client" }, { id: "owner", name: "Assignee" },
];
const rank = (r: Row, key: SortKey): string | number => {
  switch (key) {
    case "due": return r.task.due ?? "9999-99-99";
    case "priority": return priorities.find((p) => p.id === r.task.priority)?.rank ?? 9;
    case "status": return statuses.findIndex((s) => s.id === statusOf(r.task));
    case "client": return r.client.name.toLowerCase();
    case "owner": return (r.task.owner ?? "~").toLowerCase();
    default: return r.task.title.toLowerCase();
  }
};
export function sortRows(rows: Row[], { key, direction }: Sort) {
  const dir = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => { const x = rank(a, key), y = rank(b, key); return x < y ? -dir : x > y ? dir : a.task.title.localeCompare(b.task.title); });
}

/** Saved views in the left bar, like a project tool's favourites: each one a set of filters. */
export const presets: { id: string; name: string; filters: Partial<Filters>; group?: GroupBy }[] = [
  { id: "open", name: "All open tasks", filters: {} },
  { id: "week", name: "Due this week", filters: { due: "week" }, group: "due" },
  { id: "overdue", name: "Overdue", filters: { due: "overdue" } },
  { id: "urgent", name: "Urgent and high", filters: { priorities: ["urgent", "high"] }, group: "priority" },
  { id: "waiting", name: "Waiting on clients", filters: { owners: ["Client"] }, group: "client" },
];
