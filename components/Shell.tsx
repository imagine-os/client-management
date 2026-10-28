"use client";
import { CommandPalette, Drawer, IconButton, Kbd, Menu, Modal, Popover, ThemeToggle, cx, useCommandShortcut, type Command } from "@ds/components";
import { Bell, Building2, ListChecks, CalendarClock, ChevronsUpDown, CircleHelp, FolderPlus, LayoutTemplate, Moon, PanelLeft, PanelRight, Search, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { shortDate, useClients } from "@/lib/clients";
import { scoped, teamStore, teams, useTeam } from "@/lib/team";
import { Wordmark } from "./Wordmark";

/*
 * The shell: one frame around the client tools. Top bar with the team switcher and ⌘K search, a left bar for where
 * you are, the work in the middle, a right bar for details, and a status bar along the bottom. [ and ] toggle the
 * side bars; on phones and tablets they open as drawers.
 */

const SIDEBAR_KEY = "cm-sidebar";
const INSPECTOR_KEY = "cm-inspector";
const read = (k: string, d: boolean) => { try { const v = localStorage.getItem(k); return v === null ? d : v === "1"; } catch { return d; } };
const write = (k: string, v: boolean) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch { /* ignore */ } };

interface ShellProps {
  sidebar: React.ReactNode;
  sidebarTitle: string;
  inspector?: React.ReactNode;
  inspectorTitle?: string;
  /** Left side of the status bar. */
  status?: React.ReactNode;
  /** Extra commands for ⌘K, on top of going places and switching team. */
  commands?: Command[];
  children: React.ReactNode;
}

