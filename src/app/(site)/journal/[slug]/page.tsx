import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, TOPICS, findPost, flavourOf, fmtPostDate } from "@/lib/journal";
import { productHref } from "@/lib/products";
import { Crumbs } from "@/components/shop/bits";
import { Pack } from "@/components/shop/Pack";
import { AddButton } from "@/components/home/AddButton";
import ui from "@/components/home/ui.module.css";
import { PostCard } from "../JournalList";
import styles from "./post.module.css";

export const dynamicParams = false;
export const generateStaticParams = () => POSTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const p = findPost((await params).slug);
  return p ? { title: `${p.title} — Makzo's Journal`, description: p.dek } : {};
}

/** One post. Recipes get their ingredients and method; every post ends on the flavour it's about. */
export default async function PostPage({ params }: PageProps<"/journal/[slug]">) {
  const p = findPost((await params).slug);
  if (!p) notFound();
  const f = flavourOf(p);
  const related = POSTS.filter((x) => x.slug !== p.slug && (x.flavour === p.flavour || x.topic === p.topic)).slice(0, 3);

  return (
    <article className={styles.post}>
      <header className={`${ui.shell} ${styles.head}`}>
        <Crumbs items={[{ href: "/", label: "Home" }, { href: "/journal", label: "Journal" }, { label: p.title }]} />
        <p className={styles.meta}>{TOPICS.find((t) => t.id === p.topic)!.label}. {p.recipe ? `${p.minutes} min, serves ${p.recipe.serves}.` : `${p.minutes} min read. ${fmtPostDate(p.date)}.`}</p>
        <h1 className={`${ui.display} ${styles.title}`}>{p.title}</h1>
        <p className={`${ui.lede} ${styles.dek}`}>{p.dek}</p>
      </header>
      <figure className={`${ui.shell} ${styles.hero}`}>
        <Image src={f.dish.src} alt={`The ${f.name} pack photo`} fill sizes="100vw" preload style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
      </figure>

      <div className={`${ui.shell} ${styles.body}`}>
        <div className={styles.text}>
          {p.recipe ? (
            <>
              <section>
                <h2>You&rsquo;ll need</h2>
                <ul className={styles.ingredients}>{p.recipe.ingredients.map((x) => <li key={x}>{x}</li>)}</ul>
              </section>
              <section>
                <h2>Method</h2>
                <ol className={styles.steps}>{p.recipe.steps.map((x) => <li key={x}>{x}</li>)}</ol>
              </section>
            </>
          ) : (
            p.body!.map((b, i) => (
              <section key={i}>
                {b.h && <h2>{b.h}</h2>}
                <p>{b.p}</p>
              </section>
            ))
          )}
        </div>

        <aside className={styles.aside} aria-label={`Made with ${f.name}`}>
          <p className={styles.asideKicker}>{p.recipe ? "Made with" : "Try it with"}</p>
          <div className={styles.asidePack}><Pack id={f.id} sizes="160px" alt={`Makzo's ${f.name}`} /></div>
          <Link href={productHref(f.id)} className={`${ui.display} ${styles.asideName}`}>{f.name}</Link>
          <p className={styles.asideLine}>{f.inspired}</p>
          <AddButton id={f.id} label="Add to bag" variant="btnDark" />
        </aside>
      </div>

      {related.length > 0 && (
        <section className={`${ui.shell} ${styles.related}`} aria-labelledby="related-title">
          <h2 id="related-title" className={`${ui.display} ${styles.relatedTitle}`}>Read next.</h2>
          <div className={styles.relatedGrid}>{related.map((x) => <PostCard key={x.slug} p={x} />)}</div>
        </section>
      )}
    </article>
  );
}
