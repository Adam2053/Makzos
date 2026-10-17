import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FLAVOURS, bySlug } from "@/lib/products";
import { PromoStrip } from "@/components/shop/PromoStrip";
import { ProductHero } from "@/components/shop/ProductHero";
import { ProductStory } from "@/components/shop/ProductStory";
import { ProductSpecs } from "@/components/shop/ProductSpecs";
import { BoughtTogether } from "@/components/shop/BoughtTogether";
import { Creators } from "@/components/shop/Creators";
import { Recipes } from "@/components/shop/Recipes";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { ProductFaq } from "@/components/shop/ProductFaq";
import { Products } from "@/components/home/Products";

export const dynamicParams = false;
export const generateStaticParams = () => FLAVOURS.map((f) => ({ slug: f.slug }));

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const f = bySlug((await params).slug);
  if (!f) return {};
  return { title: `${f.name} roasted makhana — Makzo's`, description: `${f.inspired} ${f.line} Roasted, not fried. No preservatives, no artificial colours or flavours.` };
}

/**
 * One template, seven flavours (sitemap: Flavour product pages). In order: the offers, buy it, read its
 * story, see exactly what's in it, add what goes with it, watch creators eat it, cook with it,
 * read reviews, get answers, then the rest of the range.
 */
export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const f = bySlug((await params).slug);
  if (!f) notFound();
  return (
    <>
      <PromoStrip />
      <ProductHero id={f.id} />
      <ProductStory id={f.id} />
      <ProductSpecs id={f.id} />
      <BoughtTogether id={f.id} />
      <Creators id={f.id} />
      <Recipes id={f.id} />
      <ProductReviews id={f.id} />
      <ProductFaq id={f.id} />
      <Products layout="rail" ids={FLAVOURS.filter((x) => x.id !== f.id).map((x) => x.id)} title="More to try." />
    </>
  );
}
