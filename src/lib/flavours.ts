export type Flavour = {
  id: string;
  name: string;
  short: string;
  origin: string;
  packLine: string;
  note: string;
  heat: number;
  price: number;
  accent: string;
  deep: string;
  pack: string;
  scene: string | null;
  sceneCaption?: string;
};

/**
 * Colours are lifted from the four printed bags: `accent` is the one hue each
 * pack lets through, `deep` is the body colour it sits on.
 */
export const FLAVOURS: Flavour[] = [
  {
    id: "chettinadu",
    name: "Chettinadu",
    short: "Chettinadu",
    origin: "Karaikudi, Tamil Nadu",
    packLine: "The spice that built fortunes.",
    note:
      "Black pepper, star anise and kalpasi — the trader's blend that once paid for mansions. We kept it whole and roasted it in.",
    heat: 3,
    price: 60,
    accent: "#F0A21C",
    deep: "#2A1810",
    pack: "/brand/pack-chettinadu.png",
    scene: "/brand/scene-chettinadu",
    sceneCaption:
      "A spice merchant opens his case in Karaikudi. Everything in the room is grey except what is for sale.",
  },
  {
    id: "thai-chilli",
    name: "Sweet Thai Chilli",
    short: "Thai Chilli",
    origin: "Chiang Rai, Thailand",
    packLine: "The buzz around this heat is well deserved.",
    note:
      "Bird's eye chilli cut with wildflower honey. Sharp first, sweet after, and it doesn't overstay its welcome.",
    heat: 4,
    price: 60,
    accent: "#F2402A",
    deep: "#4A1440",
    pack: "/brand/pack-thai-chilli.png",
    scene: "/brand/scene-thai-chilli",
    sceneCaption:
      "Chilli picked beside the hives, so the honey and the heat come off the same hillside.",
  },
  {
    id: "curry-leaves",
    name: "Curry Leaves",
    short: "Curry Leaves",
    origin: "Backwaters of Kerala",
    packLine: "Fresh off the branch.",
    note:
      "Curry leaf, cracked pepper and a little rock salt, tempered in ghee the way it is at home — before it ever meets the seed.",
    heat: 1,
    price: 60,
    accent: "#CBE05C",
    deep: "#123B21",
    pack: "/brand/pack-curry-leaves.png",
    scene: null,
  },
  {
    id: "mac-cheese",
    name: "Mac & Cheese",
    short: "Mac & Cheese",
    origin: "Your kitchen, 11pm",
    packLine: "Countdown to comfort.",
    note:
      "Aged cheddar and a whisper of mustard. The bowl you microwave at midnight, without the microwave.",
    heat: 0,
    price: 60,
    accent: "#2FC2E2",
    deep: "#1B2A2E",
    pack: "/brand/pack-mac-cheese.png",
    scene: "/brand/scene-mac-cheese",
    sceneCaption:
      "Thirty seconds left. The only warm thing in the house is behind the glass.",
  },
];

/** Printed on the back of every 55 g bag. */
export const NUTRITION = [
  { label: "Energy", value: "1048 kJ", sub: "250 kcal" },
  { label: "Fat", value: "15 g", sub: "of which saturates 6 g" },
  { label: "Sugar", value: "5 g", sub: "no added sugar" },
  { label: "Salt", value: "0.2 g", sub: "rock salt only" },
];

export const BOX_PRICE = 220;