export function Shell({ sidebar, sidebarTitle, inspector, inspectorTitle = "Details", status, commands = [], children }: ShellProps) {
  const router = useRouter();
  const [left, setLeft] = React.useState(true);
  const [right, setRight] = React.useState(true);
  const [leftDrawer, setLeftDrawer] = React.useState(false);
  const [rightDrawer, setRightDrawer] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const [help, setHelp] = React.useState(false);
  const team = useTeam();
  React.useEffect(() => { setLeft(read(SIDEBAR_KEY, true)); setRight(read(INSPECTOR_KEY, true)); }, []); // eslint-disable-line react-hooks/set-state-in-effect
  useCommandShortcut(React.useCallback(() => setPalette(true), []));
  // The palette's field is a search box; say so, so it isn't read as a placeholder-only text field
  // (requested upstream in docs/design-system-requests.md).
  // React clears the attribute on every keystroke, so keep it set.
  React.useEffect(() => {
    const el = document.querySelector("dialog input[aria-label='Search commands']");
    if (!el) return;
    const fix = () => { if (el.getAttribute("type") !== "search") el.setAttribute("type", "search"); };
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(el, { attributes: true, attributeFilter: ["type"] });
    return () => mo.disconnect();
  }, []);

  const wide = () => typeof window !== "undefined" && window.matchMedia("(min-width: 64rem)").matches;
  const xl = () => typeof window !== "undefined" && window.matchMedia("(min-width: 80rem)").matches;
  const toggleLeft = React.useCallback(() => { if (wide()) setLeft((v) => { write(SIDEBAR_KEY, !v); return !v; }); else setLeftDrawer((v) => !v); }, []);
  const toggleRight = React.useCallback(() => { if (xl()) setRight((v) => { write(INSPECTOR_KEY, !v); return !v; }); else setRightDrawer((v) => !v); }, []);

  // [ and ] toggle the side bars, unless someone is typing.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.key === "[") { e.preventDefault(); toggleLeft(); }
      if (e.key === "]" && inspector) { e.preventDefault(); toggleRight(); }
      if (e.key === "?") { e.preventDefault(); setHelp(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleLeft, toggleRight, inspector]);

  const all: Command[] = [
    ...commands,
    { id: "clients", label: "Clients", group: "Go to", icon: <Users />, keywords: "client management crm board tasks milestones", onRun: () => router.push("/") },
    { id: "tasks", label: "Tasks", group: "Go to", icon: <ListChecks />, keywords: "to do list board kanban calendar table", onRun: () => router.push("/tasks/") },
    { id: "templates", label: "Templates", group: "Go to", icon: <LayoutTemplate />, keywords: "start gallery new", onRun: () => router.push("/templates/") },
    { id: "new-project", label: "New project from the template", group: "Actions", icon: <FolderPlus />, keywords: "create start client template", onRun: () => router.push("/?new=1") },
    { id: "shortcuts", label: "Keyboard shortcuts", group: "Help", icon: <CircleHelp />, shortcut: ["?"], onRun: () => setHelp(true) },
    ...teams.map((t) => ({ id: `team-${t.id}`, label: `Switch to ${t.name}`, group: "Team", icon: <Building2 />, onRun: () => teamStore.set(t.id) })),
    { id: "sidebar", label: "Show or hide the left bar", group: "View", icon: <PanelLeft />, shortcut: ["["], onRun: toggleLeft },
    ...(inspector ? [{ id: "inspector", label: "Show or hide details", group: "View", icon: <PanelRight />, shortcut: ["]"], onRun: toggleRight }] : []),
    { id: "theme", label: "Switch day or night", group: "View", icon: <Moon />, onRun: () => document.querySelector<HTMLElement>("[data-cm-theme] button")?.click() },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-ink">
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b-2 border-line-strong bg-surface px-2 sm:gap-2 sm:px-3">
        <IconButton label="Open the left bar" variant="ghost" icon={<PanelLeft />} className="lg:hidden" onClick={() => setLeftDrawer(true)} />
        <Link href="/" aria-label="Clients home" className="inline-flex min-h-11 shrink-0 items-center px-1"><Wordmark compact /></Link>
        <Menu align="start" header={<span className="text-caption text-ink-subtle">Team</span>} items={teams.map((t) => ({ label: t.name, description: t.sub, icon: <Building2 />, checked: team.id === t.id, onSelect: () => teamStore.set(t.id) }))} trigger={
          <button type="button" aria-label={`Switch team. Now: ${team.name}`} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-label-md text-ink hover:bg-surface-hover max-md:px-1">
            <span className="max-md:sr-only">{team.name}</span><ChevronsUpDown className="size-4 text-ink-subtle" aria-hidden="true" />
          </button>
        } />
        <button type="button" onClick={() => setPalette(true)} aria-label="Search clients and actions" aria-keyshortcuts="Meta+K Control+K"
          className="ml-auto inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border border-line bg-surface-sunken px-2.5 text-body-sm text-ink-subtle transition-colors hover:border-line-strong hover:text-ink md:w-72 md:justify-start lg:w-80">
          <Search className="size-4 shrink-0" aria-hidden="true" /><span className="flex-1 text-left max-md:hidden">Search or jump to…</span><Kbd keys={["⌘", "K"]} className="max-md:hidden" />
        </button>
        <Notifications />
        <IconButton label="Keyboard shortcuts (?)" variant="ghost" icon={<CircleHelp />} className="max-sm:hidden" onClick={() => setHelp(true)} />
        <IconButton label={left ? "Hide the left bar ([)" : "Show the left bar ([)"} variant="ghost" icon={<PanelLeft />} pressed={left} className="max-lg:hidden" onClick={toggleLeft} />
        {inspector && <IconButton label={right ? "Hide details (])" : "Show details (])"} variant="ghost" icon={<PanelRight />} pressed={right} className="max-xl:hidden" onClick={toggleRight} />}
        {inspector && <IconButton label="Show details" variant="ghost" icon={<PanelRight />} className="xl:hidden" onClick={() => setRightDrawer(true)} />}
        <span data-cm-theme="" className="inline-flex max-sm:hidden"><ThemeToggle size="sm" showLabel={false} /></span>
      </header>

      <div className="flex min-h-0 flex-1">
        {left && (
          <aside aria-label={sidebarTitle} className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface lg:flex">
            <nav aria-label={sidebarTitle} className="grid content-start gap-5 p-3">{sidebar}</nav>
          </aside>
        )}
        <main id="main" tabIndex={-1} className="relative min-w-0 flex-1 overflow-y-auto outline-none">
          <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">{children}</div>
        </main>
        {inspector && right && (
          <aside aria-label={inspectorTitle} className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-line bg-surface xl:flex">{inspector}</aside>
        )}
      </div>

      <footer className="flex h-9 shrink-0 items-center gap-3 border-t border-line bg-surface px-3 text-caption text-ink-subtle">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden whitespace-nowrap">{status}</div>
        <BuildStamp />
        <span className="flex shrink-0 items-center gap-3 max-md:hidden">
          <span className="flex items-center gap-1.5"><Kbd keys={["⌘", "K"]} />Search</span>
          <span className="flex items-center gap-1.5"><Kbd keys={["["]} />Left</span>
          {inspector && <span className="flex items-center gap-1.5"><Kbd keys={["]"]} />Details</span>}
          <button type="button" onClick={() => setHelp(true)} className="flex min-h-6 items-center gap-1.5 hover:text-ink"><Kbd keys={["?"]} />Shortcuts</button>
        </span>
      </footer>

      <Drawer side="left" open={leftDrawer} onClose={() => setLeftDrawer(false)} title={sidebarTitle}>
        <nav aria-label={sidebarTitle} className="grid gap-5" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setLeftDrawer(false); }}>{sidebar}</nav>
      </Drawer>
      {inspector && <Drawer side="right" size="md" open={rightDrawer} onClose={() => setRightDrawer(false)} title={inspectorTitle}><div className="-mx-5">{inspector}</div></Drawer>}
      <Modal open={help} onClose={() => setHelp(false)} title="Keyboard shortcuts" description="They work anywhere, except while you're typing.">
        <dl className="grid gap-5 sm:grid-cols-2">
          {shortcuts.map((g) => (
            <div key={g.group} className="grid content-start gap-1">
              <dt className="pb-1 text-eyebrow text-ink-subtle uppercase">{g.group}</dt>
              {g.items.map(([keys, what]) => <dd key={what} className="flex min-h-8 items-center justify-between gap-3 text-body-sm text-ink"><span>{what}</span><Kbd keys={keys} /></dd>)}
            </div>
          ))}
        </dl>
      </Modal>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={all} placeholder="Search clients and actions…" />
    </div>
  );
}

