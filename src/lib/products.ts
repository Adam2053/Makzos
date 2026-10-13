/**
 * The range as printed. Field colours are the brand guide's samples from the
 * supplied pack artwork (p.20); taglines are copied from the pack fronts.
 *
 * All seven are on sale. The guide's release list (p.37) holds Chettinadu, Curry
 * Leaves and Sweet Thai Chilli; the hero still leads with the other four.
 */
export type Taste = "savoury" | "spicy" | "sweet" | "tangy";

export type Flavour = {
  id: string;
  /** The public URL: /products/[slug], as set in the sitemap (Phase 01). */
  slug: string;
  name: string;
  /** Pack tagline, as printed. */
  line: string;
  /** What the flavour is built around. Only Sweet Tamarind's is from the guide; confirm the rest. */
  inspired: string;
  /** How it tastes, for the shop's filters: a rough guide from the dish, not a measurement. */
  taste: Taste[];
  /** 0 mild to 3 hot. A guide from the dish, not a measurement. */
  heat: 0 | 1 | 2 | 3;
  /** What you taste, in order. Our description of the target flavour: confirm with the founders. */
  notes: [string, string, string];
  /** The flavour story for its page. About the dish, never invented history (guide p.7, p.26). */
  story: string;
  field: string;
  /** Text colour that reads on `field`. */
  ink: "#000000" | "#ffffff";
  pack: string;
  dish: {
    src: string;
    width: number;
    height: number;
    /** Where the coloured food sits in the photo, as fractions of its width and height. */
    spot: [number, number];
  };
};

export const FLAVOURS: Flavour[] = [
  {
    id: "rasam",
    slug: "rasam",
    name: "Rasam",
    line: "The warmth we pass on.",
    inspired: "Inspired by home-style rasam.",
    taste: ["savoury", "spicy", "tangy"],
    heat: 2,
    notes: ["Black pepper", "Tamarind tang", "A little cumin"],
    story: "Rasam is the thin, peppery broth that turns up at almost every South Indian meal, and the one people miss most when they leave home. We built this one to taste like the bowl, not the idea of it: pepper first, the tang right behind, and a warmth that stays.",
    field: "#9B1F21",
    ink: "#ffffff",
    pack: "/brand/packs/rasam.webp",
    dish: { src: "/brand/dishes/rasam.webp", width: 1402, height: 1122, spot: [0.55, 0.74] },
  },
  {
    id: "sweet-tamarind",
    slug: "sweet-tamarind",
    name: "Sweet Tamarind",
    line: "Friendship tasted like this back then.",
    inspired: "Inspired by tamarind chutney.",
    taste: ["sweet", "tangy"],
    heat: 1,
    notes: ["Jaggery sweetness", "Tamarind sour", "Roasted cumin"],
    story: "Sweet tamarind chutney is the brown one in the chaat plate, the one you ask for extra of. This bag is that chutney’s sweet and sour, held on a roasted seed instead of a samosa.",
    field: "#CD5D27",
    ink: "#000000",
    pack: "/brand/packs/sweet-tamarind.webp",
    dish: { src: "/brand/dishes/sweet-tamarind.webp", width: 1390, height: 1132, spot: [0.74, 0.24] },
  },
  {
    id: "mac-cheese",
    slug: "mac-n-cheese",
    name: "Mac & Cheese",
    line: "Countdown to comfort.",
    inspired: "Inspired by baked mac and cheese.",
    taste: ["savoury"],
    heat: 0,
    notes: ["Mild cheese", "Buttery", "A pinch of pepper"],
    story: "Baked mac and cheese is comfort with a crust. This is the cheesy, buttery part of it, minus the wait for the oven, with a crunch the pasta never had.",
    field: "#F8F6B9",
    ink: "#000000",
    pack: "/brand/packs/mac-cheese.webp",
    dish: { src: "/brand/dishes/mac-cheese.webp", width: 1920, height: 1440, spot: [0.52, 0.66] },
  },
  {
    id: "tiramisu",
    slug: "tiramisu",
    name: "Tiramisu",
    line: "Worth fighting over.",
    inspired: "Inspired by the layered Italian dessert.",
    taste: ["sweet"],
    heat: 0,
    notes: ["Cocoa", "Coffee", "Creamy sweet"],
    story: "Tiramisu means “pick me up”, and it does: coffee, cocoa and something creamy, layered. This is the dessert as a snack, sweet enough to end a meal and light enough to start the afternoon.",
    field: "#5A3B35",
    ink: "#ffffff",
    pack: "/brand/packs/tiramisu.webp",
    dish: { src: "/brand/dishes/tiramisu.webp", width: 1448, height: 1086, spot: [0.6, 0.8] },
  },
  {
    id: "curry-leaves",
    slug: "curry-leaves",
    name: "Curry Leaves",
    line: "Fresh off the branch.",
    inspired: "Inspired by a curry-leaf tadka.",
    taste: ["savoury"],
    heat: 1,
    notes: ["Curry leaf", "Tempered spice", "Gentle salt"],
    story: "Nothing smells like a tadka when curry leaves hit hot oil. This flavour is built around that moment: green, savoury and fragrant, the way the top of a good dal is.",
    field: "#24633A",
    ink: "#ffffff",
    pack: "/brand/packs/curry-leaves.webp",
    dish: { src: "/brand/dishes/curry-leaves.webp", width: 1448, height: 1086, spot: [0.7, 0.26] },
  },
  {
    id: "chettinadu",
    slug: "chettinad",
    name: "Chettinadu",
    line: "The timeless legacy of the south.",
    inspired: "Inspired by Chettinad spice blends.",
    taste: ["savoury", "spicy"],
    heat: 3,
    notes: ["Pepper heat", "Warm spice", "Slow burn"],
    story: "Chettinad cooking is known for heat with depth: pepper and whole spices, roasted until they’re dark and fragrant. This is the boldest bag in the range, and it builds as you go.",
    field: "#2E1C11",
    ink: "#ffffff",
    pack: "/brand/packs/chettinadu.webp",
    dish: { src: "/brand/dishes/chettinadu.webp", width: 1920, height: 1439, spot: [0.75, 0.58] },
  },
  {
    id: "thai-chilli",
    slug: "sweet-thai-chilli",
    name: "Sweet Thai Chilli",
    line: "The buzz around this heat is well deserved.",
    inspired: "Inspired by sweet chilli sauce.",
    taste: ["sweet", "spicy"],
    heat: 2,
    notes: ["Sweet first", "Chilli heat", "Bright finish"],
    story: "Sweet chilli sauce does two things at once: sticky sweet, then a real kick. This bag does both, in that order, and leaves you reaching for the next handful.",
    field: "#511348",
    ink: "#ffffff",
    pack: "/brand/packs/thai-chilli.webp",
    dish: { src: "/brand/dishes/thai-chilli.webp", width: 1620, height: 1220, spot: [0.46, 0.68] },
  },
];

