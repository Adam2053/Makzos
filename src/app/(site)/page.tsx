import { Banner } from "@/components/home/Banner";
import { Products } from "@/components/home/Products";
import { Why } from "@/components/home/Why";
import { FindUs } from "@/components/home/FindUs";
import { PhotoBand } from "@/components/home/PhotoBand";
import { FlavourMap } from "@/components/home/FlavourMap";
import { BuildBox } from "@/components/home/BuildBox";
import { Reviews } from "@/components/home/Reviews";
import { About } from "@/components/home/About";
import { Faq } from "@/components/home/Faq";
import { Community } from "@/components/home/Community";

/**
 * Version 4: the homepage flow. Above the break it sells: the banner, the range, why us.
 * Below it, it helps: choose a flavour, build a box, hear from people, read the story,
 * find us in other stores, get answers, join in. The header and footer come from the layout.
 */
export default function Home() {
  return (
    <>
      <Banner />
      {/* The product section's two approaches: layout="rail" scrolls sideways, layout="grid" stacks. */}
      <Products layout="rail" />
      <Why />
      <PhotoBand />
      <FlavourMap />
      <BuildBox />
      <Reviews />
      <About />
      <FindUs />
      <Faq />
      <Community />
    </>
  );
}
