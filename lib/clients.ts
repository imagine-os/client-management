/*
 * Client management: who we're working for, where each relationship stands, their projects, tasks, milestones and
 * notes. Between Gigs is the real client; the others are fictional samples so the board has shape. There's no backend
 * yet: the seed below plus any edits, kept per browser (useClients). Nothing private goes here: this repo is public.
 */
import * as React from "react";
import { newProjectFrom, type LocalProject } from "./template";

export type ClientStage = "lead" | "proposal" | "active" | "paused" | "complete";
export const stages: { id: ClientStage; name: string; sub: string }[] = [
  { id: "lead", name: "Lead", sub: "First conversations" },
  { id: "proposal", name: "Proposal", sub: "Scope and quote out" },
  { id: "active", name: "Active", sub: "Work under way" },
  { id: "paused", name: "Paused", sub: "Waiting on the client" },
  { id: "complete", name: "Complete", sub: "Delivered" },
];
export const stageTone: Record<ClientStage, "neutral" | "info" | "success" | "warning"> = { lead: "neutral", proposal: "info", active: "success", paused: "warning", complete: "neutral" };

export interface ClientTask { id: string; title: string; done: boolean; due?: string; owner?: string }
export interface Milestone { id: string; title: string; date: string; done: boolean }
/** A project that lives somewhere else (the client's own repo or workspace). */
export interface LinkedProject { id: string; name: string; summary: string; href: string }
export interface ClientNote { id: string; at: string; by: string; text: string }

export interface Client {
  id: string;
  name: string;
  /** Fictional sample, labelled as such. */
  sample?: boolean;
  stage: ClientStage;
  industry: string;
  summary: string;
  nextStep: string;
  started: string;
  contacts: { name: string; role: string }[];
  /** Projects that live in the client's own app or workspace, linked from here. */
  linked: LinkedProject[];
  /** Projects started from the template in this browser. */
  local: LocalProject[];
  links: { label: string; href: string }[];
  tasks: ClientTask[];
  milestones: Milestone[];
  notes: ClientNote[];
}

/** Where the Between Gigs workspace is published; its projects open there. */
const BG = "https://between-gigs.github.io/between-gig-2.0/workspace";

