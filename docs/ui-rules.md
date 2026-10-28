# UI rules

The working rules for every screen, distilled from two references the team uses:
*Refactoring UI* (Adam Wathan and Steve Schoger) and *Practical UI* (Adham Dannaway). This is our own summary
applied to this product and its design system, not a copy of either book. Rules marked **[checked]** are enforced
by `pnpm qa:rules` (scripts/qa/rules.mjs) on every route, at desktop and phone width.

## 1. Hierarchy
- **Not everything is important.** Each screen has one thing to look at first, then a few secondary things,
  then the rest. Build hierarchy with weight and colour (ink → ink-muted → ink-subtle), not only size.
- **Values beat labels.** Show "24 invited", not "Invited: 24". When a label is needed, it's the quiet part.
- **One primary action per view.** Mint (`primary`) is for the single most important action in a view;
  other actions are `secondary` (outlined) or `ghost`. **[checked]**
- **Destructive isn't automatically loud.** It's red only where it's the primary action of a confirmation.

## 2. Layout and spacing
- **Use the spacing scale only** (the design system's 4px-based steps); no one-off values. **[checked: tokens lint]**
- **More space between groups than within them**, so grouping reads without borders.
- **Fewer borders.** Separate with spacing and a change of surface shade first; a hairline only where it adds clarity.
- **Don't fill the width for its own sake.** Text columns stay narrow; forms are one column.
- **Keep layouts steady.** Interactions swap content in place or open a panel; they don't rearrange the page.
  Loading skeletons have the final shape.

## 3. Type
- **One typeface (Figtree)**, two weights for most text (regular and semibold), and the system's type scale only.
- **Body text is at least 16px** where people read; 14px is for secondary and metadata, never below 12px. **[checked]**
- **Line length 45–80 characters** for running text. **[checked]**
- **Line height** about 1.5 for body text, tighter for headings. **[checked]**
- **Left-align anything longer than two lines**; centre only short headings and short notes. **[checked]**
- **No long all-caps.** Uppercase is only for short eyebrows (a few words) with added letter-spacing. **[checked]**
- **Sentence case** for headings, buttons and labels.

## 4. Colour
- **Contrast**: text at least 4.5:1, large text and UI parts 3:1. **[checked: axe]**
- **Never colour alone**: status always has a word or an icon too.
- **Mint is for action and the one number that needs attention.** Links that sit in body text are underlined;
  navigation and table links don't need to be coloured.
- **Greys come from the brand** (the sage and forest scales), not neutral black.
- Status colours (success, warning, danger, info) are soft surfaces with a strong icon and title, in both themes.

## 5. Depth
- **One light source, from above.** Shadows grow with elevation: flat cards rest on the surface, menus and panels
  float, dialogs float highest.
- **Flat can still have depth**: a lighter raised surface, a darker sunken one.

## 6. Interaction
- **Touch targets at least 44×44px on phones** (48 preferred), with space between them. **[checked]**
- **Buttons say what they do**: a verb and an object ("Invite 3 people", "Send to Hana"), never "OK" or "Submit".
- **Avoid disabled buttons.** Let people press and tell them what's missing. If a control must be disabled,
  say why next to it. **[checked: disabled buttons need a reason, except pagination and steppers]**
- **Feedback for every action**: a toast with Undo for reversible decisions, a confirmation for irreversible ones.

## 7. Forms
- **Labels above fields, always visible.** Placeholders are examples, never the label. **[checked]**
- **Mark the optional fields, not the required ones.**
- **One column**, related fields grouped, field width hints at the expected answer.
- **Errors next to the field, in plain words, saying how to fix it.**
- **Few options (up to about five)? Show them all** (radio cards, chips), instead of hiding them in a dropdown.

## 8. Images and empty states
- **User photos get a fixed shape** and a branded fallback when missing.
- **Text on images** sits on a scrim or a solid surface so contrast never depends on the photo.
- **Empty states are designed**: what this is, why it's empty, and the one thing to do next.

## 9. Copy
- **Short, concrete, front-loaded.** Lead with what matters; cut words that don't change meaning.
- **Speak the user's words** (Gigster, call sheet, invite), not the system's ("record", "entity", "submit").
- **Client-locked designs.** A page the client approved as is (`data-client-locked`, e.g. /crew-call, and the profile template on /p/, /profile and the owner review, which keeps the 13/15/17px scale approved on Oct 21 via the `approved-type` utility) keeps its own type sizes and centring; the rules checker skips the text-size and centring rules inside it. Accessibility checks still apply.
