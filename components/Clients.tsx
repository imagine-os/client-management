"use client";
import { Badge, Button, Field, IconButton, Input, Menu, Modal, RadioGroup, SegmentedControl, Select, Skeleton, Tab, TabList, TabPanel, Tabs, Table, Textarea, cx, useToast, type Column } from "@ds/components";
import { ArrowLeft, ArrowRight, ArrowUpRight, Briefcase, CalendarClock, Check, Columns3, ExternalLink, FileText, FolderPlus, GripVertical, LayoutGrid, List, ListTodo, MessageSquare, MonitorSmartphone, MoreHorizontal, Plus, RotateCcw, Table2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { shortDate, stageTone, stages, uid, useClients, type Client, type ClientStage } from "@/lib/clients";
import { scoped, useTeam } from "@/lib/team";
import { progressOf, projectTypes, templateFor, type LocalProject, type ProjectType } from "@/lib/template";
import { MainNav, Shell, SideLink, SideSection } from "./Shell";
import { Tick } from "./tasks/parts";
import { TaskViews } from "./tasks/TaskViews";

const DRAG = "application/x-bg-client";

/*
 * /: the studio's client management. A board (or list) of clients by stage; each client's page (/?c=…) has its
 * projects, tasks, milestones, links and notes. "New project" starts a project from the standard template
 * (lib/template.ts). Edits are kept in this browser until there's a backend.
 */

const VIEW_KEY = "cm-clients-view";
type ClientView = "board" | "list" | "grid" | "table";

export function Clients() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { clients: everyone, ready, update, add, reset, addProject } = useClients();
  const team = useTeam();
  // The team switcher scopes the clients in view: the Between Gigs team sees only its own.
  const clients = scoped(everyone, team.id);
  const id = params.get("c");
  const client = clients.find((c) => c.id === id);
  const [view, setView] = React.useState<ClientView>("board");
  const [newProject, setNewProject] = React.useState(params.get("new") === "1");
  const [newClient, setNewClient] = React.useState(false);
  React.useEffect(() => { try { const v = localStorage.getItem(VIEW_KEY); if (v === "board" || v === "list" || v === "grid" || v === "table") setView(v); } catch { /* ignore */ } }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const sidebar = (
    <>
      <MainNav active={client ? undefined : "clients"} clients={clients.length} tasks={clients.reduce((n, c) => n + c.tasks.filter((t) => !t.done).length, 0)} />
      <SideSection title="Clients">
        {clients.map((c) => <SideLink key={c.id} href={`/?c=${c.id}`} label={c.name} icon={<Monogram name={c.name} />} active={client?.id === c.id}
          trailing={c.sample ? <span className="text-caption text-ink-subtle">Sample</span> : undefined} />)}
      </SideSection>
    </>
  );

  const openTasks = clients.reduce((n, c) => n + c.tasks.filter((t) => !t.done).length, 0);
  const commands = clients.map((c) => ({ id: `client-${c.id}`, label: c.name, group: "Clients", icon: <Users />, keywords: `${c.industry} ${c.summary}`, onRun: () => router.push(`/?c=${c.id}`) }));

  return (
    <Shell sidebar={sidebar} sidebarTitle="Clients" commands={commands}
      inspectorTitle={client ? "Client details" : "This week"} inspector={ready ? (client ? <ClientFacts client={client} /> : <Week clients={clients} />) : undefined}
      status={<><span>{clients.length} clients · {openTasks} open tasks</span><span className="max-sm:hidden">Sample clients are fictional; edits are kept in this browser</span></>}>
      {!ready ? (
        <div aria-busy="true" aria-label="Loading clients" className="grid gap-4"><Skeleton className="h-10 w-1/3" /><Skeleton shape="block" className="h-80" /></div>
      ) : client ? (
        <ClientPage key={client.id} client={client} update={update} onNewProject={() => setNewProject(true)} />
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-1">
              <p className="text-eyebrow text-ink-brand uppercase">Client management</p>
              <h1 className="font-display text-display-md text-ink">Clients</h1>
              <p className="max-w-2xl text-body-md text-ink-muted">Every client and where things stand: stage, next step, open tasks and the next milestone. Drag a card to change its stage; open one for its projects and notes.</p>
              {team.id !== "studio" && <p className="text-caption text-ink-subtle">Showing {team.name} only. Switch team from the top bar.</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" iconStart={<Plus />} onClick={() => setNewClient(true)}>Add client</Button>
              <Button variant="primary" iconStart={<FolderPlus />} onClick={() => setNewProject(true)}>New project</Button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <SegmentedControl label="View" size="sm" value={view} onChange={(v) => { setView(v as ClientView); try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } }}
              options={[{ value: "board", label: "Board", icon: <Columns3 /> }, { value: "list", label: "List", icon: <List /> }, { value: "grid", label: "Grid", icon: <LayoutGrid /> }, { value: "table", label: "Table", icon: <Table2 /> }]} />
            <Button size="sm" variant="ghost" iconStart={<RotateCcw />} onClick={() => { reset(); toast({ message: "Clients reset to the sample", tone: "success" }); }}>Reset sample</Button>
          </div>
          {view === "board" && <Board clients={clients} update={update} />}
          {view === "list" && <ClientList clients={clients} />}
          {view === "grid" && <ClientGrid clients={clients} />}
          {view === "table" && <ClientTable clients={clients} />}
        </>
      )}
      <NewProjectDialog open={newProject} onClose={() => setNewProject(false)} clients={clients} defaultClient={client?.id}
        defaultType={(projectTypes.find((t) => t.id === params.get("type"))?.id)} defaultName={params.get("name") ?? undefined}
        onCreate={(clientId, p) => {
          const project = addProject(clientId, p);
          setNewProject(false);
          toast({ message: `${project.name} started from the template`, tone: "success" });
          router.push(`/?c=${clientId}&tab=projects`);
        }} />
      <NewClientDialog open={newClient} onClose={() => setNewClient(false)} onCreate={(c) => { add(c); setNewClient(false); router.push(`/?c=${c.id}`); }} />
    </Shell>
  );
}

function Monogram({ name }: { name: string }) {
  const letters = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-xs bg-surface-selected font-mono text-data-sm text-ink-brand">{letters}</span>;
}

const nextMilestone = (c: Client) => c.milestones.filter((m) => !m.done).sort((a, b) => a.date.localeCompare(b.date))[0];

function Board({ clients, update }: { clients: Client[]; update: (id: string, fn: (c: Client) => Client) => void }) {
  return (
    <div className="mt-5 -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {/* Columns keep a readable width and scroll sideways, whatever the side bars leave. */}
      <ol className="flex gap-4">
        {stages.map((s) => {
          const here = clients.filter((c) => c.stage === s.id);
          return (
            <Column key={s.id} name={s.name} onDrop={(id) => { const c = clients.find((x) => x.id === id); if (c && c.stage !== s.id) update(id, (x) => ({ ...x, stage: s.id })); }}>
              <div className="flex items-baseline justify-between gap-2 px-1">
                <h2 className="text-label-md text-ink">{s.name} <span className="text-ink-subtle tabular-nums">{here.length}</span></h2>
                <span className="text-caption text-ink-subtle">{s.sub}</span>
              </div>
              {here.length === 0 && <p className="border-t border-dashed border-line-dashed px-1 pt-3 text-body-sm text-ink-subtle">No clients here</p>}
              {here.map((c) => <ClientCard key={c.id} c={c} update={update} />)}
            </Column>
          );
        })}
      </ol>
    </div>
  );
}

/** A board column that takes a dragged client card. */
function Column({ name, onDrop, children }: { name: string; onDrop: (id: string) => void; children: React.ReactNode }) {
  const [over, setOver] = React.useState(false);
  return (
    <li data-stage={name} className={cx("flex w-64 shrink-0 flex-col gap-2 border-t-4 border-line-strong pt-3 transition-colors duration-fast", over && "bg-surface-selected")}
      onDragOver={(e) => { if (e.dataTransfer.types.includes(DRAG)) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false); }}
      onDrop={(e) => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData(DRAG); if (id) onDrop(id); }}>
      {children}
    </li>
  );
}

