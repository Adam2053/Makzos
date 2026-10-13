/**
 * Ways to use a bag beyond eating it straight: two quick recipes and three pairings per
 * flavour. These are our kitchen's suggestions, not customer content. Keep them to what a
 * home kitchen has, and never claim a health benefit for any of them (guide p.9).
 */
export type Recipe = {
  id: string;
  title: string;
  /** One line on what it is. */
  dek: string;
  minutes: number;
  serves: number;
  ingredients: string[];
  steps: string[];
};

export type Pairing = { name: string; why: string };

export const RECIPES: Record<string, { recipes: Recipe[]; pairings: Pairing[] }> = {
  rasam: {
    recipes: [
      {
        id: "rasam-chaat", title: "Rasam makhana chaat", dek: "Tossed with onion, tomato and lime, then crowned with sev.", minutes: 5, serves: 2,
        ingredients: ["1 bag Makzo's Rasam", "1 small onion, finely chopped", "1 tomato, seeds out, chopped", "A handful of coriander", "Half a lime", "2 tbsp thin sev"],
        steps: ["Tip the makhana into a wide bowl.", "Add the onion, tomato and coriander, then squeeze over the lime.", "Toss once and top with sev. Eat straight away, while it still crunches."],
      },
      {
        id: "rasam-curd-rice", title: "Curd rice, with crunch", dek: "Cool curd rice with a peppery handful on top.", minutes: 3, serves: 1,
        ingredients: ["1 bowl curd rice", "A handful of Makzo's Rasam", "A few pomegranate seeds"],
        steps: ["Lightly crush the makhana in your palm.", "Scatter it over the curd rice with the pomegranate.", "Mix as you eat, so every spoon has some."],
      },
    ],
    pairings: [
      { name: "Filter coffee", why: "The pepper and the coffee's bitterness meet halfway." },
      { name: "Buttermilk", why: "Cool and salty, it resets you for the next handful." },
      { name: "A rainy evening", why: "The reason rasam exists." },
    ],
  },
  "sweet-tamarind": {
    recipes: [
      {
        id: "tamarind-bhel", title: "Makhana bhel", dek: "Your usual bhel, with makhana doing the crunching.", minutes: 7, serves: 2,
        ingredients: ["1 bag Makzo's Sweet Tamarind", "1 cup puffed rice", "1 small onion, chopped", "1 boiled potato, cubed", "2 tbsp green chutney", "Coriander and sev"],
        steps: ["Mix the makhana and puffed rice in a big bowl.", "Fold in the onion, potato and green chutney.", "Finish with coriander and sev, and serve before it softens."],
      },
      {
        id: "tamarind-dahi", title: "Dahi bowl topper", dek: "Sweet, sour and crunchy over thick curd.", minutes: 2, serves: 1,
        ingredients: ["1 cup thick curd, whisked", "A pinch of roasted cumin", "A handful of Makzo's Sweet Tamarind"],
        steps: ["Season the curd with cumin and a pinch of salt.", "Pile the makhana on top just before eating."],
      },
    ],
    pairings: [
      { name: "Masala chai", why: "Ginger and tamarind are old friends." },
      { name: "Cold lime soda", why: "Fizz and sour, on top of sweet and sour." },
      { name: "Samosa", why: "It's the chutney you always wanted more of." },
    ],
  },
  "mac-cheese": {
    recipes: [
      {
        id: "mac-topping", title: "Crunchy pasta bake", dek: "A cheesy crust for any baked pasta, no breadcrumbs needed.", minutes: 25, serves: 3,
        ingredients: ["Your favourite baked pasta, ready for the oven", "1 bag Makzo's Mac & Cheese", "A little grated cheese", "Chilli flakes, optional"],
        steps: ["Crush the makhana roughly in the bag.", "Bake the pasta as usual, and for the last 3 minutes scatter the makhana and cheese over the top.", "Grill until golden. Add chilli flakes if you like it warm."],
      },
      {
        id: "mac-movie-mix", title: "Movie night mix", dek: "Two bowls' worth of crunch in one.", minutes: 3, serves: 4,
        ingredients: ["1 bag Makzo's Mac & Cheese", "2 cups salted popcorn", "A handful of roasted peanuts"],
        steps: ["Toss everything together in a big bowl.", "Shake, don't stir, so the makhana stays whole."],
      },
    ],
    pairings: [
      { name: "Tomato soup", why: "Use it the way you'd use croutons." },
      { name: "Iced tea", why: "Lemon cuts right through the cheese." },
      { name: "A long film", why: "It outlasts the trailers." },
    ],
  },
  tiramisu: {
    recipes: [
      {
        id: "tiramisu-parfait", title: "Tiramisu parfait", dek: "Layers of cream, coffee and crunch in a glass.", minutes: 10, serves: 2,
        ingredients: ["1 bag Makzo's Tiramisu", "1 cup hung curd or whipped cream", "2 tbsp cold strong coffee", "1 tsp sugar", "Cocoa for dusting"],
        steps: ["Sweeten the curd or cream with the sugar.", "Spoon a layer into each glass, drizzle with coffee, add a layer of makhana.", "Repeat, finishing with cream and a dusting of cocoa. Add the top layer of makhana just before serving."],
      },
      {
        id: "tiramisu-affogato", title: "Affogato, with crunch", dek: "Ice cream, a shot of coffee and a handful on top.", minutes: 2, serves: 1,
        ingredients: ["2 scoops vanilla ice cream", "1 hot espresso or strong coffee", "A handful of Makzo's Tiramisu"],
        steps: ["Scoop the ice cream into a cup.", "Pour the hot coffee over it.", "Throw the makhana on top and eat it fast."],
      },
    ],
    pairings: [
      { name: "Espresso", why: "It finishes the dessert the flavour started." },
      { name: "Cold coffee", why: "For when it's too hot for anything else." },
      { name: "Vanilla ice cream", why: "The plain scoop it was waiting for." },
    ],
  },
  "curry-leaves": {
    recipes: [
      {
        id: "curry-poha", title: "Poha, with a tadka on top", dek: "Breakfast poha with a curry-leaf crunch.", minutes: 2, serves: 1,
        ingredients: ["1 plate hot poha or upma", "A handful of Makzo's Curry Leaves", "A wedge of lemon"],
        steps: ["Squeeze the lemon over the poha.", "Scatter the makhana on top so it stays crisp."],
      },
      {
        id: "curry-trail", title: "Tadka trail mix", dek: "A savoury jar for the desk drawer.", minutes: 5, serves: 4,
        ingredients: ["1 bag Makzo's Curry Leaves", "Half a cup roasted chana", "Half a cup roasted peanuts", "A handful of raisins"],
        steps: ["Mix everything in a jar.", "Close it tight. It keeps its crunch as long as the lid stays on."],
      },
    ],
    pairings: [
      { name: "Filter coffee", why: "A South Indian breakfast table, in a bag." },
      { name: "Coconut water", why: "Fresh and sweet next to the tadka." },
      { name: "Lemon rice", why: "The crunch the rice was missing." },
    ],
  },
  chettinadu: {
    recipes: [
      {
        id: "chettinadu-salad", title: "Chettinadu cucumber salad", dek: "Cool cucumber, warm spice, lots of crunch.", minutes: 5, serves: 2,
        ingredients: ["1 cucumber, diced", "1 small onion, sliced thin", "Half a lime", "1 bag Makzo's Chettinadu", "Coriander"],
        steps: ["Toss the cucumber and onion with lime and a pinch of salt.", "Add the makhana and coriander right before serving."],
      },
      {
        id: "chettinadu-dal", title: "Dal-rice crunch", dek: "The weeknight bowl, made louder.", minutes: 1, serves: 1,
        ingredients: ["1 bowl dal and rice", "A handful of Makzo's Chettinadu", "A spoon of ghee"],
        steps: ["Pour the ghee over the dal and rice.", "Crush the makhana over the top and mix as you go."],
      },
    ],
    pairings: [
      { name: "Buttermilk", why: "Your mouth will thank you." },
      { name: "Ginger tea", why: "Heat on heat, the good kind." },
      { name: "Lime soda", why: "Bubbles to put the fire out." },
    ],
  },
  "thai-chilli": {
    recipes: [
      {
        id: "thai-slaw", title: "Crunchy Thai slaw", dek: "Cabbage, carrot, lime and sweet heat.", minutes: 8, serves: 2,
        ingredients: ["2 cups shredded cabbage", "1 carrot, julienned", "Juice of 1 lime", "1 tsp honey", "1 bag Makzo's Sweet Thai Chilli", "Mint or coriander"],
        steps: ["Whisk the lime juice with the honey and a pinch of salt.", "Toss with the cabbage and carrot.", "Top with the makhana and herbs and serve straight away."],
      },
      {
        id: "thai-noodles", title: "Noodle bowl topper", dek: "Any bowl of noodles, with something to bite on.", minutes: 1, serves: 1,
        ingredients: ["1 bowl noodles or ramen", "A handful of Makzo's Sweet Thai Chilli", "Spring onion"],
        steps: ["Finish the noodles with spring onion.", "Add the makhana at the table, not in the pot."],
      },
    ],
    pairings: [
      { name: "Lemongrass iced tea", why: "Fragrant, cold, and in on the theme." },
      { name: "Mango lassi", why: "Sweet and thick against the chilli." },
      { name: "Instant noodles", why: "Late night, sorted." },
    ],
  },
};
