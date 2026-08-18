import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Flavours } from "@/components/Flavours";
import { Honest } from "@/components/Honest";
import { Sources } from "@/components/Sources";
import { BuildBox } from "@/components/BuildBox";
import { Footer } from "@/components/Footer";
import { Grain } from "@/components/Grain";

export default function Page() {
  return (
    <>
      <Grain />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Flavours />
        <Honest />
        <Sources />
        <BuildBox />
      </main>
      <Footer />
    </>
  );
}