/** The four the hero leads with. */
export const FEATURED = ["rasam", "sweet-tamarind", "mac-cheese", "tiramisu"].map((id) => FLAVOURS.find((f) => f.id === id)!);
export const byId = (id: string) => FLAVOURS.find((f) => f.id === id)!;
/** For routes: a slug that isn't a flavour gets `undefined`, not a crash. */
export const findFlavour = (id: string) => FLAVOURS.find((f) => f.id === id);
export const bySlug = (slug: string) => FLAVOURS.find((f) => f.slug === slug);
export const productHref = (id: string) => `/products/${byId(id).slug}`;

export const TASTES: { id: Taste; label: string }[] = [
  { id: "savoury", label: "Savoury" },
  { id: "spicy", label: "Spicy" },
  { id: "sweet", label: "Sweet" },
  { id: "tangy", label: "Tangy" },
];

/** Pack fronts are 960 × 1279. */
export const PACK_W = 960;
export const PACK_H = 1279;

/** Placeholders. The guide says "real numbers or none": replace with approved prices before launch. */
export const BAG_PRICE = 60;
export const WEIGHT = "55 g";
export const GRAMS = 55;

/** Build a box: any mix, 4 to 7 bags (requirements form). Each extra bag saves a little more. */
export const BOX_SIZE = 4;
export const BOX_MAX = 7;
const BOX_PRICES: Record<number, number> = { 4: 220, 5: 270, 6: 315, 7: 360 };
export const boxPrice = (n: number) => BOX_PRICES[n] ?? n * BAG_PRICE;
export const BOX_PRICE = boxPrice(BOX_SIZE);

/** The multipack: three of one flavour. */
export const MULTI_SIZE = 3;
export const MULTI_PRICE = 170;

/** Subscribe & save: a discount on every delivery, on a schedule you can pause or skip. */
export const SUB_OFF = 10;
export const SUB_EVERY = [2, 4, 6] as const;
export type Every = (typeof SUB_EVERY)[number];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
