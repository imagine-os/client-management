# Client management

The studio's client management, split out of the [Between Gigs 2.0](https://github.com/Between-Gigs/between-gig-2.0)
workspace into its own app. Built with Next.js (static export) and Tailwind v4 on the Between Gigs Design System.

- **Clients** (`/`): a board of clients by stage (lead, proposal, active, paused, complete) with drag and drop, and
  a list view. Each client (`/?c=<id>`) has Overview (milestones, people, links), Projects, Tasks (assignees, due
  dates) and Notes.
- **New project from the template**: five phases (kickoff, foundation, build, quality, handoff) with a checklist
  for each project type (website, web app, onboarding, brand). Source: `lib/template.ts`; written standard:
  `docs/templates/client-project.md`.
- **Templates** (`/templates/`): a gallery; "Use template" opens New project with the type chosen.
- **Client portal** (`/portal/?c=<id>`): what a client sees: progress, what's waiting on them, the next milestone to
  approve, and the latest updates.
- **Shell**: team switcher ("Our studio" / "Between Gigs team"), ⌘K, "Due soon" in the bell, `[` and `]` for the
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

## Conventions

- Don't edit `packages/design-system/`. Request changes in `docs/design-system-requests.md`; re-sync with
  `pnpm sync:ds /path/to/between-gigs-design-system`.
- `pnpm lint:values` bans raw hex/rgb and arbitrary Tailwind values: use tokens.
- `docs/ui-rules.md`: 44px touch targets on phones, no placeholder as a label, text under 16px stays short, one
  primary button per view, axe passes in light and dark. `pnpm qa` checks them on every route in
  `scripts/qa/routes.mjs`.
