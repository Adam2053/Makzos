/**
 * The spice repeat from the box artwork (makzosassets, box options): chillies, star anise,
 * leaves, cinnamon, cardamom and peppercorns, solid Paprika on white with the details cut
 * out in white. One 120-unit tile, drawn so its edges meet when it repeats.
 * spicePattern() gives a CSS `url(...)`; spiceDataUri() the bare URI, for a canvas.
 */
const P = "#ea4b2b";
const W = "#fff";

const MOTIFS = [
  // Chilli, curling, with its stem.
  `<g transform="translate(8 14) rotate(18)"><path d="M6 6c10-5 26-2 34 12 4 7 3 12-1 9C31 16 20 13 7 12 2 11 2 8 6 6z" fill="${P}"/><path d="M6 7C3 4 2 0 4-3" stroke="${P}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M12 9c8-1 16 2 22 8" stroke="${W}" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`,
  // Star anise: eight pods round a centre, a seed in each.
  `<g transform="translate(84 22)">${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45})"><path d="M0 0C-3.4-4-3.4-10 0-13.5 3.4-10 3.4-4 0 0z" fill="${P}"/><ellipse cx="0" cy="-8" rx="1.1" ry="2.2" fill="${W}"/></g>`).join("")}<circle r="2.4" fill="${W}"/><circle r="1.2" fill="${P}"/></g>`,
  // A curry leaf with its veins.
  `<g transform="translate(56 58) rotate(-35)"><path d="M0 0C6-9 22-9 30 0 22 9 6 9 0 0z" fill="${P}"/><path d="M2 0H27M10 0l5-4M10 0l5 4M18 0l4-3M18 0l4 3" stroke="${W}" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M0 0l-6 2" stroke="${P}" stroke-width="2" stroke-linecap="round"/></g>`,
  // Cinnamon: two rolled sticks, the curl showing at one end.
  `<g transform="translate(10 76) rotate(-22)"><rect width="30" height="6" rx="3" fill="${P}"/><rect y="8" width="30" height="6" rx="3" fill="${P}"/><path d="M27 3a1.6 1.6 0 1 1-1.6-1.4M27 11a1.6 1.6 0 1 1-1.6-1.4M6 3h14M8 11h12" stroke="${W}" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>`,
  // Cardamom pod, ridged.
  `<g transform="translate(96 66) rotate(40)"><path d="M0 0C4-7 14-7 18 0 14 7 4 7 0 0z" fill="${P}"/><path d="M3 0h12M5-2.6c3 1 6 1 9 0M5 2.6c3-1 6-1 9 0" stroke="${W}" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M18 0l3-1" stroke="${P}" stroke-width="1.6" stroke-linecap="round"/></g>`,
  // Peppercorns, three together.
  `<g transform="translate(44 100)"><circle r="3.6" fill="${P}"/><circle cx="7.5" cy="1.5" r="3.2" fill="${P}"/><circle cx="3" cy="7" r="3" fill="${P}"/><circle cx="-1" cy="-1.2" r=".9" fill="${W}"/><circle cx="6.6" cy=".4" r=".8" fill="${W}"/></g>`,
  // A second chilli, smaller, the other way round.
  `<g transform="translate(112 112) rotate(200)"><path d="M4 4c8-4 19-1 25 9 3 5 2 9-1 7C22 12 14 10 5 9 1 8 1 6 4 4z" fill="${P}"/><path d="M4 5C2 3 1 0 3-2" stroke="${P}" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`,
  // Coriander sprig: three round leaves on a stem.
  `<g transform="translate(78 96) rotate(-10)"><path d="M0 14V0" stroke="${P}" stroke-width="1.6" stroke-linecap="round"/><circle cx="0" cy="-3" r="4.4" fill="${P}"/><circle cx="-5" cy="4" r="3.8" fill="${P}"/><circle cx="5" cy="5" r="3.8" fill="${P}"/><path d="M0-6v5M-5 2v3M5 3v3" stroke="${W}" stroke-width=".9" stroke-linecap="round"/></g>`,
  // A loose peppercorn and a seed, to fill the gaps.
  `<circle cx="30" cy="44" r="2.6" fill="${P}"/><circle cx="104" cy="44" r="2.2" fill="${P}"/><ellipse cx="22" cy="112" rx="3.2" ry="1.8" transform="rotate(-30 22 112)" fill="${P}"/>`,
];

/** The tile as a data URI, for an <img> or a canvas. */
export function spiceDataUri(background = W, size = 120) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/>${MOTIFS.join("")}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function spicePattern(background = W) {
  return `url("${spiceDataUri(background)}")`;
}
