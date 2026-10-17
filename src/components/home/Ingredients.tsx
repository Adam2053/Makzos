"use client";

import { useId } from "react";

/**
 * One ingredient per flavour, drawn to read as a real object rather than a cartoon: no ink
 * outlines, light from the top left, a glossy highlight and shading into the shadow side.
 * On a product card two pieces of it slide out from behind the pack on hover. Illustrative
 * only: they show what the flavour is built around, not an ingredient list.
 */
export type Ingredient = "pepper" | "tamarind" | "cheese" | "coffee" | "curryLeaf" | "starAnise" | "chilli";

/** The one ingredient each flavour is built around (its first taste note). */
export const INSIDE: Record<string, Ingredient> = {
  rasam: "pepper",
  "sweet-tamarind": "tamarind",
  "mac-cheese": "cheese",
  tiramisu: "coffee",
  "curry-leaves": "curryLeaf",
  chettinadu: "starAnise",
  "thai-chilli": "chilli",
};

export function IngredientArt({ kind, className }: { kind: Ingredient; className?: string }) {
  // Gradient ids must be unique per drawing: many cards share the page.
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" overflow="visible">
      {ART[kind](id)}
    </svg>
  );
}

/** A glossy sphere: lit top left, falling into shadow bottom right. */
function sphereGrad(id: string, light: string, mid: string, dark: string) {
  return (
    <radialGradient id={id} cx="35%" cy="30%" r="75%">
      <stop offset="0" stopColor={light} />
      <stop offset=".45" stopColor={mid} />
      <stop offset="1" stopColor={dark} />
    </radialGradient>
  );
}

