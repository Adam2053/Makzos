import { Banner } from "@/components/home/Banner";
import { Ticker } from "@/components/home/Ticker";
import { Products } from "@/components/home/Products";
import { Why } from "@/components/home/Why";
import { Gobble } from "@/components/home/Gobble";
import { Reviews } from "@/components/home/Reviews";
import { Finder } from "@/components/home/Finder";
import { Bundles } from "@/components/home/Bundles";
import { FindUs } from "@/components/home/FindUs";
import { About } from "@/components/home/About";
import { Faq } from "@/components/home/Faq";
import { Community } from "@/components/home/Community";

/**
 * The homepage flow, in the order agreed in the review notes: the banner film, the range, a
 * running strip, us against chips, nothing artificial, people eating it, the flavour finder
 * ("which one?"), then the bundles ("how many?").
 * After that it helps: the story, where else to buy, answers, the list.
 * The header and footer come from the layout. Build a box lives on its own page now.
 */
export default function Home() {
  return (
    <>
      <Banner />
      {/* The product section's two approaches: layout="rail" scrolls sideways, layout="grid" stacks. */}
      <Products layout="rail" title="Pick your indulgence." fade />
      <Ticker />
      <Why />
      {/* Nothing artificial: the makhana eats the bad squares, then the good ones flip over. The earlier takes are still there: <Chomp />, <FlashCut />. */}
      <Gobble />
      <Reviews />
      <Finder />
      <Bundles />
      <About />
      <FindUs />
      <Faq />
      <Community />
    </>
  );
}