function ClientCard({ c, update }: { c: Client; update: (id: string, fn: (c: Client) => Client) => void }) {
  const open = c.tasks.filter((t) => !t.done).length;
  const m = nextMilestone(c);
  const count = c.linked.length + c.local.length;
  return (
    <article draggable onDragStart={(e) => { e.dataTransfer.setData(DRAG, c.id); e.dataTransfer.effectAllowed = "move"; }}
      className="group relative grid cursor-grab gap-2 border-t border-line bg-surface px-3 pt-3 pb-4 transition-colors duration-fast hover:bg-surface-hover active:cursor-grabbing">
      <GripVertical aria-hidden="true" className="absolute top-2 left-1 size-4 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-heading-md text-ink">
          <Link href={`/?c=${c.id}`} className="inline-flex min-h-11 items-center rounded-xs underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-focus sm:min-h-8">{c.name}</Link>
        </h3>
        <Menu align="end" trigger={<IconButton label={`Move ${c.name} to another stage`} variant="ghost" size="sm" icon={<MoreHorizontal />} />}
          items={[{ heading: "Move to" }, ...stages.map((s) => ({ label: s.name, checked: c.stage === s.id, onSelect: () => update(c.id, (x) => ({ ...x, stage: s.id })) }))]} />
      </div>
      <p className="text-caption text-ink-subtle">{c.industry}{c.sample && " · Sample"}</p>
      <p className="text-body-sm text-ink-muted">{c.nextStep}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-subtle">
        <span className="inline-flex items-center gap-1"><ListTodo className="size-3.5" aria-hidden="true" />{open} open</span>
        <span className="inline-flex items-center gap-1"><Briefcase className="size-3.5" aria-hidden="true" />{count} {count === 1 ? "project" : "projects"}</span>
        {m && <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden="true" />{shortDate(m.date)}</span>}
      </p>
    </article>
  );
}

