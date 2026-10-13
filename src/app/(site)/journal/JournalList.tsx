"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { POSTS, TOPICS, flavourOf, fmtPostDate, type Post, type Topic } from "@/lib/journal";
import { PageHead } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./journal.module.css";

export function PostCard({ p, big = false }: { p: Post; big?: boolean }) {
  const f = flavourOf(p);
  return (
    <article className={styles.card} data-big={big || undefined}>
      <Link href={`/journal/${p.slug}`} className={styles.cardLink}>
        <span className={styles.photo}>
          <Image src={f.dish.src} alt="" fill sizes={big ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 700px) 100vw, 33vw"}
            style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
          <span className={styles.topic}>{TOPICS.find((t) => t.id === p.topic)!.label}</span>
        </span>
        <span className={styles.text}>
          <strong className={ui.display}>{p.title}</strong>
          <span>{p.dek}</span>
          <small>{p.recipe ? `${p.minutes} min recipe, with ${f.name}` : `${p.minutes} min read, ${fmtPostDate(p.date)}`}</small>
        </span>
      </Link>
    </article>
  );
}

export function JournalList({ initial }: { initial: Topic | null }) {
  const [topic, setTopic] = useState<Topic | null>(initial);
  const list = POSTS.filter((p) => !topic || p.topic === topic);
  const [lead, ...rest] = list;

  return (
    <>
      <PageHead title="Journal." lede="Things to make with a bag, and things worth knowing about what's in it." crumbs={[{ href: "/", label: "Home" }, { label: "Journal" }]}>
        <div className={`${forms.segments} ${styles.filters}`} role="group" aria-label="Topic">
          <button type="button" className={forms.segment} aria-pressed={!topic} onClick={() => setTopic(null)}>Everything ({POSTS.length})</button>
          {TOPICS.map((t) => (
            <button key={t.id} type="button" className={forms.segment} aria-pressed={topic === t.id} onClick={() => setTopic(t.id)}>
              {t.label} ({POSTS.filter((p) => p.topic === t.id).length})
            </button>
          ))}
        </div>
      </PageHead>
      <section className={`${ui.shell} ${styles.list}`} aria-label="Posts">
        {lead && <PostCard p={lead} big />}
        <div className={styles.grid}>{rest.map((p) => <PostCard key={p.slug} p={p} />)}</div>
      </section>
    </>
  );
}
