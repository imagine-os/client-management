# Logo

The Between Gigs logo is the BG monogram with the "Between Gigs" wordmark, in two lockups: **wide** (wordmark beside the monogram, split by a thin rule) and **stacked** (wordmark under the monogram). Each comes in an on-light and an on-dark file, in the Logos asset group. In product code, use the `Logo` component, which draws the same paths and switches inks with the theme.

## Files

| Lockup | On light grounds | On dark grounds |
| --- | --- | --- |
| Wide | `between-gigs-wide-on-light.svg` | `between-gigs-wide-on-dark.svg` |
| Stacked | `between-gigs-stacked-on-light.svg` | `between-gigs-stacked-on-dark.svg` |

## Color

The logo keeps its own exact inks. They are the `logo-*` tokens and are used nowhere else.

| Part | On light (`logo-*` light) | On dark (`logo-*` dark) |
| --- | --- | --- |
| Monogram and "Gigs" (`logo-mark`) | `#012b18` | `#03ff96` |
| "Between" (`logo-ink`) | `#012b18` | `#f5fff8` |
| Divider rule, wide only (`logo-rule`) | `#799184` | `#8daa99` |

- Use the on-light version on `bg`, `surface` and `surface-embed` in light theme; the on-dark version on dark-theme grounds and `surface-brand`.
- Never set the logo in a category color, `lime-300`, a gradient or any token other than its own.
- Never place it on a material texture or a photo without a solid plate of `surface` or `surface-brand` behind it.
- No glow, shadow, outline or rotation. The founding cards are the one place the monogram appears at an angle, as part of the card artwork.

## Which lockup

- **Wide**: site and app headers, email headers, the onboarding header, anywhere wider than tall.
- **Stacked**: covers, the sign-in panel on large screens, square social images, merchandise.
- **Monogram alone** (`Logo layout="mark"`): the app top bar next to the workspace name, the collapsed rail, favicons and app icons (on `surface-brand`).

## Size and space

- Clear space on every side: at least half the monogram's height.
- Minimum size: wide lockup 24px tall; monogram alone 20px tall; stacked 64px tall.
- App top bar: monogram at 20px. Marketing and onboarding headers: wide at 28–32px.

## Legacy

The amber condensed "BETWEEN GIGS" wordmark from the original prototype is retired. Do not use it in new work.
