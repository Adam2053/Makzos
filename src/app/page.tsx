import { RoughFilter } from "@/components/Rough";
import { Ticker } from "@/components/Ticker";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Flavours } from "@/components/Flavours";
import { Specs } from "@/components/Specs";
import { Banner } from "@/components/Banner";
import { Why } from "@/components/Why";
import { Reviews } from "@/components/Reviews";
import { Stockists } from "@/components/Stockists";
import { BuildBox } from "@/components/BuildBox";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <RoughFilter />
      <Ticker />
      <Nav />
      <main>
        <Hero />
        <Flavours />
        <Specs />
        <Banner />
        <Why />
        <Reviews />
        <BuildBox />
        <Stockists />
      </main>
      <Footer />
    </>
  );
}
