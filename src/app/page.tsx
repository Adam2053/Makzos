import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Shop } from "@/components/Shop";
import { Compare } from "@/components/Compare";
import { Why } from "@/components/Why";
import { Reviews } from "@/components/Reviews";
import { Box } from "@/components/Box";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Shop />
        <Compare />
        <Why />
        <Reviews />
        <Box />
      </main>
      <Footer />
    </>
  );
}
