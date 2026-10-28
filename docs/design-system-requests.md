# Design system requests

Things this app needs that the Between Gigs Design System (vendored in `packages/design-system/`, see its `VERSION`)
doesn't have yet. Each is built locally for now; once the system ships it, swap the local version out. Never edit
`packages/design-system/` by hand: change the system upstream, then run `pnpm sync:ds`.

## Type scale for reading (docs/ui-rules.md)

Body text should be 16px with ~1.5 line height, secondary text no smaller than 14px. The app overrides
`--text-body-lg` (18/28), `--text-body-md` (16/24), `--text-body-sm` (14/21) and the caption line height (12/18) in
`app/globals.css`. Request: adopt this scale in the system.

## Dark status surfaces (app override for now)

In dark mode `--warning-soft` (amber-900), `--info-soft` (blue-900) and `--danger-soft` (red-900) read as muddy
brown, navy and maroon on the forest surfaces. The app overrides them in `app/globals.css` as a hint of the status
tone over `--surface-raised` (7% / 7% / 9% in oklab). Request: adopt these (or tuned equivalents) in the system's
dark tokens.

## CommandPalette search field

The palette's field is `type="text"` with only a placeholder and an aria-label, which `pnpm qa:rules` reads as a
placeholder-only field. It is a search box: please give it `type="search"`. `components/Shell.tsx` sets the type
when the palette opens until then.

## AppShell with a status bar

`AppShell` has no status bar. `components/Shell.tsx` lays out its own top bar, side bars, work area and bottom
status bar with the system's pieces. A system `AppShell` with an optional `statusBar` would replace it.
