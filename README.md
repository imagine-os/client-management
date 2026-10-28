# JAM Studio · Client management

JAM Studio's client management, split out of the [Between Gigs 2.0](https://github.com/Between-Gigs/between-gig-2.0)
workspace into its own app. Built with Next.js (static export) and Tailwind v4 on the Between Gigs Design System,
branded **Swiss Grid**: white, black and one hard blue, Archivo throughout, square corners, rules instead of boxes.

- **Clients** (`/`): clients by stage (lead, proposal, active, paused, complete) as a Board with drag and drop, a
  List, a Grid of cards or a sortable Table. Each client (`/?c=<id>`) has Overview (milestones, people, links), Projects, Tasks (assignees, due
  dates) and Notes.
- **New project from the template**: five phases (kickoff, foundation, build, quality, handoff) with a checklist
  for each project type (website, web app, onboarding, brand). Source: `lib/template.ts`; written standard:
  `docs/templates/client-project.md`.
- **Tasks** (`/tasks/`): every client's tasks in one place, ClickUp-style. Four views of the same tasks: **List**
  (grouped, collapsible, quick add per group), **Board** (drag cards between columns), **Table** (sort and edit in
  place) and **Calendar** (drag a task onto a day). Search, filters (status, priority, assignee, client, due), group
  by and sort are shared across views; saved views in the left bar (Due this week, Overdue, Urgent and high, Waiting
  on clients). Open a task for its details: status, priority, assignee, due date, client, description, subtasks.
  Each client's Tasks tab has the same views for just their tasks.
- **Templates** (`/templates/`): a gallery; "Use template" opens New project with the type chosen.
- **Client portal** (`/portal/?c=<id>`): what a client sees: progress, what's waiting on them, the next milestone to
  approve, and the latest updates.
- **Shell**: team switcher ("JAM Studio" / "Between Gigs team"), ⌘K, "Due soon" in the bell, `[` and `]` for the
  side bars.

## Local only, for now

There is no backend and no sign-in yet. Clients and every edit are kept **in your browser** (localStorage); other
people don't see them, and clearing site data resets to the seed. Between Gigs is the one real client; Northlight,
Harbor & Co., Kestrel and Fieldnotes are fictional samples, labelled as such. The portal is a preview of what a client
would see once client sign-in exists. **This repository is public: put nothing private in the seed.**

## Develop

```sh
pnpm install
pnpm dev           # http://localhost:3000
pnpm check         # types, lint, no raw values, build, then QA: UI rules, screens, axe (light and dark), the flow
```

`next dev` writes an `AGENTS.md` and `CLAUDE.md`; they're git-ignored, don't commit them.

## Share images

Links to the app show a 1200×630 preview (`public/og/`): one each for Clients, Tasks, Templates and the client
portal, with Open Graph and Twitter tags from `lib/og.ts`. After changing a page's look, run `pnpm build && pnpm og`
and commit the images. The tags use the live address (`NEXT_PUBLIC_SITE_URL`, by default
`https://imagine-os.github.io/client-management`), since link previews are fetched from there.

## The brand

`theme/swiss-grid.css` is the brand layer. It redefines the design system's own tokens (colours in light and dark,
fonts, display weights, radii, shadows) so every component follows without editing the system, and holds the
Archivo font files. It is the one place raw colour values live. The mark is `components/Wordmark.tsx`.

## Conventions

- Don't edit `packages/design-system/`. Request changes in `docs/design-system-requests.md`; re-sync with
  `pnpm sync:ds /path/to/between-gigs-design-system`.
- `pnpm lint:values` bans raw hex/rgb and arbitrary Tailwind values outside `theme/`: use tokens.
- `docs/ui-rules.md`: 44px touch targets on phones, no placeholder as a label, text under 16px stays short, one
  primary button per view, axe passes in light and dark. `pnpm qa` checks them on every route in
  `scripts/qa/routes.mjs`.
