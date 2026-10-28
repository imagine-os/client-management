Between Gigs connects Hollywood professionals who are between productions with clients who need their craft in everyday life. The product is a dense working dashboard (Workspace hub, Funnel Studio, Campaign Studio, Writing Studio, People & profiles) plus a marketing site and onboarding flows. This system is the single set of foundations all of them build on, in a light and a dark theme.

Components are built only from these tokens. Each component's page lists what the consumer provides, when to use it and what to avoid. If a screen needs something no component covers, add the token or component here first, then use it.

## Principles

- **Calm workspace, loud moments.** The app is quiet: flat surfaces, hairlines, one mint action per view. Save glow, gradients, the card fan and lime for marketing and celebration (founding cards, approvals).
- **Depth from surfaces, not decoration.** Layers read through `bg` → `surface` → `surface-raised`, plus `line` and the shadow scale. Textures are an opt-in personal finish (see Materials), never the thing that separates one panel from another.
- **One of each.** One button style per role, one tab style, one panel style. If a screen needs a new variant, it needs a new token first.
- **Name things the way people say them.** "Claim a card", "Request changes", "Needs review". Not "Submit", "Reject", "Pending state".

## Content fundamentals

- Sentence case everywhere: buttons, tabs, titles, menu items. Uppercase only through the `eyebrow` style, set by CSS.
- Write to the reader as "you"; the company is "we" ("We'll be in touch if we have questions").
- Buttons say exactly what happens: "Save changes", "Approve profile", "Open workspace". The toast confirms in past tense: "Changes saved", "Profile approved".
- Status words are fixed. Use only: Draft, Not started, Working, Preview, Needs review, Changes requested, Approved, Live, Archived. Each has one status color (see Status).
- Use the middle dot ` · ` to join metadata: "Silver Lake · 3 miles away · Available this week".
- Mark sample data plainly and once per view: "Names shown are illustrative samples for this draft." Set it in `caption`, `ink-subtle`.
- No emoji in product UI. The illustrated category icons in the sidebar are artwork, not emoji.

## Color

Color has two layers. **Primitives** (`forest-*`, `mint-*`, `sage-*`, `amber-*`, `red-*`, `blue-*`, `lime-300`) are the raw palette and never appear in component code. **Semantic tokens** (`bg`, `surface`, `ink`, `action`, …) alias primitives per theme and are the only colors components use. Switching theme swaps semantic values; nothing else changes.

### Brand colors

- `forest-800` is the brand forest: `surface-brand` and `action-strong` in light theme.
- The logo keeps its own exact inks (`logo-mark`, `logo-ink`, `logo-rule`), taken from the approved files. They are for the logo only. See the Logo section.
- `mint-500` is the brand mint: the `action` fill in both themes. Mint is never text on a light ground. For brand-colored text use `ink-brand` (`forest-600` light, `mint-400` dark).
- `sage-*` are the neutrals. They lean green on purpose, so a grey never looks stock.
- `lime-300` belongs to the founding cards and celebration moments. It never carries UI state.

### Grounds and how the themes split

- Page: `bg`. Containers: `surface`. Floating things (menus, popovers, modals, toasts): `surface-raised` with `shadow-md` or `shadow-lg`. Recessed areas (filter bars, inputs, code): `surface-sunken`.
- Hover is the translucent `surface-hover` laid over whatever surface is underneath. Selection is `surface-selected`.
- `surface-brand` is forest in **both** themes. Use it for marketing heroes, the founding-members wall and the sign-in panel. In light theme it is the only dark area on the page. Never use it for app chrome; the light theme's sidebar and top bar stay `surface`.
- Anything on `surface-brand` is a **dark-theme island**: set `data-theme="dark"` on the band's own element. Every token inside then takes its dark value, so text, buttons and badges read correctly on the forest whichever theme the page is in. Text on the band is checked in the dark theme: `ink` 10.9:1, `ink-muted` 6.4:1, `ink-subtle` 4.6:1, `ink-brand` 7.9:1.
- `surface-embed` is white in **both** themes. Anything that shows real content as it will appear elsewhere (sketch pad, device studio, page and email previews, version compare) sits on it, framed by `line`. Text on it is `ink-on-embed`.

### Text