/** Clients as cards: stage, what's next, how far the milestones are, and who's on it. */
function ClientGrid({ clients }: { clients: Client[] }) {
  return (
    <ul className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
      {clients.map((c) => {
        const done = c.milestones.filter((m) => m.done).length;
        const pct = c.milestones.length ? Math.round((done / c.milestones.length) * 100) : 0;
        const m = nextMilestone(c);
        return (
          <li key={c.id} className="grid content-start gap-3 border-t-4 border-line-strong pt-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-heading-lg text-ink"><Link href={`/?c=${c.id}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline sm:min-h-8">{c.name}</Link></h2>
              <Badge tone={stageTone[c.stage]} size="sm">{stages.find((s) => s.id === c.stage)?.name}</Badge>
            </div>
            <p className="text-caption text-ink-subtle">{c.industry}{c.sample && " · Sample"}</p>
            <p className="text-body-sm text-ink-muted">{c.nextStep}</p>
            <div className="flex items-center gap-3">
              <span className="h-1.5 flex-1 overflow-hidden bg-surface-sunken"><span className="block h-full bg-ink" style={{ width: `${pct}%` }} /></span>
              <span className="text-caption text-ink-subtle tabular-nums">{done}/{c.milestones.length} milestones</span>
            </div>
            <p className="flex flex-wrap gap-x-3 text-caption text-ink-subtle"><span>{c.tasks.filter((t) => !t.done).length} open tasks</span>{m && <span>Next: {shortDate(m.date)}</span>}</p>
          </li>
        );
      })}
    </ul>
  );
}

type ClientSortKey = "name" | "stage" | "open" | "next" | "started";
/** Clients as a sortable table. */
function ClientTable({ clients }: { clients: Client[] }) {
  const [sort, setSort] = React.useState<{ key: ClientSortKey; direction: "asc" | "desc" }>({ key: "stage", direction: "asc" });
  const val = (c: Client): string | number => sort.key === "name" ? c.name.toLowerCase() : sort.key === "stage" ? stages.findIndex((s) => s.id === c.stage) : sort.key === "open" ? c.tasks.filter((t) => !t.done).length : sort.key === "next" ? nextMilestone(c)?.date ?? "9999" : c.started;
  const rows = [...clients].sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * (sort.direction === "asc" ? 1 : -1); });
  const columns: Column<Client>[] = [
    { key: "name", header: "Client", sortable: true, cell: (c) => <Link href={`/?c=${c.id}`} className="inline-flex min-h-11 items-center text-label-md text-ink underline-offset-4 hover:underline sm:min-h-8">{c.name}</Link> },
    { key: "stage", header: "Stage", sortable: true, cell: (c) => <Badge tone={stageTone[c.stage]} size="sm">{stages.find((s) => s.id === c.stage)?.name}</Badge> },
    { key: "industry", header: "What they do", cell: (c) => <span className="text-body-sm whitespace-nowrap text-ink-muted">{c.industry}</span> },
    { key: "open", header: "Open tasks", sortable: true, numeric: true, cell: (c) => c.tasks.filter((t) => !t.done).length },
    { key: "next", header: "Next milestone", sortable: true, cell: (c) => { const m = nextMilestone(c); return <span className="text-body-sm whitespace-nowrap text-ink-muted">{m ? `${shortDate(m.date)} · ${m.title}` : "None set"}</span>; } },
    { key: "started", header: "Since", sortable: true, cell: (c) => <span className="text-body-sm whitespace-nowrap text-ink-muted">{shortDate(c.started)}</span> },
  ];
  return <Table className="mt-5" caption="Clients" columns={columns} rows={rows} rowKey={(c) => c.id} sort={sort} onSortChange={(s) => setSort({ key: s.key as ClientSortKey, direction: s.direction })} />;
}

function ClientList({ clients }: { clients: Client[] }) {
  return (
    <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {clients.map((c) => {
        const m = nextMilestone(c);
        return (
          <li key={c.id} className="row-lift flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-label-md text-ink"><Link href={`/?c=${c.id}`} className="inline-flex min-h-11 items-center rounded-xs underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-focus sm:min-h-6">{c.name}</Link>{c.sample && <span className="ml-2 text-caption text-ink-subtle">Sample</span>}</h2>
              <p className="truncate text-body-sm text-ink-muted">{c.nextStep}</p>
            </div>
            <Badge tone={stageTone[c.stage]} size="sm">{stages.find((s) => s.id === c.stage)?.name}</Badge>
            <span className="w-24 text-caption text-ink-subtle tabular-nums max-md:hidden">{c.tasks.filter((t) => !t.done).length} open</span>
            <span className="w-32 text-caption text-ink-subtle max-md:hidden">{m ? `${m.title.slice(0, 18)}${m.title.length > 18 ? "…" : ""} · ${shortDate(m.date)}` : "No milestone"}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ClientPage({ client: c, update, onNewProject }: { client: Client; update: (id: string, fn: (c: Client) => Client) => void; onNewProject: () => void }) {
  const params = useSearchParams();
  const [tab, setTab] = React.useState(params.get("tab") ?? "overview");
  // A link to a tab (?tab=projects, e.g. right after New project) switches to it.
  const wanted = params.get("tab");
  React.useEffect(() => { if (wanted) setTab(wanted); }, [wanted]); // eslint-disable-line react-hooks/set-state-in-effect
  const set = (fn: (c: Client) => Client) => update(c.id, fn);
  const linked = c.linked;
  const open = c.tasks.filter((t) => !t.done);
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-body-sm text-ink-muted hover:text-ink sm:min-h-8"><ArrowLeft className="size-4" aria-hidden="true" />All clients</Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-eyebrow text-ink-brand uppercase">{c.industry.split("·")[0].trim()}</p>
            <h1 className="font-display text-display-md text-ink">{c.name}</h1>
            <p className="max-w-2xl text-body-md text-ink-muted">{c.summary}</p>
            {c.sample && <p className="text-caption text-ink-subtle">A fictional sample client.</p>}
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Stage"><Select value={c.stage} onChange={(e) => set((x) => ({ ...x, stage: e.target.value as ClientStage }))} className="w-40" options={stages.map((s) => ({ value: s.id, label: s.name }))} /></Field>
            <Link href={`/portal/?c=${c.id}`} className="inline-flex h-10 items-center gap-2 rounded-md border border-line-strong px-3 text-label-md text-ink hover:bg-surface-hover"><MonitorSmartphone className="size-4" aria-hidden="true" />Client portal</Link>
            <Button variant="primary" iconStart={<FolderPlus />} onClick={onNewProject}>New project</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-selected p-4">
        <ArrowRight className="size-5 shrink-0 text-ink-brand" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-body-md text-ink"><b className="text-label-md">Next step</b> · {c.nextStep}</p>
      </div>

      <Tabs value={tab} onChange={setTab}>
        <TabList label="Client sections">
          <Tab value="overview">Overview</Tab>
          <Tab value="projects" count={linked.length + c.local.length}>Projects</Tab>
          <Tab value="tasks" count={open.length}>Tasks</Tab>
          <Tab value="notes" count={c.notes.length}>Notes</Tab>
        </TabList>

        <TabPanel value="overview" className="grid gap-6 pt-6 lg:grid-cols-2">
          <section aria-labelledby="ms-h" className="border-t-2 border-line-strong pt-4">
            <h2 id="ms-h" className="font-display text-heading-lg text-ink">Milestones</h2>
            {c.milestones.length === 0 ? <p className="mt-2 text-body-sm text-ink-muted">No milestones yet.</p> : (
              <ol className="mt-4 grid gap-0">
                {[...c.milestones].sort((a, b) => a.date.localeCompare(b.date)).map((m, i, all) => (
                  <li key={m.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < all.length - 1 && <span aria-hidden="true" className="absolute top-7 bottom-0 left-3 w-px bg-line" />}
                    <button type="button" aria-pressed={m.done} aria-label={`${m.title}: mark ${m.done ? "not done" : "done"}`}
                      onClick={() => set((x) => ({ ...x, milestones: x.milestones.map((y) => (y.id === m.id ? { ...y, done: !y.done } : y)) }))}
                      className={cx("relative grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors before:absolute before:-inset-2.5", m.done ? "border-ink bg-ink text-bg" : "border-line-strong bg-surface hover:border-ink-brand")}>
                      {m.done && <Check className="size-3.5" aria-hidden="true" />}
                    </button>
                    <div className="grid">
                      <span className={cx("text-body-md", m.done ? "text-ink-muted" : "text-ink")}>{m.title}</span>
                      <span className="text-caption text-ink-subtle">{shortDate(m.date)}{m.done ? " · done" : ""}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <div className="grid content-start gap-6">
            <section aria-labelledby="who-h" className="border-t-2 border-line-strong pt-4">
              <h2 id="who-h" className="font-display text-heading-lg text-ink">People</h2>
              <ul className="mt-3 grid gap-2">{c.contacts.map((p) => <li key={p.name} className="flex items-center gap-3"><Monogram name={p.name} /><span className="text-body-md text-ink">{p.name}</span><span className="text-body-sm text-ink-subtle">{p.role}</span></li>)}</ul>
            </section>
            {c.links.length > 0 && (
              <section aria-labelledby="links-h" className="border-t-2 border-line-strong pt-4">
                <h2 id="links-h" className="font-display text-heading-lg text-ink">Links</h2>
                <ul className="mt-2 grid">{c.links.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-body-md text-link underline-offset-2 hover:underline">{l.label}<ExternalLink className="size-3.5" aria-hidden="true" /></a></li>)}</ul>
              </section>
            )}
          </div>
        </TabPanel>

        <TabPanel value="projects" className="grid gap-6 pt-6">
          {c.local.length > 0 && (
            <section aria-labelledby="new-h" className="grid gap-3">
              <h2 id="new-h" className="text-label-md text-ink-muted">Started from the template</h2>
              {c.local.map((p) => <TemplateProject key={p.id} p={p} onChange={(np) => set((x) => ({ ...x, local: x.local.map((y) => (y.id === np.id ? np : y)) }))} />)}
            </section>
          )}
          {linked.length > 0 ? (
            <section aria-labelledby="ws-h" className="grid gap-3">
              <h2 id="ws-h" className="text-label-md text-ink-muted">In {c.name}'s workspace</h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {linked.map((p) => (
                  <li key={p.id}>
                    <a href={p.href} target="_blank" rel="noreferrer" className="group grid h-full gap-1 border-t-2 border-line-strong bg-surface px-1 pt-3 pb-4 transition-colors duration-fast hover:bg-surface-hover">
                      <span className="flex items-start justify-between gap-2"><b className="font-display text-heading-md text-ink">{p.name}</b><ArrowUpRight className="size-4 shrink-0 text-ink-subtle group-hover:text-ink" aria-hidden="true" /></span>
                      <span className="line-clamp-2 text-body-sm text-ink-muted">{p.summary}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : c.local.length === 0 && (
            <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-line-strong p-10 text-center">
              <FolderPlus className="size-6 text-ink-subtle" aria-hidden="true" />
              <p className="text-heading-md text-ink">No projects yet</p>
              <p className="max-w-sm text-body-sm text-ink-muted">Start one from the standard template.</p>
            </div>
          )}
        </TabPanel>

        <TabPanel value="tasks" className="pt-6"><TaskViews clients={[c]} scope={c.id} storageKey="cm-client-tasks" /></TabPanel>
        <TabPanel value="notes" className="pt-6"><Notes c={c} set={set} /></TabPanel>
      </Tabs>
    </div>
  );
}

function TemplateProject({ p, onChange }: { p: LocalProject; onChange: (p: LocalProject) => void }) {
  const pct = Math.round(progressOf(p) * 100);
  const type = projectTypes.find((t) => t.id === p.type);
  return (
    <article className="border-t-2 border-line-strong pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-heading-lg text-ink">{p.name}</h3>
        <span className="text-caption text-ink-subtle">{type?.name} · starts {shortDate(p.start)} · in this browser</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken"><span className="block h-full rounded-full bg-action transition-all duration-slow" style={{ width: `${pct}%` }} /></span>
        <span className="w-10 text-right text-label-sm text-ink tabular-nums">{pct}%</span>
      </div>
      <ol className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {p.phases.map((ph, i) => (
          <li key={ph.name} className="rounded-xl bg-surface-sunken p-3">
            <h4 className="text-label-md text-ink"><span className="text-ink-subtle tabular-nums">0{i + 1}</span> {ph.name}</h4>
            <ul className="mt-1 grid">
              {ph.items.map((it) => (
                <li key={it.title}>
                  <Tick label={it.title} done={it.done}
                    onToggle={() => onChange({ ...p, phases: p.phases.map((x) => (x.name === ph.name ? { ...x, items: x.items.map((y) => (y.title === it.title ? { ...y, done: !y.done } : y)) } : x)) })} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}




function Notes({ c, set }: { c: Client; set: (fn: (c: Client) => Client) => void }) {
  const [text, setText] = React.useState("");
  const [err, setErr] = React.useState<string>();
  const notes = [...c.notes].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div className="grid max-w-3xl gap-5">
      <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) { setErr("Write the note first."); return; } set((x) => ({ ...x, notes: [...x.notes, { id: uid(), at: new Date().toISOString(), by: "JAM Studio", text: text.trim() }] })); setText(""); setErr(undefined); }}>
        <Field label="Add a note" error={err} hint={err ? undefined : "Decisions, requests and what was agreed. Kept with the client."}><Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} /></Field>
        <div><Button type="submit" variant="secondary" iconStart={<MessageSquare />}>Save note</Button></div>
      </form>
      {notes.length === 0 ? <p className="text-body-md text-ink-muted">No notes yet.</p> : (
        <ol className="grid gap-3">
          {notes.map((n) => (
            <li key={n.id} className="border-t border-line pt-3">
              <p className="text-caption text-ink-subtle">{n.by} · {new Date(n.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
              <p className="mt-1 text-body-md whitespace-pre-line text-ink">{n.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ClientFacts({ client: c }: { client: Client }) {
  const m = nextMilestone(c);
  const done = c.tasks.filter((t) => t.done).length;
  return (
    <div className="grid">
      <section className="grid gap-3 p-5">
        <p className="text-eyebrow text-ink-brand uppercase">Client</p>
        <h2 className="font-display text-heading-lg text-ink">{c.name}</h2>
        <dl className="grid gap-3 text-body-sm">
          <div className="grid gap-0.5"><dt className="text-caption text-ink-subtle">Stage</dt><dd><Badge tone={stageTone[c.stage]} size="sm">{stages.find((s) => s.id === c.stage)?.name}</Badge></dd></div>
          <div className="grid gap-0.5"><dt className="text-caption text-ink-subtle">Working together since</dt><dd className="text-ink">{shortDate(c.started)}</dd></div>
          <div className="grid gap-0.5"><dt className="text-caption text-ink-subtle">Next milestone</dt><dd className="text-ink">{m ? `${m.title} · ${shortDate(m.date)}` : "None set"}</dd></div>
          <div className="grid gap-0.5"><dt className="text-caption text-ink-subtle">Tasks</dt><dd className="text-ink">{done} of {c.tasks.length} done</dd></div>
        </dl>
      </section>
    </div>
  );
}

/** With no client open, the details bar is the week: what's due across every client. */
function Week({ clients }: { clients: Client[] }) {
  const due = clients.flatMap((c) => c.tasks.filter((t) => !t.done && t.due).map((t) => ({ c, t }))).sort((a, b) => (a.t.due ?? "").localeCompare(b.t.due ?? "")).slice(0, 8);
  return (
    <section className="grid gap-3 p-5">
      <p className="text-eyebrow text-ink-brand uppercase">Coming up</p>
      <h2 className="font-display text-heading-lg text-ink">Due next</h2>
      {due.length === 0 ? <p className="text-body-sm text-ink-muted">Nothing due.</p> : (
        <ul className="grid gap-1">
          {due.map(({ c, t }) => (
            <li key={`${c.id}-${t.id}`}>
              <Link href={`/?c=${c.id}&tab=tasks`} className="grid min-h-11 gap-0.5 rounded-md px-2 py-1.5 hover:bg-surface-hover">
                <span className="text-body-sm text-ink">{t.title}</span>
                <span className="text-caption text-ink-subtle">{c.name} · due {shortDate(t.due!)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function NewProjectDialog({ open, onClose, clients, defaultClient, defaultType, defaultName, onCreate }: {
  open: boolean; onClose: () => void; clients: Client[]; defaultClient?: string; defaultType?: ProjectType; defaultName?: string;
  onCreate: (clientId: string, p: { name: string; type: ProjectType; start: string }) => void;
}) {
  const [clientId, setClientId] = React.useState(defaultClient ?? clients[0]?.id ?? "");
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<ProjectType>("website");
  const [start, setStart] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [err, setErr] = React.useState<string>();
  // From the template gallery, the type (and maybe a name) arrive chosen.
  React.useEffect(() => {
    if (!open) return;
    setClientId(defaultClient ?? clients[0]?.id ?? ""); setErr(undefined); // eslint-disable-line react-hooks/set-state-in-effect
    if (defaultType) setType(defaultType);
    if (defaultName) setName(defaultName);
  }, [open, defaultClient, defaultType, defaultName, clients]);
  const plan = templateFor(type);
  return (
    <Modal open={open} onClose={onClose} size="lg" title="New project" description="Starts from the standard client project template. You can tick things off as the project moves."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" iconStart={<FolderPlus />} onClick={() => { if (!name.trim()) { setErr("Give the project a name."); return; } onCreate(clientId, { name: name.trim(), type, start }); setName(""); }}>Create project</Button></>}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid content-start gap-4">
          <Field label="Client"><Select value={clientId} onChange={(e) => setClientId(e.target.value)} options={clients.map((c) => ({ value: c.id, label: c.name }))} /></Field>
          <Field label="Project name" error={err}><Input value={name} onChange={(e) => { setName(e.target.value); setErr(undefined); }} placeholder="e.g. Portfolio site" /></Field>
          <RadioGroup name="np-type" label="Type" value={type} onChange={(v) => setType(v as ProjectType)} options={projectTypes.map((t) => ({ value: t.id, label: t.name, description: t.sub }))} />
          <Field label="Start date"><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        </div>
        <section aria-labelledby="np-plan" className="rounded-2xl bg-surface-sunken p-4">
          <h3 id="np-plan" className="flex items-center gap-2 text-label-md text-ink"><FileText className="size-4 text-ink-brand" aria-hidden="true" />What the template sets up</h3>
          <ol className="mt-3 grid gap-3">
            {plan.map((ph, i) => (
              <li key={ph.name}>
                <p className="text-label-sm text-ink"><span className="text-ink-subtle tabular-nums">0{i + 1}</span> {ph.name}</p>
                <ul className="mt-1 grid gap-0.5 pl-6 text-body-sm text-ink-muted">{ph.items.map((it) => <li key={it.title} className="list-disc">{it.title}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Modal>
  );
}

function NewClientDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (c: Client) => void }) {
  const [name, setName] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [err, setErr] = React.useState<string>();
  return (
    <Modal open={open} onClose={onClose} size="md" title="Add a client" description="Starts as a lead. Add projects, tasks and notes from their page."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" iconStart={<Plus />} onClick={() => {
        if (!name.trim()) { setErr("Enter the client's name."); return; }
        onCreate({ id: `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${uid()}`, name: name.trim(), stage: "lead", industry: industry.trim() || "Client", summary: "", nextStep: "Book a discovery call.", started: new Date().toISOString().slice(0, 10), contacts: [], linked: [], local: [], links: [], tasks: [], milestones: [], notes: [] });
        setName(""); setIndustry(""); setErr(undefined);
      }}>Add client</Button></>}>
      <div className="grid gap-4">
        <Field label="Client name" error={err}><Input value={name} onChange={(e) => { setName(e.target.value); setErr(undefined); }} /></Field>
        <Field label="What they do" optional><Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Restaurant group" /></Field>
      </div>
    </Modal>
  );
}
