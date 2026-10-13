/**
 * The Journal (sitemap: Content). Two kinds of post: recipes, made from lib/recipes so a
 * recipe lives in one place, and articles that teach what makhana is and how to read a
 * label (requirements form, goal 3). Articles make no health claims (guide p.9) and name no
 * other brand. Dates are placeholders until the posts are scheduled.
 */
import { FLAVOURS, byId } from "./products";
import { RECIPES, type Recipe } from "./recipes";

export type Topic = "recipes" | "makhana";
export const TOPICS: { id: Topic; label: string }[] = [
  { id: "recipes", label: "Recipes" },
  { id: "makhana", label: "Know your makhana" },
];

export type Post = {
  slug: string;
  topic: Topic;
  title: string;
  dek: string;
  /** The flavour whose dish photo leads the post. */
  flavour: string;
  date: string;
  minutes: number;
  body?: { h?: string; p: string }[];
  recipe?: Recipe;
};

const ARTICLES: Post[] = [
  {
    slug: "what-is-makhana", topic: "makhana", flavour: "curry-leaves", date: "2026-10-01", minutes: 3,
    title: "What is makhana, exactly?",
    dek: "A water-lily seed, popped. Here's how it gets from the pond to the bag.",
    body: [
      { p: "Makhana, also called fox nut, is the seed of a water lily. The plant grows in still ponds, most of them in Bihar, and its seeds are gathered from the pond bed by hand." },
      { h: "From seed to puff", p: "The seeds are dried, then heated until the hard shell cracks and the inside puffs up, a little like popcorn. What comes out is light, white and crunchy, and tastes of almost nothing on its own." },
      { h: "Why it takes flavour so well", p: "Because it's mild and full of tiny air pockets, makhana holds whatever it's seasoned with. That's why we use it: it lets a dish be the flavour, instead of the snack." },
      { h: "Roasted, not fried", p: "We roast ours, then season it. There's more on that in How we roast." },
    ],
  },
  {
    slug: "roasted-not-fried", topic: "makhana", flavour: "chettinadu", date: "2026-10-05", minutes: 2,
    title: "Roasted, not fried: what it means in the bag",
    dek: "The crunch comes from the roaster. Here's what that changes.",
    body: [
      { p: "Most crunchy snacks get their crunch from hot oil. Ours gets it from dry heat: the makhana is roasted until it's crisp all the way through, then seasoned." },
      { h: "What you'll notice", p: "A lighter crunch, and seasoning that sits on the seed rather than soaking into it. The flavour arrives first, then the crunch." },
      { h: "What's on the label", p: "Every pack lists its ingredients in order of weight, its allergens, and its nutrition per pack. If you want to compare, compare those." },
    ],
  },
  {
    slug: "reading-a-snack-label", topic: "makhana", flavour: "mac-cheese", date: "2026-10-09", minutes: 4,
    title: "How to read the back of a snack bag",
    dek: "Three things to check in ten seconds, on any pack, including ours.",
    body: [
      { p: "The front of a pack is there to sell. The back is there to inform. Here's where to look." },
      { h: "1. The ingredient list", p: "Ingredients are listed by weight, largest first. If you can't picture what something is, it's worth looking up. We keep ours short so you don't have to." },
      { h: "2. The numbers in brackets", p: "INS numbers are codes for additives such as colours, preservatives and flavour enhancers. Our packs have none." },
      { h: "3. Per pack, not just per 100 g", p: "Most people eat the whole bag. The per-pack column tells you what that actually means. Ours is printed on the front." },
    ],
  },
  {
    slug: "seven-dishes", topic: "makhana", flavour: "rasam", date: "2026-10-12", minutes: 3,
    title: "Seven flavours, seven dishes",
    dek: "Every bag starts with a dish you already know. Here's the list.",
    body: FLAVOURS.map((f) => ({ h: f.name, p: f.story })),
  },
];

const RECIPE_POSTS: Post[] = Object.entries(RECIPES).flatMap(([flavour, { recipes }], i) =>
  recipes.map((r, j) => ({
    slug: r.id, topic: "recipes" as const, flavour, title: r.title, dek: r.dek, minutes: r.minutes, recipe: r,
    date: `2026-09-${String(10 + i * 2 + j).padStart(2, "0")}`,
  })),
);

export const POSTS: Post[] = [...ARTICLES, ...RECIPE_POSTS].sort((a, b) => b.date.localeCompare(a.date));
export const findPost = (slug: string) => POSTS.find((p) => p.slug === slug);
export const postsFor = (flavour: string) => POSTS.filter((p) => p.flavour === flavour);
export const fmtPostDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
export const flavourOf = (p: Post) => byId(p.flavour);
