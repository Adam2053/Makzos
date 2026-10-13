"use client";

import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/ugc";
import { MOTION_OK } from "@/lib/motion";
import styles from "./Film.module.css";

/**
 * One video tile. It plays by itself, muted and looping, while at least half of it is on
 * screen, and stops when it leaves, so only the few clips being looked at are ever streaming.
 * A tap pauses it, and it then stays paused until tapped again. People who've asked for
 * reduced motion get the still and the play button instead.
 */
export function Film({ clip, label, echo }: { clip: Clip; label: string; echo?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const held = useRef(false);

  useEffect(() => {
    const v = video.current;
    if (!v || !window.matchMedia(MOTION_OK).matches) return;
    const io = new IntersectionObserver((entries) => {
      // Several changes can arrive at once (off screen, then back, when the row loops): only the last is true now.
      if (entries[entries.length - 1].isIntersecting && !held.current) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = video.current!;
    held.current = !v.paused;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <button type="button" className={styles.film} onClick={toggle} tabIndex={echo ? -1 : undefined}
      aria-label={`${playing ? "Pause" : "Play"} ${label}`} aria-pressed={playing}>
      <video ref={video} className={styles.video} src={clip.src} poster={clip.poster} muted loop playsInline preload="none"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <span className={styles.play} data-on={playing || undefined} aria-hidden="true">
        <svg viewBox="0 0 24 24">{playing ? <path d="M8 6v12M16 6v12" /> : <path d="M9 6.5v11l9-5.5Z" />}</svg>
      </span>
    </button>
  );
}
