# MAKZO'S — homepage

Next.js 16 (App Router, TypeScript, CSS Modules) with GSAP for motion. No UI framework.

```bash
npm run dev      # http://localhost:3000
npm run build
npm run prep:images   # regenerate /public/brand from ../images
```

## Design rule

The packs already state the brand's idea: a desaturated world with exactly one
thing in colour. The page obeys the same rule. Everything — chrome, type,
photography, even the packs — is greyscale, and colour exists only where the
active flavour is. `--flavour` is registered with `@property` so the accent
animates when you change flavour instead of snapping.

- **Display** Archivo, weight 900 on the width axis, italic for flavour names —
  the wordmark's own heavy slanted grotesque.
- **Body** Instrument Sans. **Data** DM Mono.
- Structure encodes provenance, not sequence: flavours are labelled by where
  the seasoning came from. The only numbered list on the page is the roasting
  process, because that genuinely is a sequence — and the point is that it
  stops at two.

## Motion

GSAP drives everything that moves: the hero's load timeline, the flavour
crossfade, the marquee, and the scroll reveals (ScrollTrigger). The hero pack
carries a slow `sine.inOut` yoyo — 10px and one degree — so it reads as
suspended rather than animated.

Every tween sits inside `gsap.matchMedia()`. Under `prefers-reduced-motion:
reduce` the float never starts and elements are simply `set` to their final
state. The hidden start state for reveals lives in CSS behind `html[data-js]`,
so with JavaScript off nothing is ever hidden.

The hero holds one height across all four flavours: flavour names run to one or
two lines, so the deck reserves the taller case once and pins the buttons to its
floor — the slack collects below the copy instead of opening a hole.

## Assets

`scripts/prep-images.mjs` cuts the packs out of their studio mockups. The
backdrop and its drop shadow are neutral greys while the artwork is not, but
each pack also carries a B&W photo panel that bleeds to its own edge — so a
plain neutral test leaks into the bag. The script builds a silhouette from the
strongly-coloured pixels, fills each column between its topmost and bottommost
hit, and uses that envelope as a barrier the background fill can't cross.

## Content gaps

- **Curry Leaves has no scene photograph.** The other three flavours use one as
  the hero backdrop; Curry Leaves falls back to a flavour-washed grain field.
  It reads as deliberate, but a shot would complete the set.
- **Prices are placeholders** (₹60 a bag, ₹220 a box) — swap in real ones.
- **Nutrition** shows the pack's gram values only. The `%` reference intakes
  printed on the bag don't add up (15 g fat marked 2%), so they're left off
  rather than republished.
