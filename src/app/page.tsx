import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Mix } from "@/components/home/Mix";
import { PhotoBand } from "@/components/home/PhotoBand";
import { FlavourMap } from "@/components/home/FlavourMap";
import { Gift } from "@/components/home/Gift";
import { Deliver } from "@/components/home/Deliver";
import { SiteFooter } from "@/components/home/SiteFooter";
import { CartDrawer } from "@/components/home/CartDrawer";

/**
 * Version 3: the counter. White and quick, built around ordering: crunch for a flavour,
 * build a mix with steppers, find one on the map, send one as a gift, check your city.
 */
export default function Home() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <Mix />
        <PhotoBand />
        <FlavourMap />
        <Gift />
        <Deliver />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
}
