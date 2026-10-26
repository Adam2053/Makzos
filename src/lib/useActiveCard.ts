"use client";

import { useEffect, type RefObject } from "react";

/**
 * Touch screens can't hover, so the card that would be hovered is the one in front of you:
 * the card nearest the middle of the row (or of the screen, for a grid) gets `data-active`,
 * and the one before it loses it. Touching a card makes it active straight away, before the
 * scroll has settled. Written to the DOM directly, so scrolling never re-renders the list.
 * Does nothing where there's a real pointer: there, hover does the job.
 */
export function useActiveCard(list: RefObject<HTMLElement | null>, axis: "x" | "y") {
  useEffect(() => {
    const el = list.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    const cards = () => [...el.children] as HTMLElement[];
    let current: HTMLElement | null = null;
    const set = (card: HTMLElement | null) => {
      if (card === current) return;
      current?.removeAttribute("data-active");
      card?.setAttribute("data-active", "");
      current = card;
    };

    let frame = 0;
    const pick = () => {
      frame = 0;
      const box = axis === "x" ? el.getBoundingClientRect() : null;
      const mid = axis === "x" ? box!.left + box!.width * 0.42 : window.innerHeight * 0.48;
      let best: HTMLElement | null = null, dist = Infinity;
      for (const c of cards()) {
        const r = c.getBoundingClientRect();
        // Only cards actually on screen can be picked.
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const d = Math.abs((axis === "x" ? r.left + r.width / 2 : r.top + r.height / 2) - mid);
        if (d < dist) { dist = d; best = c; }
      }
      set(best);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(pick); };
    const onTouch = (e: PointerEvent) => {
      let card = e.target as HTMLElement | null;
      while (card && card.parentElement !== el) card = card.parentElement;
      if (card) set(card);
    };

    const scroller: HTMLElement | Window = axis === "x" ? el : window;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    if (axis === "x") window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onTouch);
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onTouch);
      set(null);
    };
  }, [list, axis]);
}
