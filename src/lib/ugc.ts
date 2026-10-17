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

/**
 * The film beside the brand story on the homepage. SAMPLE: Mixkit stock (chilli falling into
 * red powder), standing in until our own kitchen footage is shot. Landscape, cropped to the frame.
 */
export const STORY_CLIP: Clip = { id: "story", flavour: "rasam", sample: true, ...mixkit(28392) };

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

/**
 * The creator row on a flavour's page: its own clip first, then four more. Handles are
 * placeholders in the shape the real ones will take; every tile is flagged `sample`.
 */
export function creatorClips(flavour: string): Clip[] {
  const i = Math.max(0, FLAVOURS.findIndex((f) => f.id === flavour));
  return Array.from({ length: 5 }, (_, k) => {
    const id = STOCK[(i + k * 3) % STOCK.length];
    return { id: `creator-${flavour}-${k}`, flavour, sample: true, by: `@creator_${k + 1}`, ...mixkit(id) };
  });
}

/**
 * The star summary on a flavour's page. SAMPLE numbers for the layout, like the reviews:
 * compute these from real reviews before launch.
 */
export function ratingFor(flavour: string) {
  const mine = REVIEWS.filter((r) => r.flavour === flavour);
  const bars = [0.72, 0.18, 0.06, 0.03, 0.01];
  const count = 40 + (flavour.length * 7) % 60;
  const average = mine.length ? (mine.reduce((n, r) => n + r.rating, 0) / mine.length + 4.6) / 2 : 4.6;
  return { average: Math.round(average * 10) / 10, count, bars, sample: true, reviews: mine };
}
