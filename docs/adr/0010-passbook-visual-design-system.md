# 0010. "Passbook" visual design system for the frontend revamp

## Status
Accepted

## Context
The frontend works but looks unfinished. A review of desktop and mobile screenshots
(September 2026) found that the problem is mostly layout and execution, with the palette
a secondary factor:

- Everything sits on one flat plane: sidebar, page, and content share the same paper
  colour, with no surfaces to give hierarchy. On desktop, content floats in a narrow
  column with large dead space to its right.
- On mobile, the header and top nav take roughly a quarter of the viewport before any
  content. In a Transaction row, the ISO date and inline Edit/Delete take about 60% of the
  width, so notes truncate to near-illegible (the problem already recorded in
  `docs/backlog.md`).
- Every expense amount is rendered in the withdrawal red, so a list that is almost all
  expenses reads as a wall of red. The solid ink category bars are the heaviest element
  on the Dashboard.
- Small inconsistencies: the Dashboard's Net uses a hyphen-minus (`-$957.50`) while the
  Transaction list uses U+2212 (`−$5.67`); demo shows `SGD 4,200.00` while a real account
  shows `$908.37`; the native `<input type="month">` renders as a stray white box.

The palette also has concrete problems:

- Every neutral (`#EDEDE2`, `#E3E4D5`, `#B8BEA8`, and the green-black ink) has a
  green-yellow cast that reads as dingy on screen.
- `paper-raised` (`#E3E4D5`) is *darker* than `paper` (`#EDEDE2`), so "raised" surfaces
  recede instead of lifting.
- By calculation from the hex values: brass on paper is about 3.4:1, which fails WCAG AA
  for the Draft badge's text; rule on paper is about 1.6:1, too faint for form-control
  borders (which need 3:1).

Three directions were mocked up on the real Dashboard and Transactions screens, all
sharing the same layout fixes so they differed only in look:

1. **Refined ledger:** the current palette, with layout fixed.
2. **Passbook:** a clean near-white ground with white sheets, the ledger green promoted
   to the brand colour, serif headings kept.
3. **Plain modern:** IBM Plex Sans only, white cards, a blue accent.

The chosen direction is Passbook's colours with Plain modern's card treatment. Dark mode
was considered and is out of scope.

The planning brief assumed the Dashboard's category breakdown would need a charting
library (Recharts, Chart.js, visx). The chosen design is a ranked list with horizontal
bars, which is plain HTML/CSS, just as today's bars already are.

## Decision

### Colour
Existing token names are kept and their values retuned. New tokens use the same
vocabulary. Renaming to generic names (`surface`, `text-muted`) was considered; it mainly
serves dark mode, which is out of scope, and would mean a large rename across every
component for no visible gain.

| Token | Value | Use |
|---|---|---|
| `paper` | `#F4F5F1` | Page background |
| `paper-raised` | `#FFFFFF` | Cards, sheets, sidebar, tab bar. Now lighter than `paper`. |
| `ink` | `#15231B` | Primary text, expense amounts |
| `ink-soft` | `#56615A` | Secondary text (about 6.4:1 on white) |
| `rule` | `#E1E4DD` | Card borders, sidebar and tab-bar edges |
| `rule-soft` (new) | `#ECEEE8` | Dividers between rows inside a card |
| `rule-strong` (new) | `#8A938A` | Form-input borders (about 3.2:1 on white) |
| `deposit` | `#1F5C45` | Income amounts, brand colour, primary buttons, active nav |
| `withdrawal` | `#9E3A2B` | Negative totals (e.g. Net), the expense side of summaries |
| `brass` | unchanged | Fills and borders only |
| `brass-ink` (new) | `#7A5A12` | Text on brass tints (Draft badge) |
| `track` (new) | `#EEF0EB` | Empty part of bars |

Category colours are a fixed swatch set of nine: slate `#2E6B8F`, ochre `#B07A1F`,
moss `#4F7F4F`, clay `#A5483A`, plum `#6E5A8A`, teal `#3F8A84`, tan `#8A7A5A`,
olive `#6B6F3A`, rose `#9A4D6B`. The same set is used for chart bars and for Category
icon tiles, where the tile background is the colour at about 12% opacity. It will also be
the set a User picks from once Category colour is built (Sprint 3).

Colour semantics:
- Individual expense amounts render in `ink`. Only income renders in `deposit`.
  `withdrawal` is reserved for negative totals.
- Signed amounts always use U+2212 (`−`), never a hyphen-minus, via `Money.jsx`.

### Typography
- Source Serif 4 (weight 600) for page titles, section headings, and hero numbers.
- IBM Plex Sans for everything else.
- `font-variant-numeric: tabular-nums` on all amounts, so figures align in columns.
- Inputs stay at 16px or larger (`fix/mobile-form-ux`'s iOS zoom rule).

### Surfaces and shape
- Content sits in white cards with a 1px `rule` border and a 14px radius. There are no
  shadows on in-page cards.
- A shadow is used only for floating layers (popovers).
- Controls (buttons, the month bar) use a 12px radius.
- Category icon tiles are rounded squares, with the radius at about a third of their size.

### Layout
- **Navigation.** Below the `md:` breakpoint, a fixed bottom tab bar (icon plus label)
  replaces the top nav; Log out becomes an icon button in the compact header. At `md:`
  and up, a white sidebar with icon nav, and Log out at its foot.
- **Content width.** Desktop content fills the main area up to a max width of about
  1100px, centred, instead of a narrow left-aligned column.
- **Transactions.** Lists are grouped into day sections ("Today", "Yesterday", then
  e.g. "Tue 22 Sep") with a day total. Each group is one card, with rows split by
  `rule-soft`. The mobile row spec in `docs/backlog.md` is amended to match.
- **Minimum sizes.** Touch targets are at least 44px.

### Icons
- Use `lucide-react`, with stroke width of about 1.6–1.8 to match the typography.
- Each icon is imported explicitly by name, never looked up by name at runtime, so
  tree-shaking works.
- Decorative icons get `aria-hidden`. Icon-only buttons carry an `aria-label`.

### Charts
- No charting library. The category breakdown is a ranked list with CSS bars.
- The Overall tab's diverging bars (Sprint 3 Bundle B) are also CSS.
- A library is revisited only if a chart CSS handles badly is scoped, such as a trend
  over time.

## Consequences
- The token change moves the whole app to the new palette in one merge. Since every
  merge to `main` redeploys prod (including the public `/demo` landing page), the
  following branches refine consistency rather than creating half-old, half-new seams.
  No feature flag is used; each branch must leave every page it touches fully in one
  style.
- `paper-raised` flips from darker-than-`paper` to white. Anything that relied on it
  being darker has to be checked in the tokens branch.
- New dependency: `lucide-react` only. No chart library, so the `/demo` first load is
  not affected by chart code.
- On mobile, nav moves from a top tab row to a bottom tab bar. This is the one
  deliberate departure from "interaction stays the same". The destinations are
  unchanged; only their placement moves.
- With more than nine Categories, colours repeat. Until Category colour is user-chosen,
  colours are assigned deterministically (by Category id), so they stay stable between
  visits.
- Dark mode is not supported. Adding it later means introducing semantic aliases over
  these tokens, as its own ADR.
- The contrast figures above are calculated from hex values. The tokens branch should
  confirm them, and that icon tiles reach at least 3:1, with a real checker.
