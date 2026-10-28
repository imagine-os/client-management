# Icons

Interface icons come from **[Lucide](https://lucide.dev)** (`lucide-react`, ISC license), version 0.454 or later. Lucide is a consistent 24px outline set with rounded caps and joins, which fits Figtree and Sora's soft geometry.

```sh
npm install lucide-react
```

```tsx
import { Download } from "lucide-react";
<Button iconStart={<Download />}>Export</Button>
```

Browse and search the full set at [lucide.dev/icons](https://lucide.dev/icons).

## How components use icons

Components never import an icon pack themselves. They take icons as props (`iconStart`, `iconEnd`, `icon`, `start`, `end`), so the set can change later without touching a component. Size and color come from the component, so pass the icon bare: no `size`, `color` or `className`.

| Where | Size | Set by |
| --- | --- | --- |
| Buttons, inputs, menus, tabs, filter bars | 16px | `[&_svg]:size-4` on the component |
| Nav items, icon buttons, modal close | 20px | `[&_svg]:size-5` |
| Badges, breadcrumbs | 14px | `[&_svg]:size-3.5` |
| Empty states, funnel step placeholders | 24px | `size-6` |

- Stroke stays at Lucide's default 2px. Don't mix stroke widths within one screen.
- Icons inherit `currentColor`, so they take the text color of their control (`ink`, `ink-muted`, `on-action`). Don't give icons their own color, except status icons in Banner and Toast, which use the status tone.
- An icon is never the only label. Icon-only buttons need `aria-label` (IconButton requires `label`), and decorative icons stay `aria-hidden`, which Lucide does by default.
- One icon per meaning across the product: `Download` is always export, `Undo2` always undo, `Trash2` always remove. Check the list below before picking a new one.

## Built-in glyphs

A few icons are drawn inside the system (`src/components/icons.tsx`), so components work with no icon package installed: `ChevronDown`, `ChevronLeft`, `ChevronRight`, `Check`, `Close`, `Info`, `Alert`, `CheckCircle`, `XCircle` and `Spinner`, plus the funnel step-type glyphs `SignalGlyph` (traffic), `PageGlyph` (web page), `FormGlyph` (form), `MailGlyph` (email) and `StoreGlyph` (marketplace). They follow Lucide's 24px grid and rounded caps, so they sit cleanly next to Lucide icons.

Custom product icons, drawn with the `create-icon` skill (source SVGs in `icons/custom/`):

| Icon | Means |
| --- | --- |
| `FoundingCardGlyph` | A Founding 20 member card: the Founding 20 nav item and card wall. |

## When Lucide has no icon for it

Ask Claude: "make an icon for …". The `create-icon` skill (`.claude/skills/create-icon/`) checks Lucide first, then draws a new icon on Lucide's grid (24px, 2px stroke, round caps, 2px padding), validates it with `node scripts/check-icons.mjs`, previews it beside Lucide icons at 16, 20 and 24px in both themes with `node scripts/icon-preview.mjs <name>`, and wires it into the library and this file.

## Icons in use

The Lucide icons the components and previews use today, with their meaning:

| Icon | Means |
| --- | --- |
| `Search` | Search, command palette |
| `Plus` | Create, add |
| `ArrowUpRight` | Open in a new view, view all |
| `ArrowRight` | Continue, submit a short form |
| `Download` / `Upload` | Export / import |
| `Undo2` / `Redo2` | Undo / redo |
| `Save` | Save |
| `LayoutGrid`, `List`, `GalleryHorizontal`, `Grid2x2`, `Columns2`, `Rows2` | View modes |
| `Home`, `FolderKanban`, `Users`, `Palette`, `Code2`, `Megaphone`, `Building2`, `Settings` | Main navigation |
| `Star`, `Pin` | Favorite, pin |
| `Bell`, `Inbox` | Notifications, inbox |
| `MoreHorizontal` | More actions menu |
| `Pencil`, `Copy`, `Trash2`, `Share2`, `Eye` | Edit, duplicate, remove, share, preview |
| `Sun`, `Moon`, `Monitor` | Light, dark, system theme |
| `Sparkles` | AI assist |
| `Filter` | Filters |
| `MapPin`, `Calendar`, `Clock`, `Wallet` | Location, date, time, rate |
| `Mail`, `MessageSquare` | Email, comments |
| `FileText`, `Image`, `Layers`, `BookOpen` | Document, image, layers, guide |
| `Lock`, `LogOut`, `UserRound` | Locked, sign out, account |
| `PanelLeft`, `Command`, `X` | Toggle sidebar, keyboard shortcut, close |
| `Mic`, `Video` | Voice, video |
