# Materials

Materials (frosted glass, pearlescent film, lacquered oak, cork and the rest of the material library) are a **personal finish**: an optional layer a person can switch on for their own workspace. They sit on top of the theme and never replace it.

## The three layers

1. **Brand base**: primitives and type. Fixed.
2. **Theme**: light or dark semantic tokens. Chosen by the person or their OS.
3. **Personal finish**: material, shine, pointer. Optional, stored per person, and it can be turned off at any time.

Every screen must look finished with the personal finish off. That flat version is the default for new people, for screenshots, for shared and public pages, and for anything a client sees.

## Rules

- A material decorates a surface. It never changes the surface's color token: a panel with oak is still `surface` underneath, and text on it still uses `ink`.
- Texture strength is `opacity-material` on panels and cards, `opacity-material-subtle` under dense UI (tables, forms, code), and never above `opacity-material-max`.
- Text never sits directly on a texture. Inputs, table bodies, menus, modals and toasts always use their plain surface token with no material.
- Materials apply to the shell (sidebar, top bar, prompt bar) and to large panels. Not to buttons, badges, inputs or anything that carries state.
- `surface-embed`, `surface-brand` and public pages never take a material.
- Shine and lighting effects respect `prefers-reduced-motion` and `prefers-reduced-transparency`: drop them under either.
- The material picker shows each finish on a flat swatch, a sphere and a card, as the library does today.

## In code

Add the `material` utility to a surface and set `--material-image` (and optionally `--material-size`, `--material-opacity`, `--material-blend`) from the person's saved choice. Setting `data-material="off"` on `<html>` turns every material off.

```html
<aside class="material bg-surface border-r border-line"
       style="--material-image: url(/materials/lacquered-oak.webp)">
  …
</aside>
```

## Rare-earth collection

Four procedural finishes drawn entirely in CSS, with no image files to host. Each is a preset for the `material` utility, so every rule above still applies (strength, never behind text, off under reduced transparency).

| Utility | Element | Look | Theme behaviour |
| --- | --- | --- | --- |
| `material-neodymium` | 60 Nd | Brushed magnet steel with the lilac and blue sheen of neodymium salts. | Same in both. |
| `material-europium` | 63 Eu | Phosphor grain with a mint glow, like europium-doped glow pigment. | Faint in light ("charging"), glows in dark. |
| `material-didymium` | 59 Pr + 60 Nd | Dichroic glass that shifts from lilac to sea green, with a glass streak. | Same in both. |
| `material-holmium` | 67 Ho | Fine ceramic grain. | Sand in light, rose in dark, as holmium oxide shifts under different light. |

```html
<aside class="material material-holmium bg-surface border-r border-line">…</aside>
```

The showcase shows them at full strength, with a highlight that follows the pointer. In the product they run at `opacity-material` like any other finish.

## Brand backdrop: Europium

`backdrop-europium` is the one exception to "public pages stay flat". It is brand artwork, not a personal finish: a very quiet Europium phosphor field (faint mint grain, soft glow at the bottom edge) for teaser and launch pages such as the Coming soon template.

- Always dark: use it on a `data-theme="dark"` element. It paints its own `forest-950` ground.
- It stays subtle on purpose: the grain is low contrast and a soft darker zone sits behind the centered copy, so text reads cleanly. Don't raise its strength.
- One per page, full-bleed. Never inside the app shell.
