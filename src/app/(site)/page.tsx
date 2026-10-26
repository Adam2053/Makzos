import { Banner } from "@/components/home/Banner";
import { Ticker } from "@/components/home/Ticker";
import { Products } from "@/components/home/Products";
import { Why } from "@/components/home/Why";
import { Chomp } from "@/components/home/Chomp";
import { Reviews } from "@/components/home/Reviews";
import { Bundles } from "@/components/home/Bundles";
import { FindUs } from "@/components/home/FindUs";
import { About } from "@/components/home/About";
import { Faq } from "@/components/home/Faq";
import { Community } from "@/components/home/Community";

/**
 * The homepage flow, in the order agreed in the review notes: the banner film, a running
 * strip, the range, us against chips, nothing artificial, people eating it, then the bundles.
 * After that it helps: the story, where else to buy, answers, the list.
 * The header and footer come from the layout. Build a box lives on its own page now.
 */
export default function Home() {
  return (
    <>
      <Banner />
      <Ticker />
      {/* The product section's two approaches: layout="rail" scrolls sideways, layout="grid" stacks. */}
      <Products layout="rail" title="Pick your indulgence." fade />
      <Why />
      <Chomp />
      <Reviews />
      <Bundles />
      <About />
      <FindUs />
      <Faq />
      <Community />
    </>
  );
}