const seed: Client[] = [
  {
    id: "between-gigs", name: "Between Gigs", stage: "active", industry: "Marketplace · entertainment talent", started: "2026-09-15",
    summary: "A marketplace where entertainment professionals offer their skills between productions. We're building 2.0: the Gigster journey, the owner tools, Studio and the workspace.",
    nextStep: "Review the new onboarding (Edit on your profile) and pick a Figma team for image generation.",
    contacts: [{ name: "Client team", role: "Product owners" }, { name: "Anu", role: "Backend" }, { name: "Our studio", role: "Design and front end" }],
    linked: [
      { id: "canvas", name: "Edit on your profile", summary: "Onboarding as editing: the Gigster lands on their own profile, blank, and fills each part in place.", href: `${BG}/canvas/` },
      { id: "questionnaire", name: "Profile questionnaire", summary: "The current onboarding: invite, account, five autosaved steps with a live card, review and submit.", href: `${BG}/questionnaire/` },
      { id: "site", name: "Between Gigs site", summary: "The public pages: the call sheet, Crew Call, the Storyboard, For professionals, a live profile and the policies.", href: `${BG}/site/` },
      { id: "owners", name: "Owner tools", summary: "The team's side: dashboard, review queue, reviewing a profile, people search and inviting the waitlist.", href: `${BG}/owners/` },
      { id: "emails", name: "Emails", summary: "Every email the system sends, light and dark, plus the sample outbox.", href: `${BG}/emails/` },
      { id: "studio", name: "Studio", summary: "A no-code editor: the CMS, the page designer, the code editor and the Live site behind every page.", href: `${BG}/studio/` },
      { id: "preview", name: "Preview guide and effects", summary: "Try every role in the sample, plus the pointer effects and page-curtain experiments.", href: `${BG}/preview/` },
      { id: "proposals", name: "Home once we open", summary: "Proposals for the open platform's home, as a visitor, a Gigster and an owner see it.", href: `${BG}/proposals/` },
      { id: "build-map", name: "Build map", summary: "Every page in 3D, from first visit to live profile, with the stack behind each one.", href: `${BG}/build-map/` },
      { id: "handoff", name: "Backend handoff", summary: "What to connect to the backend: architecture, data model, every endpoint, emails and the build order.", href: `${BG}/handoff/` },
      { id: "design-system", name: "Design system", summary: "Tokens, components and templates, with the clickable prototype.", href: `${BG}/design-system/` },
    ],
    local: [],
    links: [
      { label: "Live preview", href: "https://between-gigs.github.io/between-gig-2.0/" },
      { label: "Repository", href: "https://github.com/Between-Gigs/between-gig-2.0" },
      { label: "Workspace", href: `${BG}/` },
      { label: "Backend handoff", href: "https://between-gigs.github.io/between-gig-2.0/artifacts/backend-handoff/" },
    ],
    tasks: [
      { id: "t1", title: "Edit on your profile: client review of the new default onboarding", done: false, due: "2026-10-30", owner: "Client" },
      { id: "t2", title: "Choose the Figma team for generated imagery", done: false, due: "2026-10-30", owner: "Client" },
      { id: "t3", title: "Worker API and D1 tables (DataSource → api.ts)", done: false, due: "2026-11-14", owner: "Anu" },
      { id: "t4", title: "Clerk production instance and DNS", done: false, due: "2026-11-07", owner: "Client" },
      { id: "t5", title: "Owner tools and Studio on the workspace shell", done: false, due: "2026-11-06", owner: "Studio" },
      { id: "t6", title: "Share images on every page", done: true, owner: "Studio" },
      { id: "t7", title: "Workspace with project switcher and ⌘K", done: true, owner: "Studio" },
    ],
    milestones: [
      { id: "m1", title: "Profile builder and owner tools", date: "2026-10-20", done: true },
      { id: "m2", title: "Studio, Live site and build map", date: "2026-10-27", done: true },
      { id: "m3", title: "Onboarding 2.0 and the workspace", date: "2026-10-30", done: false },
      { id: "m4", title: "Backend connected, real sign-ups", date: "2026-11-20", done: false },
    ],
    notes: [
      { id: "n1", at: "2026-10-28T20:28:00Z", by: "Client", text: "Prioritise onboarding where Gigsters edit directly on a blank profile, and make it more wow." },
      { id: "n2", at: "2026-10-28T20:58:00Z", by: "Client", text: "Put many things into one place until they're ready to move, like a Webflow or Framer projects page. Rebuild the shell: top, bottom, left, right, project switcher, ⌘K." },
      { id: "n3", at: "2026-10-29T03:27:00Z", by: "Client", text: "Next: the onboarding experience, an internal project management system for clients, and a standard template for new client projects." },
    ],
  },
  {
    id: "northlight", name: "Northlight Studio", sample: true, stage: "proposal", industry: "Architecture practice", started: "2026-10-21",
    summary: "A small practice wanting a portfolio site with a project archive their team can update.", nextStep: "Send the website proposal and timeline.",
    contacts: [{ name: "Sample contact", role: "Principal" }], linked: [], local: [], links: [],
    tasks: [{ id: "t1", title: "Proposal: website, 6 weeks", done: false, due: "2026-11-03", owner: "Studio" }, { id: "t2", title: "Collect project photography", done: false, owner: "Client" }],
    milestones: [{ id: "m1", title: "Proposal sent", date: "2026-11-03", done: false }], notes: [{ id: "n1", at: "2026-10-22T15:00:00Z", by: "Studio", text: "Intro call: wants a calm, image-led site." }],
  },
  {
    id: "harbor", name: "Harbor & Co.", sample: true, stage: "lead", industry: "Hospitality group", started: "2026-10-26",
    summary: "Three restaurants looking for one booking and events site.", nextStep: "Book a discovery call.",
    contacts: [{ name: "Sample contact", role: "Operations" }], linked: [], local: [], links: [],
    tasks: [{ id: "t1", title: "Discovery call", done: false, due: "2026-11-05", owner: "Studio" }], milestones: [], notes: [],
  },
  {
    id: "kestrel", name: "Kestrel Health", sample: true, stage: "paused", industry: "Clinic network", started: "2026-08-04",
    summary: "Patient onboarding flow; paused while their compliance review finishes.", nextStep: "Check in after their review on Nov 10.",
    contacts: [{ name: "Sample contact", role: "Product" }], linked: [], local: [], links: [],
    tasks: [{ id: "t1", title: "Onboarding flow v2", done: false, owner: "Studio" }, { id: "t2", title: "Accessibility audit", done: true, owner: "Studio" }],
    milestones: [{ id: "m1", title: "Flow v1 delivered", date: "2026-09-12", done: true }, { id: "m2", title: "Restart after review", date: "2026-11-10", done: false }], notes: [],
  },
  {
    id: "fieldnotes", name: "Fieldnotes Journal", sample: true, stage: "complete", industry: "Publishing", started: "2026-06-02",
    summary: "Editorial site and newsletter templates, delivered.", nextStep: "Ask for a testimonial.",
    contacts: [{ name: "Sample contact", role: "Editor" }], linked: [], local: [], links: [],
    tasks: [{ id: "t1", title: "Launch", done: true, owner: "Studio" }], milestones: [{ id: "m1", title: "Launched", date: "2026-08-20", done: true }], notes: [],
  },
];

const KEY = "cm-clients";
let cache: Client[] | null = null;
const listeners = new Set<() => void>();
const read = (): Client[] => {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? (JSON.parse(raw) as Client[]) : structuredClone(seed); } catch { cache = structuredClone(seed); }
  return cache;
};
const write = (next: Client[]) => {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full or blocked: edits last for this visit */ }
  listeners.forEach((l) => l());
};

/** The clients, with edits kept in this browser. Empty until mounted, so the static build and the first paint agree. */
export function useClients() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const sync = () => setClients(read());
    sync();
    setReady(true); // eslint-disable-line react-hooks/set-state-in-effect
    listeners.add(sync);
    return () => { listeners.delete(sync); };
  }, []);
  const update = React.useCallback((id: string, fn: (c: Client) => Client) => write(read().map((c) => (c.id === id ? fn(c) : c))), []);
  const add = React.useCallback((c: Client) => write([...read(), c]), []);
  const reset = React.useCallback(() => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } cache = null; write(read()); }, []);
  const addProject = React.useCallback((clientId: string, p: Parameters<typeof newProjectFrom>[0]) => {
    const project = newProjectFrom(p);
    write(read().map((c) => (c.id === clientId ? { ...c, local: [...c.local, project] } : c)));
    return project;
  }, []);
  return { clients, ready, update, add, reset, addProject };
}

export const uid = () => Math.random().toString(36).slice(2, 9);
export const shortDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
