/*
 * The standard template for starting a client project: the phases and checks every project goes through, taken from
 * how Between Gigs 2.0 was built. "New project" creates one from it; docs/templates/client-project.md
 * is the written version, with the repository structure to copy.
 */

export type ProjectType = "website" | "web-app" | "onboarding" | "brand";
export const projectTypes: { id: ProjectType; name: string; sub: string }[] = [
  { id: "website", name: "Website", sub: "Marketing or portfolio pages" },
  { id: "web-app", name: "Web app", sub: "Signed-in tools and data" },
  { id: "onboarding", name: "Onboarding flow", sub: "Sign-up to a finished profile" },
  { id: "brand", name: "Brand and design system", sub: "Tokens, components, guidelines" },
];

/** Phases and their checks. Items marked for a type only appear in projects of that type. */
const phases: { name: string; items: { title: string; only?: ProjectType[] }[] }[] = [
  { name: "Kickoff", items: [
    { title: "Brief, goals and what success looks like" },
    { title: "Contacts, access and where decisions get recorded" },
    { title: "Existing brand, content and references collected" },
  ] },
  { name: "Foundation", items: [
    { title: "Design tokens: colour, type, spacing (light and dark)" },
    { title: "Workspace shell: top bar, side bars, status bar, ⌘K" },
    { title: "Data model and sample data", only: ["web-app", "onboarding"] },
    { title: "Component library and usage guidelines", only: ["brand"] },
    { title: "Page list and content model", only: ["website"] },
  ] },
  { name: "Build", items: [
    { title: "Pages built from the system" },
    { title: "Forms and their emails" },
    { title: "Signed-in flows and roles", only: ["web-app", "onboarding"] },
    { title: "Onboarding: blank profile edited in place", only: ["onboarding"] },
  ] },
  { name: "Quality", items: [
    { title: "Responsive sweep: phone, tablet, desktop" },
    { title: "Accessibility: axe and the UI rules check" },
    { title: "QA routes and screenshots on every page" },
    { title: "Share images for every link" },
  ] },
  { name: "Handoff", items: [
    { title: "Client update with screenshots and live links" },
    { title: "Build map and backend handoff", only: ["web-app", "onboarding"] },
    { title: "Launch checklist and domains" },
  ] },
];

export interface LocalProject {
  id: string;
  name: string;
  type: ProjectType;
  created: string;
  start: string;
  phases: { name: string; items: { title: string; done: boolean }[] }[];
}

/** The checklist a new project of this type starts with. */
export const templateFor = (type: ProjectType) =>
  phases.map((p) => ({ name: p.name, items: p.items.filter((i) => !i.only || i.only.includes(type)).map((i) => ({ title: i.title, done: false })) }));

export function newProjectFrom({ name, type, start }: { name: string; type: ProjectType; start: string }): LocalProject {
  return { id: Math.random().toString(36).slice(2, 9), name, type, start, created: new Date().toISOString(), phases: templateFor(type) };
}

export const progressOf = (p: LocalProject) => {
  const all = p.phases.flatMap((ph) => ph.items);
  return all.length ? all.filter((i) => i.done).length / all.length : 0;
};