const ART: Record<Ingredient, (id: string) => React.ReactNode> = {
  pepper: (id) => (
    <g>
      <defs>{sphereGrad(`${id}p`, "#7d6a5c", "#3a2a20", "#100804")}</defs>
      {[[30, 44, 15], [56, 36, 14], [44, 64, 16], [70, 60, 13], [24, 70, 11], [62, 82, 11], [80, 38, 10]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={`url(#${id}p)`} />
          {/* The wrinkled skin of a dried peppercorn. */}
          <path d={`M${x - r * .6} ${y - r * .1}q${r * .3} ${r * .35} ${r * .6} 0q${r * .3} -${r * .35} ${r * .6} 0`} fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="1.2" />
          <ellipse cx={x - r * .38} cy={y - r * .42} rx={r * .28} ry={r * .16} fill="#fff" fillOpacity=".45" transform={`rotate(-30 ${x - r * .38} ${y - r * .42})`} />
        </g>
      ))}
    </g>
  ),
  tamarind: (id) => (
    <g transform="rotate(-28 50 50)">
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#c89160" />
          <stop offset=".5" stopColor="#8e5a2e" />
          <stop offset="1" stopColor="#4d2a12" />
        </linearGradient>
        {sphereGrad(`${id}u`, "#a5582c", "#6a2e10", "#3a1606")}
      </defs>
      {/* Four lumps of the pod, then the broken end showing the sticky pulp. */}
      {[14, 34, 54, 73].map((x, i) => <ellipse key={x} cx={x} cy={50 + (i % 2) * 2} rx="14" ry={16 - (i % 2) * 2} fill={`url(#${id}t)`} />)}
      {[24, 44, 64].map((x) => <path key={x} d={`M${x} 37q-2 13 0 27`} stroke="#3b200c" strokeOpacity=".45" strokeWidth="1.5" fill="none" />)}
      <ellipse cx="89" cy="51" rx="8" ry="12" fill={`url(#${id}u)`} />
      <path d="M8 40Q40 33 80 40" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  ),
  cheese: (id) => (
    <g>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1b0" /><stop offset="1" stopColor="#ffd34a" /></linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffcc33" /><stop offset="1" stopColor="#e39f0f" /></linearGradient>
        <radialGradient id={`${id}h`} cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#b97b00" /><stop offset=".7" stopColor="#d8970a" /><stop offset="1" stopColor="#f6bf2c" /></radialGradient>
      </defs>
      <path d="M6 46L60 16L94 30L94 72L6 86Z" fill={`url(#${id}b)`} />
      <path d="M6 46L60 16L94 30Z" fill={`url(#${id}a)`} />
      <path d="M6 46L94 30" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
      {[[30, 64, 7], [62, 52, 9], [80, 64, 5], [46, 78, 4.5], [18, 74, 3.5], [62, 26, 3]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * .85} fill={`url(#${id}h)`} />)}
    </g>
  ),
  coffee: (id) => (
    <g>
      <defs>{sphereGrad(`${id}c`, "#a26a46", "#5a2f18", "#1f0d04")}</defs>
      {[[38, 46, -25], [66, 60, 32]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="20" ry="28" fill={`url(#${id}c)`} />
          <path d={`M${x} ${y - 24}C${x - 10} ${y - 8} ${x + 10} ${y + 8} ${x} ${y + 24}`} fill="none" stroke="#120600" strokeWidth="4" strokeLinecap="round" />
          <path d={`M${x + 2} ${y - 22}C${x - 7} ${y - 8} ${x + 12} ${y + 8} ${x + 3} ${y + 22}`} fill="none" stroke="#c48a62" strokeOpacity=".35" strokeWidth="1.2" />
          <ellipse cx={x - 8} cy={y - 12} rx="5" ry="9" fill="#fff" fillOpacity=".28" />
        </g>
      ))}
    </g>
  ),
  curryLeaf: (id) => (
    <g transform="rotate(30 50 50)">
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7fcf6d" /><stop offset=".55" stopColor="#3c9440" /><stop offset="1" stopColor="#1d5a23" /></linearGradient>
      </defs>
      <path d="M50 4C82 26 82 72 50 96C18 72 18 26 50 4Z" fill={`url(#${id}l)`} />
      {/* The darker half of the leaf, folded slightly away from the light. */}
      <path d="M50 4C82 26 82 72 50 96Z" fill="#0d3b13" fillOpacity=".22" />
      <path d="M50 10V90" stroke="#d6f2c4" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
      {[28, 44, 60, 74].map((y) => <path key={y} d={`M50 ${y + 7}Q42 ${y + 2} 34 ${y - 2}M50 ${y + 7}Q58 ${y + 2} 66 ${y - 2}`} fill="none" stroke="#c8ecb3" strokeOpacity=".45" strokeWidth="1.3" />)}
      <ellipse cx="38" cy="36" rx="5" ry="16" fill="#fff" fillOpacity=".22" transform="rotate(-12 38 36)" />
    </g>
  ),
  starAnise: (id) => (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c0703a" /><stop offset=".6" stopColor="#7a3615" /><stop offset="1" stopColor="#3f1606" /></linearGradient>
        {sphereGrad(`${id}e`, "#ffd7a0", "#d08a40", "#8a4a14")}
      </defs>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} 50 50)`}>
          <path d="M50 50C43 40 43 20 50 7C57 20 57 40 50 50Z" fill={`url(#${id}s)`} />
          <path d="M50 12V44" stroke="#2a0e02" strokeOpacity=".5" strokeWidth="1.2" />
          <ellipse cx="50" cy="27" rx="3.4" ry="5.5" fill={`url(#${id}e)`} />
        </g>
      ))}
      <circle cx="50" cy="50" r="6" fill="#4a1b07" />
    </g>
  ),
  chilli: (id) => (
    <g>
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(-38 .5 .5)">
          <stop offset="0" stopColor="#ff6a45" />
          <stop offset=".45" stopColor="#d81e10" />
          <stop offset="1" stopColor="#7d0703" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7ccf5a" /><stop offset="1" stopColor="#1f6a23" /></linearGradient>
      </defs>
      <path d="M16 82C30 62 54 42 76 28C84 23 91 29 86 36C70 56 49 76 24 90C15 94 10 88 16 82Z" fill={`url(#${id}r)`} />
      {/* The wet shine along a fresh chilli. */}
      <path d="M26 76C42 62 56 50 72 36" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 74C44 64 52 57 60 50" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M73 26C78 21 86 20 90 25L88 33C84 30 79 30 75 32Z" fill={`url(#${id}g)`} />
      <path d="M86 23C89 15 93 11 98 10" fill="none" stroke={`url(#${id}g)`} strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
};
