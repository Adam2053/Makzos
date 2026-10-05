import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Finder } from "@/components/home/Finder";
import { Stack } from "@/components/home/Stack";
import { Offers } from "@/components/home/Offers";
import { Moments } from "@/components/home/Moments";
import { Faq } from "@/components/home/Faq";
import { Updates } from "@/components/home/Updates";
import { SiteFooter } from "@/components/home/SiteFooter";
import { CartDrawer } from "@/components/home/CartDrawer";
import { StickyBuy } from "@/components/home/StickyBuy";

/**
 * Version 2: the dark room. Every section ends on something to add to the bag, and the
 * order walks from "which one?" (hero, finder, the stack) to "how many?" (bundles) to
 * "any doubts?" (moments, questions) before asking for an email.
 */
export default function Home() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <Finder />
        <Stack />
        <Offers />
        <Moments />
        <Faq />
        <Updates />
      </main>
      <SiteFooter />
      <CartDrawer />
      <StickyBuy />
    </CartProvider>
  );
}
