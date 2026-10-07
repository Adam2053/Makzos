/**
 * Customer videos and reviews. The guide is firm: "Do not invent customer quotes" (p.9).
 * The clips below are free stock footage from Mixkit (mixkit.co, Mixkit Stock Video Free
 * License), streamed from Mixkit's servers and standing in for creator videos: none of them
 * shows Makzo's. Each is flagged `sample`, which prints a "Sample video" tag on its tile.
 * A clip with no `src` shows its poster with a "Video to come" tag. The reviews below are
 * SAMPLES written to design the cards with: each is flagged `sample`, which prints a
 * "Sample review" tag on its card. Replace them with real, permissioned reviews (and drop
 * the flag) before launch; nothing flagged `sample` should reach customers.
 */
import { FLAVOURS } from "./products";

export type Clip = {
  id: string;
  /** The flavour in the video: its pack is the product link under the clip. */
  flavour: string;
  /** Vertical video, 9:16. Leave out until there is one. */
  src?: string;
  poster: string;
  /** The creator's handle, shown as given. */
  by?: string;
  /** Stand-in footage, not a customer's video. Shows a tag on the tile. */
  sample?: boolean;
};

export type Review = {
  id: string;
  flavour: string;
  quote: string;
  name: string;
  city?: string;
  /** Stars out of five. */
  rating: number;
  /** Written by us for layout, not by a customer. Shows a tag on the card. */
  sample?: boolean;
};

/** Mixkit's file naming: the same id gives the 720p file and its first-frame still. */
const mixkit = (id: number) => ({
  src: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
  poster: `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`,
});

/** One per flavour, in the range's order. The pairing of clip and flavour is arbitrary. */
const STOCK = [42323, 36423, 34487, 26099, 42325, 34469, 42319];

export const CLIPS: Clip[] = FLAVOURS.map((f, i) => ({ id: `clip-${f.id}`, flavour: f.id, sample: true, ...mixkit(STOCK[i % STOCK.length]) }));

export const REVIEWS: Review[] = [
  { id: "sample-1", flavour: "rasam", rating: 5, sample: true, name: "Ananya", city: "Hyderabad",
    quote: "It actually tastes like rasam. Pepper first, then the tang. The bag was gone before my tea was." },
  { id: "sample-2", flavour: "tiramisu", rating: 5, sample: true, name: "Rohan", city: "Bengaluru",
    quote: "I ordered the Tiramisu as a joke. I'm now hiding it from my flatmates." },
  { id: "sample-3", flavour: "sweet-tamarind", rating: 4, sample: true, name: "Meera", city: "Hyderabad",
    quote: "Sweet Tamarind is the one. Tastes like the chutney I'd finish before the samosa." },
  { id: "sample-4", flavour: "mac-cheese", rating: 5, sample: true, name: "Kabir", city: "Hyderabad",
    quote: "Put the box out for guests and the Mac & Cheese went first. Proper crunch, and nothing left on your fingers to regret." },
  { id: "sample-5", flavour: "chettinadu", rating: 4, sample: true, name: "Divya", city: "Bengaluru",
    quote: "Chettinadu has real heat. Finally a desk snack I don't have to explain to anyone." },
  { id: "sample-6", flavour: "curry-leaves", rating: 5, sample: true, name: "Arjun", city: "Hyderabad",
    quote: "Curry Leaves smells like a tadka the moment you open it. Bought four, should have bought eight." },
];

/** How many placeholder cards to draw while REVIEWS is empty. */
export const REVIEW_SLOTS = 3;
