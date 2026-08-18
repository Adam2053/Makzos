# MAKZO'S — homepage

Next.js 16 (App Router, TypeScript, CSS Modules) with GSAP for motion. No UI framework.

```bash
npm run dev            # http://localhost:3000
npm run build
npm run prep:images    # regenerate /public/brand from ../images
```

## Three designs, three branches

| branch | direction |
| --- | --- |
| `main` | Cinematic and greyscale. The page obeys the packaging's rule — a desaturated world with colour only where the active flavour is. |
| `too-yum-style` | Loud, warm and product-first, in the register of an Indian snack aisle. Die-cut stickers, stamped poster type. |
| `modern-fumky` | This one. The page read as a campaign: soft capsules floating on a deep berry ground. |

## This branch — modern funky

Built from a Klaviyo email-campaign reference. Email design solves the same
problem this brand has — sell to someone scrolling fast — and it solves it with
shapes rather than grids. So the page is a stack of capsules floating on a deep
berry ground taken from the Sweet Thai Chilli bag, instead of the usual
full-bleed sections. Nothing on the page has a straight outer edge.

- **The signature is the stat bubble.** Four white roundels orbit the bag with
  dotted leaders running back to it. They're positioned as percentages of a
  square stage so the SVG's `0 0 100 100` viewBox maps 1:1 and the leaders stay
  attached at every width.
- **Shapes carry the structure.** The Why block is cut with an elliptical arc
  (`border-radius: 50% 50% … / 12% 12% …`); the product cards repeat that arc
  under their flavour colour; testimonials are offset pills alternating left and
  right, so the section reads as a conversation rather than a grid.
- **The hero picker themes the whole document.** Choosing a bag swaps four
  registered custom properties on `<html>` — ground, accent, a darkened accent
  that stays legible as text on cream, and what sits on top of the accent — so
  the page background, nav, buttons, Why block and footer all repaint together.
  Registering them with `@property` means the repaint animates rather than
  snapping. Three of the four stat bubbles are true of every bag; the fourth
  reads the selected flavour's heat.
- **The Compare capsule takes the flavour's colour**, so that block repaints
  independently as you move along its tabs.
- **Type** Fredoka for display — rounded and warm without tipping into childish
  — with Manrope for body.
- The voucher chip and its **Use discount** button come from the campaign format
  directly. It's the one place a homepage genuinely benefits from looking like
  an email.

## Motion

GSAP drives the hero timeline — bag first, then the leaders, then the bubbles
popping in on `back.out` — plus the Compare crossfade and the scroll reveals via
ScrollTrigger. The bag breathes on a slow `sine.inOut` yoyo; the bubbles hold
their orbit rather than drifting, so the numbers stay readable.

Every tween sits inside `gsap.matchMedia()`. Under `prefers-reduced-motion:
reduce` nothing moves and elements are simply `set` to their final state. The
hidden start state for reveals lives in CSS behind `html[data-js]`, so with
JavaScript off nothing is ever hidden.

## Assets

`scripts/prep-images.mjs` cuts the packs out of their studio mockups. The
backdrop and its drop shadow are neutral greys while the artwork is not, but
each pack also carries a B&W photo panel that bleeds to its own edge — so a
plain neutral test leaks into the bag. The script builds a silhouette from the
strongly-coloured pixels, fills each column between its topmost and bottommost
hit, and uses that envelope as a barrier the background fill can't cross.

The knockout's column-fill envelope overshoots wherever a bag's zip strip and
brand band are wider than its middle, which used to trap a band of backdrop
against the bag — white on one side, cast shadow on the other. The edge-creep
pass now crosses any neutral that isn't the bag itself, stopped by the bag's own
dark or saturated edge and bounded by a depth cap.

The puff in `public/brand/puff.png` is the bitten seed cropped out of the
wordmark, reused as the icon on every promise card.

## Placeholders to replace before this ships

- **Ratings, review counts and the reviewer quotes are invented**, as is the
  "959 reviews" figure. Wire these to real data.
- **Prices** (₹60 a bag, ₹75 MRP, ₹220 a box) and the `MAKZO15` discount code
  are placeholders.
- **Ingredient lists, allergen statements and roast times in Compare are
  written to be plausible, not sourced.** Allergen copy is a legal claim —
  replace it with the real declarations.
- **Nutrition** shows the pack's gram values only. The `%` reference intakes
  printed on the bag don't add up (15 g fat marked 2%), so they're left off
  rather than republished.
- Stockists are text chips; no logos were supplied and none were fabricated.

Contrast was measured across all four themes: the weakest pairing is 4.71:1
(Thai Chilli's button label), which is why the accent carries a separate
darkened variant for text and why nothing sits white-on-coral.