const shortcuts: { group: string; items: [string[], string][] }[] = [
  { group: "Anywhere", items: [[["⌘", "K"], "Search or jump to…"], [["["], "Show or hide the left bar"], [["]"], "Show or hide details"], [["?"], "These shortcuts"]] },
  { group: "Clients", items: [[["Drag"], "Move a client to another stage"]] },
  { group: "Tasks", items: [[["Drag"], "Move a card to another column or day"], [["↵"], "Save a quick-added task"], [["Esc"], "Close the quick add"]] },
];

/** The bell: client tasks due within three days, for the team in view. */
function Notifications() {
  const router = useRouter();
  const { clients } = useClients();
  const team = useTeam();
  const [open, setOpen] = React.useState(false);
  const [soon] = React.useState(() => new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  const due = scoped(clients, team.id).flatMap((c) => c.tasks.filter((t) => !t.done && t.due && t.due <= soon).map((t) => ({ c, t }))).sort((a, b) => (a.t.due ?? "").localeCompare(b.t.due ?? "")).slice(0, 8);
  const go = (href: string) => { setOpen(false); router.push(href); };
  const row = "flex min-h-11 w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-hover [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-subtle";
  return (
    <Popover align="end" width="md" label="Notifications" open={open} onOpenChange={setOpen}
      trigger={
        <button type="button" aria-label={due.length ? `Notifications, ${due.length} due soon` : "Notifications"} className="relative inline-flex size-10 items-center justify-center rounded-md text-ink-muted hover:bg-surface-hover hover:text-ink">
          <Bell className="size-5" aria-hidden="true" />
          {due.length > 0 && <span aria-hidden="true" className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-ink-brand px-1 text-caption leading-4 text-bg tabular-nums">{due.length > 9 ? "9+" : due.length}</span>}
        </button>
      }>
      <div className="grid max-h-96 gap-3 overflow-y-auto">
        <p className="text-label-md text-ink">Due soon</p>
        {due.length === 0 ? <p className="px-2 text-body-sm text-ink-muted">Nothing due in the next three days.</p> : (
          <section className="grid gap-0.5">
            {due.map(({ c, t }) => (
              <button key={`${c.id}-${t.id}`} type="button" className={row} onClick={() => go(`/?c=${c.id}&tab=tasks`)}>
                <CalendarClock /><span className="grid min-w-0"><span className="text-body-sm text-ink">{t.title}</span><span className="text-caption text-ink-subtle">{c.name} · due {shortDate(t.due!)}{t.owner ? ` · ${t.owner}` : ""}</span></span>
              </button>
            ))}
          </section>
        )}
        <p className="px-2 text-body-sm text-ink-subtle">Kept in this browser. Team-wide notifications come with the backend.</p>
      </div>
    </Popover>
  );
}

/** Which build this is: its commit (linked) and when it was built, in UTC so every viewer reads the same. */
function BuildStamp() {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "";
  const at = process.env.NEXT_PUBLIC_BUILD_TIME;
  if (!sha && !at) return null;
  const when = at ? `${new Date(at).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} UTC` : "";
  const label = [sha && `Build ${sha.slice(0, 7)}`, when].filter(Boolean).join(" · ");
  return sha
    ? <a href={`https://github.com/imagine-os/client-management/commit/${sha}`} target="_blank" rel="noreferrer" className="inline-flex min-h-6 shrink-0 items-center gap-1.5 whitespace-nowrap hover:text-ink max-sm:hidden"><span aria-hidden="true" className="size-2 rounded-full bg-success" />{label}</a>
    : <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap max-sm:hidden"><span aria-hidden="true" className="size-2 rounded-full bg-success" />{label}</span>;
}

/** The places every page's left bar starts with. */
export function MainNav({ active, clients, tasks }: { active?: "clients" | "tasks" | "templates"; clients?: number; tasks?: number }) {
  return (
    <SideSection title="Client management">
      <SideLink href="/" label="Clients" icon={<Users />} count={clients || undefined} active={active === "clients"} />
      <SideLink href="/tasks/" label="Tasks" icon={<ListChecks />} count={tasks || undefined} active={active === "tasks"} />
      <SideLink href="/templates/" label="Templates" icon={<LayoutTemplate />} active={active === "templates"} />
    </SideSection>
  );
}

/** A sidebar row: NavItem's look, as a client-side link. */
export function SideLink({ href, label, icon, count, active, trailing }: { href: string; label: string; icon?: React.ReactNode; count?: number; active?: boolean; trailing?: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={cx("group flex min-h-10 items-center gap-3 border-l-4 px-3 text-label-md transition-colors duration-fast [&_svg]:size-4.5 [&_svg]:shrink-0",
        active ? "border-action bg-surface-selected text-ink" : "border-transparent text-ink-muted hover:bg-surface-hover hover:text-ink")}>
      {icon && <span className={active ? "text-ink-brand" : "text-ink-subtle group-hover:text-ink-muted"}>{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
      {count !== undefined && <span className="text-caption text-ink-subtle tabular-nums">{count}</span>}
    </Link>
  );
}

export function SideSection({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <div className="flex min-h-7 items-center justify-between px-3 pb-1"><span className="text-eyebrow text-ink-subtle uppercase">{title}</span>{action}</div>
      {children}
    </div>
  );
}
