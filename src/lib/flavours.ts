export type Flavour = {
  id: string;
  name: string;
  short: string;
  origin: string;
  packLine: string;
  note: string;
  heat: number;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  tile: string;
  ink: "dark" | "light";
  deep: string;
  pack: string;
  scene: string | null;
  sceneCaption?: string;
  badge?: string;
  ingredients: string;
  allergens: string;
  roast: string;
  theme: { ground: string; fill: string; text: string; onFill: string };
};

/**
 * `tile` is the flavour's poster colour, lifted from the printed bag and pushed
 * to full saturation; `ink` says whether type on that tile reads dark or light.
 */
export const FLAVOURS: Flavour[] = [
  {
    id: "chettinadu",
    name: "Chettinadu",
    short: "Chettinadu",
    origin: "Karaikudi, Tamil Nadu",
    packLine: "The spice that built fortunes.",
    note: "Black pepper, star anise and kalpasi. Warm, not violent.",
    heat: 3,
    price: 60,
    mrp: 75,
    rating: 4.7,
    reviews: 214,
    tile: "#F0A21C",
    ink: "dark",
    deep: "#3A2214",
    pack: "/brand/pack-chettinadu.png",
    scene: "/brand/scene-chettinadu",
    sceneCaption: "A spice merchant opens his case in Karaikudi.",
    badge: "Bestseller",
    ingredients:
      "Roasted makhana (82%), black pepper, star anise, kalpasi, dried red chilli, rock salt, sunflower oil.",
    allergens: "None. Packed in a facility that also handles milk.",
    roast: "18 minutes, dry",
    theme: { ground: "#3B2412", fill: "#F0A21C", text: "#8F5A03", onFill: "#26101F" },
  },
  {
    id: "thai-chilli",
    name: "Sweet Thai Chilli",
    short: "Thai Chilli",
    origin: "Chiang Rai, Thailand",
    packLine: "The buzz around this heat is well deserved.",
    note: "Bird's eye chilli cut with wildflower honey. Sharp, then sweet.",
    heat: 4,
    price: 60,
    mrp: 75,
    rating: 4.8,
    reviews: 306,
    tile: "#F2402A",
    ink: "light",
    deep: "#5C1850",
    pack: "/brand/pack-thai-chilli.png",
    scene: "/brand/scene-thai-chilli",
    sceneCaption: "Chilli picked beside the hives.",
    badge: "Hot right now",
    ingredients:
      "Roasted makhana (80%), bird's eye chilli, cane sugar, honey powder, garlic, rock salt, sunflower oil.",
    allergens: "None. Packed in a facility that also handles milk.",
    roast: "16 minutes, dry",
    theme: { ground: "#4E1140", fill: "#F2402A", text: "#C9301C", onFill: "#26101F" },
  },
  {
    id: "curry-leaves",
    name: "Curry Leaves",
    short: "Curry Leaves",
    origin: "Backwaters of Kerala",
    packLine: "Fresh off the branch.",
    note: "Curry leaf, cracked pepper, rock salt. Tempered in ghee first.",
    heat: 1,
    price: 60,
    mrp: 75,
    rating: 4.6,
    reviews: 168,
    tile: "#B8D94A",
    ink: "dark",
    deep: "#123B21",
    pack: "/brand/pack-curry-leaves.png",
    scene: null,
    ingredients:
      "Roasted makhana (84%), curry leaf, cracked black pepper, ghee, rock salt.",
    allergens: "Contains milk (ghee).",
    roast: "18 minutes, dry",
    theme: { ground: "#153E24", fill: "#B8D94A", text: "#41660F", onFill: "#26101F" },
  },
  {
    id: "mac-cheese",
    name: "Mac & Cheese",
    short: "Mac & Cheese",
    origin: "Your kitchen, 11pm",
    packLine: "Countdown to comfort.",
    note: "Aged cheddar and a whisper of mustard. Zero microwave required.",
    heat: 0,
    price: 60,
    mrp: 75,
    rating: 4.9,
    reviews: 271,
    tile: "#2FC2E2",
    ink: "dark",
    deep: "#1B2A2E",
    pack: "/brand/pack-mac-cheese.png",
    scene: "/brand/scene-mac-cheese",
    sceneCaption: "Thirty seconds left on the timer.",
    badge: "Kid approved",
    ingredients:
      "Roasted makhana (78%), cheddar powder, whey, mustard, onion, rock salt, sunflower oil.",
    allergens: "Contains milk.",
    roast: "15 minutes, dry",
    theme: { ground: "#16323B", fill: "#2FC2E2", text: "#0A6B82", onFill: "#26101F" },
  },
];

/** Printed on the back of every 55 g bag. */
export const NUTRITION = [
  { label: "Energy", value: "1048 kJ", sub: "250 kcal" },
  { label: "Fat", value: "15 g", sub: "saturates 6 g" },
  { label: "Sugar", value: "5 g", sub: "none added" },
  { label: "Salt", value: "0.2 g", sub: "rock salt only" },
];

export const PROMISES = [
  { t: "Roasted, never fried", d: "Dry heat and small batches. No oil bath, no shortcuts." },
  { t: "Flavours with a passport", d: "Every seasoning comes from somewhere real, and we say where." },
  { t: "Nothing artificial", d: "No palm oil, no MSG, no colours you can't pronounce." },
  { t: "Grown in Bihar", d: "Hand-harvested lotus seeds from the ponds of Mithila." },
];

export const REVIEWS = [
  { name: "Ananya R.", city: "Bengaluru", stars: 5, text: "Finished the Thai Chilli bag on the auto ride home. No regrets, only crumbs." },
  { name: "Devansh M.", city: "Pune", stars: 5, text: "I bought it to be healthy. I kept buying it because the Chettinadu is genuinely good." },
  { name: "Farida S.", city: "Hyderabad", stars: 4, text: "Curry Leaves tastes like my mother's tempering. That's a very high bar and it cleared it." },
  { name: "Jai K.", city: "Delhi", stars: 5, text: "My kid asked for the cheese one by name. He's four. That's marketing I can't argue with." },
];

export const STOCKISTS = ["Blinkit", "Zepto", "Swiggy Instamart", "Amazon", "BigBasket", "DMart", "Flipkart"];

export const BOX_PRICE = 220;
export const BOX_MRP = 300;
