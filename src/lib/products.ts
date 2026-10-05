/**
 * The range as printed. Field colours are the brand guide's samples from the
 * supplied pack artwork (p.20); taglines are copied from the pack fronts.
 *
 * All seven are on sale. The guide's release list (p.37) holds Chettinadu, Curry
 * Leaves and Sweet Thai Chilli; the hero still leads with the other four.
 */
export type Flavour = {
  id: string;
  name: string;
  /** Pack tagline, as printed. */
  line: string;
  /** What the flavour is built around. Only Sweet Tamarind's is from the guide; confirm the rest. */
  inspired: string;
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
    name: "Rasam",
    line: "The warmth we pass on.",
    inspired: "Inspired by home-style rasam.",
    field: "#9B1F21",
    ink: "#ffffff",
    pack: "/brand/packs/rasam.webp",
    dish: { src: "/brand/dishes/rasam.webp", width: 1402, height: 1122, spot: [0.55, 0.74] },
  },
  {
    id: "sweet-tamarind",
    name: "Sweet Tamarind",
    line: "Friendship tasted like this back then.",
    inspired: "Inspired by tamarind chutney.",
    field: "#CD5D27",
    ink: "#000000",
    pack: "/brand/packs/sweet-tamarind.webp",
    dish: { src: "/brand/dishes/sweet-tamarind.webp", width: 1390, height: 1132, spot: [0.74, 0.24] },
  },
  {
    id: "mac-cheese",
    name: "Mac & Cheese",
    line: "Countdown to comfort.",
    inspired: "Inspired by baked mac and cheese.",
    field: "#F8F6B9",
    ink: "#000000",
    pack: "/brand/packs/mac-cheese.webp",
    dish: { src: "/brand/dishes/mac-cheese.webp", width: 1920, height: 1440, spot: [0.52, 0.66] },
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    line: "Worth fighting over.",
    inspired: "Inspired by the layered Italian dessert.",
    field: "#5A3B35",
    ink: "#ffffff",
    pack: "/brand/packs/tiramisu.webp",
    dish: { src: "/brand/dishes/tiramisu.webp", width: 1448, height: 1086, spot: [0.6, 0.8] },
  },
  {
    id: "curry-leaves",
    name: "Curry Leaves",
    line: "Fresh off the branch.",
    inspired: "Inspired by a curry-leaf tadka.",
    field: "#24633A",
    ink: "#ffffff",
    pack: "/brand/packs/curry-leaves.webp",
    dish: { src: "/brand/dishes/curry-leaves.webp", width: 1448, height: 1086, spot: [0.7, 0.26] },
  },
  {
    id: "chettinadu",
    name: "Chettinadu",
    line: "The timeless legacy of the south.",
    inspired: "Inspired by Chettinad spice blends.",
    field: "#2E1C11",
    ink: "#ffffff",
    pack: "/brand/packs/chettinadu.webp",
    dish: { src: "/brand/dishes/chettinadu.webp", width: 1920, height: 1439, spot: [0.75, 0.58] },
  },
  {
    id: "thai-chilli",
    name: "Sweet Thai Chilli",
    line: "The buzz around this heat is well deserved.",
    inspired: "Inspired by sweet chilli sauce.",
    field: "#511348",
    ink: "#ffffff",
    pack: "/brand/packs/thai-chilli.webp",
    dish: { src: "/brand/dishes/thai-chilli.webp", width: 1620, height: 1220, spot: [0.46, 0.68] },
  },
];

/** The four the hero leads with. */
export const FEATURED = ["rasam", "sweet-tamarind", "mac-cheese", "tiramisu"].map((id) => FLAVOURS.find((f) => f.id === id)!);
export const byId = (id: string) => FLAVOURS.find((f) => f.id === id)!;

/** Pack fronts are 960 × 1279. */
export const PACK_W = 960;
export const PACK_H = 1279;

/** Placeholders. The guide says "real numbers or none": replace with approved prices before launch. */
export const BAG_PRICE = 60;
export const BOX_PRICE = 220;
export const BOX_SIZE = 4;
export const WEIGHT = "55 g";

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
