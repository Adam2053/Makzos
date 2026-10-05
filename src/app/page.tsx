import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { ClaimsBand } from "@/components/home/ClaimsBand";
import { Menu } from "@/components/home/Menu";
import { BoxBuilder } from "@/components/home/BoxBuilder";
import { Inside } from "@/components/home/Inside";
import { Gifting } from "@/components/home/Gifting";
import { Updates } from "@/components/home/Updates";
import { SiteFooter } from "@/components/home/SiteFooter";
import { CartDrawer } from "@/components/home/CartDrawer";
import { StickyBuy } from "@/components/home/StickyBuy";

/**
 * One reading order, as the guide asks (p.28): brand, flavour, detail, action.
 * Every section ends on something to do.
 */
export default function Home() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <ClaimsBand />
        <Menu />
        <BoxBuilder />
        <Inside />
        <Gifting />
        <Updates />
      </main>
      <SiteFooter />
      <CartDrawer />
      <StickyBuy />
    </CartProvider>
  );
}
