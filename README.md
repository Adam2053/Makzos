# MAKZO'S — homepage

Next.js 16 (App Router, TypeScript, CSS Modules) with GSAP for motion. No UI framework.

```bash
npm run dev            # http://localhost:3000
npm run build
npm run prep:images    # regenerate /public/brand from ../images
```

## Two designs, two branches

| branch | direction |
| --- | --- |
| `main` | Cinematic and greyscale. The page obeys the packaging's rule — a desaturated world with colour only where the active flavour is. |
| `too-yum-style` | This one. Loud, warm and product-first, in the register of an Indian snack aisle. |

## This branch — "Halka snack, bhari swad"

Makhana is mostly air, so the page treats the product as something that floats:
packs drift, puffs of the seed drift behind them, nothing quite settles.

- **Ground** warm butter cream `#FFF3DC` with `#FFC42E` as the brand yellow and
  `#F2402A` for the payoff. Each flavour owns a saturated poster tile lifted
  from its printed bag, which is the fastest way to tell four bags apart.
- **Display** Lilita One — a fat condensed poster face with real character —
  run through an SVG `feTurbulence` + `feDisplacementMap` filter
  (`components/Rough.tsx`) so the edges chip like ink stamped onto a packet.
  Applied via `.u-rough` to headlines only; at small sizes the displacement
  eats the letterforms. **Body** Figtree.
- **The die-cut system** is the signature: every card, badge, chip and button
  is a sticker with a 3px ink outline and a solid offset shadow. Never a blur.
  Buttons press *into* their shadow on hover.
- **The puff** cropped out of the wordmark (`scripts/prep-images.mjs`) is reused
  as the brand's punctuation — hero confetti and the icon on every promise card,
  so the page never reaches for stock iconography.

Product-first throughout: prices, MRP strikethroughs, discount badges, star
ratings and review counts, heat levels, and an add-to-bag on every card. The
**Compare** section (`#specs`) is a full product switcher — pick a flavour and
the board repaints to its colour and swaps the pack, the ingredients, the
allergens, the roast time and the printed nutrition. The four bags differ in
ways worth showing: Curry Leaves is tempered in ghee, so it alone declares milk.

## Motion

The rule is that **packages don't loop**. Packs animate in once and then hold
still, so the product is never a moving target while you read it. What loops is
the makhana: each puff runs a circular path, drawn as two quarter-phase-offset
sine tweens on x and y, plus a very slow tumble. Product cards drift gently via
`components/Float.tsx`, which floats a wrapper rather than the card so the
card's own hover press still works.

GSAP also drives the hero timeline, the ticker, the spec-switcher crossfade and
the scroll reveals (ScrollTrigger, easing on `back.out` so things pop rather
than glide). Every tween sits inside `gsap.matchMedia()` — under
`prefers-reduced-motion: reduce` nothing drifts and elements are simply `set` to
their final state. The hidden start state for reveals lives in CSS behind
`html[data-js]`, so with JavaScript off nothing is ever hidden.

## Assets

`scripts/prep-images.mjs` cuts the packs out of their studio mockups. The
backdrop and its drop shadow are neutral greys while the artwork is not, but
each pack also carries a B&W photo panel that bleeds to its own edge — so a
plain neutral test leaks into the bag. The script builds a silhouette from the
strongly-coloured pixels, fills each column between its topmost and bottommost
hit, and uses that envelope as a barrier the background fill can't cross.

## Placeholders to replace before this ships

- **Ratings, review counts and the reviewer quotes are invented.** So are the
  "959 snackers" and the per-flavour star scores. Wire these to real data.
- **Prices** (₹60 a bag, ₹75 MRP, ₹220 a box) are placeholders.
- **Stockists** are listed as text chips; no logos were supplied and none were
  fabricated.
- **Ingredient lists, allergen statements, roast times and shelf life in the
  Compare section are written to be plausible, not sourced.** Allergen copy in
  particular is a legal claim — replace it with the real declarations before
  this goes anywhere near production.
- **Nutrition** shows the pack's gram values only. The `%` reference intakes
  printed on the bag don't add up (15 g fat marked 2%), so they're left off
  rather than republished.
- The Curry Leaves flavour has no scene photograph, unlike the other three.
