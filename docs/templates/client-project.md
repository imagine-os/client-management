# Starting a new client project

The standard template for every client project, taken from how Between Gigs 2.0 was built. In this app,
**Clients → New project** (or ⌘K → "New project from the template", or **Templates → Use template**) creates a
project with this checklist; `lib/template.ts` is the source the app reads, so change the checklist there and here
together.

## The phases

| # | Phase | Every project | Only for |
|---|---|---|---|
| 01 | Kickoff | Brief, goals and what success looks like · Contacts, access and where decisions get recorded · Existing brand, content and references collected | |
| 02 | Foundation | Design tokens (colour, type, spacing, light and dark) · Workspace shell (top bar, side bars, status bar, ⌘K) | Data model and sample data (web app, onboarding) · Component library (brand) · Page list and content model (website) |
| 03 | Build | Pages built from the system · Forms and their emails | Signed-in flows and roles (web app, onboarding) · Blank profile edited in place (onboarding) |
| 04 | Quality | Responsive sweep (phone, tablet, desktop) · Accessibility (axe and the UI rules check) · QA routes and screenshots on every page · Share images for every link | |
| 05 | Handoff | Client update with screenshots and live links · Launch checklist and domains | Build map and backend handoff (web app, onboarding) |

## The repository to start from

Copy the shape of [Between Gigs 2.0](https://github.com/Between-Gigs/between-gig-2.0), our reference project; drop what the project doesn't need.

```
app/                     routes (static export; trailing slashes)
  workspace/             the shell: projects, clients, each project inside it
components/              one folder per area, built from the design system (@ds/*)
lib/
  data/                  the DataSource contract, sample store and seed (swap to an API later)
  og.ts, og-pages.json   share images for every page
  workspace/             projects, clients and this template
packages/design-system/  vendored system: tokens, components, motion (don't edit; request changes)
scripts/
  qa/                    routes, rules (docs/ui-rules.md), axe, screens, flows
  og-images.mjs          share images (pnpm og)
  preview-thumbs.mjs     Preview guide thumbnails
docs/
  ui-rules.md            the rules the QA enforces
  handoff/               backend, data layer, auth and milestone notes
  design-system-requests.md
```

## Definition of done for any page

- `pnpm check` passes: types, lint, no raw values, build, rules, screens and axe in both themes at 1440 and 390.
- It has a share image (`lib/og-pages.json` + `pnpm og`) and sits in the workspace (`lib/workspace/projects.ts`).
- The client update shows it with a live link and a screenshot.