- `ink` for primary text, `ink-muted` for secondary, `ink-subtle` for placeholders and captions. All three hold 4.5:1 on `bg`, `surface`, `surface-raised` and `surface-sunken` in both themes.
- `ink-disabled` is deliberately below 4.5:1. Use it only on disabled controls.
- Links use `link` and stay underlined at rest.
- Headline accents ("Twenty cards. **Twenty names.**") put the second line in `ink-brand`. One accent per headline.
- The marker highlight (the poster's "deliver" and "today") is `highlight` behind `ink` text, with `radius-xs` corners.

### Actions

- `action` + `on-action`: the primary action. One per view.
- `action-strong` + `on-action-strong`: the decisive action inside a flow or review ("Create my profile", "Approve profile"). Forest in light theme, near-white in dark theme.
- Secondary actions are outline buttons: `surface` fill, `line-strong` border, `ink` label.
- Destructive actions use `action-danger` + `on-action-danger`, and always ask for confirmation inside the page.
- Selected and on states of small controls (checked checkbox, chosen radio, switch on, slider fill, progress) use `ink-brand`, with `bg` for the mark on top. Mint is too light against white to show state on its own, so it stays reserved for labelled buttons.

### Status

Each status has a text color and a soft ground. Badges use the soft ground with the text color. Banners use the soft ground with `ink` body text and a status-colored icon.

| Status words | Text | Ground |
| --- | --- | --- |
| Approved, Published, Live | `success` | `success-soft` |
| Draft, Needs review, Unsaved changes, Changes requested | `warning` | `warning-soft` |
| Error, Failed, Version unavailable | `danger` | `danger-soft` |
| Preview, Coming soon, Working | `info` | `info-soft` |
| Not started, Planned, Archived | `ink-muted` | `neutral-soft` |

Status is never color alone: always show the word, and an icon where space allows. `success` sits close to the brand green, so the word carries the meaning.

The draft strip at the top of preview pages ("Draft · not public …") is a full-width `warning-soft` band with `ink` text.

### Categories

`cat-1` to `cat-8` tell apart things of the same kind: funnel step types (traffic source, web page, form, email, marketplace), workspace covers and chart series. They are marks: a 3px top stripe on a card, a chart bar or line, a cover tint. Each holds 3:1 on `surface` and `bg`. Never use them for text or status, and always pair a category color with its label. Assign them in order and keep the assignment stable across the product (Pages & experiences is always `cat-1`).

Workspace cover tiles use a category color as a flat fill, with the workspace initials in `ink` on a `surface` plate at `heading-lg`. Never put text directly on a category color: the dark-theme category colors are light, so no single text color reads on all of them. No random gradients.

## Typography

Four families, each with one job:

- **Sora** (`display`): titles and big numbers. Geometric, close to the brand's poster lettering. Weight 600, tight tracking. Never below 28px.
- **Figtree** (`sans`): everything in the interface: headings inside panels, body, labels, buttons.
- **Newsreader** (`serif`): long-form reading only, in Writing Studio, The Journal and article previews.
- **JetBrains Mono** (`mono`): versions, zoom levels, IDs and dense numeric columns.

Rules:

- App page titles use `display-sm` ("Workspace hub"); studio landing titles use `display-md`. Marketing heroes use `display-xl`, once per page.
- Above a title, an `eyebrow` in `ink-brand` names the area ("MARKETING & GROWTH").
- Panel and card titles use `heading-lg`, `heading-md` or `heading-sm` by container size. Do not use display styles inside panels.
- Default app text is `body-md`. Metadata and card descriptions are `body-sm` in `ink-muted`.
- Buttons, tabs and form labels are `label-md`. Badges and chips are `label-sm`.
- Stat rows ("20 numbered founding cards", "$250") use `stat` for the number and `body-sm` in `ink-muted` for the label. Set `tabular-nums` on every number that can change.
- Keep running text under 65ch (`size-prose`). Balance headings with `text-wrap: balance`.

## Spacing and layout

- The base is 4px. In Tailwind v4 `--spacing` is 4px, so `p-4` is 16px.
- Card padding `space-4`; panel and modal padding `space-6`; gap between cards `space-4` to `space-6`; gap between page sections `space-8`.
- Inside a control: icon-to-label `space-2`, horizontal padding `space-4` (`space-3` on `size-control-sm`).

### The app shell

- Top bar: `size-topbar` tall, `surface`, bottom `line`. Holds the workspace switcher, version tag (`data-sm`), zoom, view toggles and account.
- Module tabs: one row under the top bar. Scrolls horizontally; never wraps.
- Sidebar: `size-sidebar` wide (`size-rail` collapsed), `surface`, right `line`. Category rows with a count pill at the end.
- Content: `bg`, max `size-content` wide, `space-10` top padding.
- Inspector and notebook panels: `size-inspector` wide on the right, `surface`, left `line`.
- Floating prompt bar: centered at the bottom, `surface-raised`, `radius-xl`, `shadow-md`, `z-rail`.
- Split view: panes share one `line` divider. The focused pane gets a 2px `focus` outline. No other pane decoration.
- Below `bp-md` the sidebar becomes a drawer; below `bp-lg` the inspector becomes a drawer.

## Radius

- `radius-md` for every control (buttons, inputs, selects, segmented controls, menu items).
- `radius-lg` for cards, menus, popovers and toasts. `radius-xl` for panels, modals, drawers and the prompt bar.
- `radius-full` for badges, count pills, avatars, toggles and progress bars.
- Nested corners: the inner radius is the outer radius minus the padding between them. A `radius-lg` card holding an image with `space-2` padding gives the image `radius-sm`.

## Elevation and borders

- Cards on `bg`: `surface` + `line` + `shadow-sm`. Cards inside a panel drop the shadow and keep the `line`.
- Menus, popovers, flyouts and toasts: `surface-raised` + `line` + `shadow-md`.
- Modals and drawers: `surface-raised` + `shadow-lg` over `scrim`.
- Featured or selected card: `border-selected` in `focus` color, plus `shadow-glow`. One per view.
- In dark theme shadows are nearly invisible. The step from `surface` to `surface-raised` and a faint top highlight inside the shadow tokens do the work. Do not add glows to compensate.
- Hairlines are `line` at `border-hairline`. Control borders are `line-strong`. Empty slots ("Open" founding cards, drop zones) use a dashed `line-dashed` border and always carry a label.

## Focus and states

- Every interactive element shows a focus ring: 2px solid `focus` with a 2px offset. It holds 3:1 on every ground in both themes. Never remove it; never replace it with a glow.
- Hover: `surface-hover` wash, or `action-hover` / `action-strong-hover` for solid fills.
- Pressed: hover color plus `duration-instant`.
- Disabled: `ink-disabled` label, `line` border, no hover. For images and cards use `opacity-disabled`.
- Invalid field: `danger` border and a `danger` helper line under the field that says how to fix it.
- Loading: keep the label and add a spinner; never swap the label for "Loading…".

## Iconography

- Use one outline icon set for all interface icons: Lucide, 1.75px stroke, at `size-icon-sm` (in controls), `size-icon-md` (nav, toolbars) or `size-icon-lg` (empty states). Icons take the text color of their label.
- The illustrated category icons in the sidebar (wood, paper, film props) are artwork. They appear only as category markers at `size-icon-md` or larger, and never inside buttons.
- This system has not imported the icon files yet. Lucide is the proposed set because it matches the line icons already in the dashboard; confirm before building components.

## Motion

- Hover and toggles: `duration-fast` with `ease-standard`.
- Menus, popovers and tab indicators: `duration-base`; enter with `ease-enter`, leave with `ease-exit`.
- Modals, drawers and panel resize: `duration-slow`.
- Coverflow, the founding-card fan and marketing reveals: `duration-deliberate`. `ease-spring` is for small celebratory moments only.
- Under `prefers-reduced-motion`, replace movement with an instant change or a short fade.

## Layers

Stack order is fixed: `z-base` < `z-raised` < `z-sticky` (top bar, tabs) < `z-rail` (sidebar, prompt bar) < `z-dropdown` < `z-overlay` (scrim) < `z-modal` < `z-popover` < `z-toast` < `z-tooltip` < `z-pointer` (the custom hub pointer). Never write a raw z-index.

## Accessibility

- Every text token is checked at 4.5:1 against the grounds its usage note names, in both themes. Control borders, focus rings and category marks are checked at 3:1.
- `ink-disabled` and `sage-400` fail on purpose and are reserved for disabled controls.
- Status and category always carry a word, not just a color.
- Text never sits directly on a material texture: the texture stays under `opacity-material-max`, and text keeps a solid surface behind it (see Materials).
- Hit targets are at least `size-control-sm` (32px), and 40px on touch.
