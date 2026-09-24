"use client";

import { useEffect, useRef } from "react";
import styles from "./PuffField.module.css";

const INK = "#0f0e0c";
const SHADOW = "rgb(42 24 16 / .38)";
const BONE = "#f0eae0";
const GRAVITY = 2400;
const BOUNCE = 0.28;
const MAX_PUFFS = 240;
const SPRITES = 10;

type Puff = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; sprite: number; grow: number; fade: number };
/** The blob fills this share of its sprite; the rest is room for the shadow. */
const FILL = 0.4;

/** Tiny deterministic PRNG so sprites look the same on every visit. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/** A lumpy closed blob, like a puffed lotus seed. */
function blob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, offs: number[]) {
  const pts = offs.map((o, i) => {
    const a = (i / offs.length) * Math.PI * 2;
    return [cx + Math.cos(a) * r * (1 + o), cy + Math.sin(a) * r * (1 + o)];
  });
  ctx.beginPath();
  const mid = (i: number) => {
    const [ax, ay] = pts[i % pts.length];
    const [bx, by] = pts[(i + 1) % pts.length];
    return [(ax + bx) / 2, (ay + by) / 2];
  };
  ctx.moveTo(...(mid(0) as [number, number]));
  for (let i = 1; i <= pts.length; i++) {
    const [px, py] = pts[i % pts.length];
    const [mx, my] = mid(i);
    ctx.quadraticCurveTo(px, py, mx, my);
  }
  ctx.closePath();
}

/** Drawn in the mascot's style: ink body inside a bone rim that's thicker bottom-right. Some get a face. */
function makeSprite(index: number, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = rng(index * 977 + 13);
  const offs = Array.from({ length: 11 }, () => (rand() - 0.5) * 0.16);
  const c = size / 2, r = size * FILL;

  ctx.fillStyle = BONE;
  ctx.shadowColor = SHADOW;
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.045;
  blob(ctx, c, c, r, offs);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = INK;
  blob(ctx, c - r * 0.05, c - r * 0.07, r * 0.8, offs.map((o) => o * 1.2));
  ctx.fill();

  ctx.fillStyle = BONE;
  if (index % 5 < 2) {
    const tilt = (rand() - 0.5) * 0.3;
    ctx.save();
    ctx.translate(c - r * 0.08, c + r * 0.02);
    ctx.rotate(tilt);
    for (const [x, y, w, h] of [[-0.24, -0.12, 0.09, 0.14], [0.08, -0.16, 0.09, 0.14], [-0.28, 0.24, 0.1, 0.07], [0.0, 0.26, 0.13, 0.07]]) {
      ctx.beginPath();
      ctx.ellipse(x * r, y * r, w * r, h * r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else {
    for (let i = 0; i < 3; i++) {
      const a = rand() * Math.PI * 2, d = rand() * r * 0.45;
      ctx.beginPath();
      ctx.ellipse(c + Math.cos(a) * d, c + Math.sin(a) * d, r * (0.05 + rand() * 0.05), r * (0.04 + rand() * 0.04), rand() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return canvas;
}

/**
 * A pile of makhana with simple circle physics. It pours in once `active` turns true;
 * the pointer shoves puffs around and a tap pops a small handful.
 */
export function PuffField({ active, still }: { active: boolean; still: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const puffs: Puff[] = [];

    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0 };
    let w = 0, h = 0, base = 18, sprites: HTMLCanvasElement[] = [];
    let raf = 0, last = performance.now(), poured = false, pourLeft = 0, pourClock = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      base = Math.max(13, Math.min(30, w * 0.017));
      sprites = Array.from({ length: SPRITES }, (_, i) => makeSprite(i, Math.ceil(base * 4.2 * dpr)));
      for (const p of puffs) p.x = Math.min(Math.max(p.x, p.r), w - p.r);
    };

    const spawn = (x: number, y: number, vx: number, vy: number, grow = 1) => {
      if (puffs.length >= MAX_PUFFS) puffs.find((p) => p.fade === 0)!.fade = 0.0001;
      const r = base * (0.75 + Math.random() * 0.55);
      puffs.push({ x, y, vx, vy, r, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 6, sprite: (Math.random() * SPRITES) | 0, grow, fade: 0 });
    };

    const step = (dt: number) => {
      if (activeRef.current && !poured) {
        poured = true;
        // Enough to bury the bottom of the screen, whatever its shape.
        pourLeft = Math.round(((w * h) / (Math.PI * base * base)) * 0.14);
      }
      if (pourLeft > 0) {
        pourClock += dt;
        while (pourClock > 0.016 && pourLeft > 0) {
          pourClock -= 0.016;
          pourLeft--;
          spawn(base + Math.random() * (w - base * 2), -base * 2, (Math.random() - 0.5) * 200, 200 + Math.random() * 300);
        }
      }

      for (const p of puffs) {
        p.vy += GRAVITY * dt;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy), reach = base * 6;
        if (d < reach && d > 0.1) {
          const f = (1 - d / reach) * 5200 * dt;
          p.vx += (dx / d) * f + pointer.vx * 0.04;
          p.vy += (dy / d) * f + pointer.vy * 0.04;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.grow < 1) p.grow = Math.min(1, p.grow + dt * 5);
        if (p.fade > 0) p.fade += dt * 1.5;
      }

      for (let iter = 0; iter < 3; iter++) {
        for (let i = 0; i < puffs.length; i++) {
          const a = puffs[i];
          for (let j = i + 1; j < puffs.length; j++) {
            const b = puffs[j];
            const dx = b.x - a.x, dy = b.y - a.y, min = (a.r + b.r) * 0.92;
            if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
            const d = Math.hypot(dx, dy) || 0.01;
            if (d >= min) continue;
            const nx = dx / d, ny = dy / d, push = (min - d) / 2;
            a.x -= nx * push; a.y -= ny * push;
            b.x += nx * push; b.y += ny * push;
            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rv < 0) {
              const j2 = (-(1 + BOUNCE) * rv) / 2;
              a.vx -= j2 * nx; a.vy -= j2 * ny;
              b.vx += j2 * nx; b.vy += j2 * ny;
            }
          }
        }
        for (const p of puffs) {
          if (p.y > h - p.r) { p.y = h - p.r; if (p.vy > 0) p.vy *= -BOUNCE; p.vx *= 0.9; p.vr *= 0.9; }
          if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx) * BOUNCE; }
          if (p.x > w - p.r) { p.x = w - p.r; p.vx = -Math.abs(p.vx) * BOUNCE; }
        }
      }
      for (const p of puffs) { p.vx *= 0.995; p.vr *= 0.985; }
      for (let i = puffs.length - 1; i >= 0; i--) if (puffs[i].fade >= 1) puffs.splice(i, 1);
      pointer.vx *= 0.8;
      pointer.vy *= 0.8;
    };

    const paint = (p: Puff) => {
      const s = sprites[p.sprite], size = (p.r / FILL) * p.grow;
      ctx.globalAlpha = 1 - Math.min(1, p.fade);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(s, -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of puffs) paint(p);
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      step(dt / 2);
      step(dt / 2);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (pointer.x > -9000) { pointer.vx = e.clientX - pointer.x; pointer.vy = e.clientY - pointer.y; }
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => { pointer.x = pointer.y = -9999; };
    // Each tap pops a small handful; the handful from the tap before fades away.
    let popped: Puff[] = [];
    const onDown = (e: PointerEvent) => {
      if (!activeRef.current) return;
      for (const p of popped) if (p.fade === 0) p.fade = 0.0001;
      const rect = canvas.getBoundingClientRect();
      const before = puffs.length;
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8, v = 650 + Math.random() * 550;
        spawn(e.clientX - rect.left, e.clientY - rect.top, Math.cos(a) * v, Math.sin(a) * v, 0.1);
      }
      popped = puffs.slice(before);
    };

    resize();
    window.addEventListener("resize", resize);

    if (still) {
      // No motion: settle a pile off-screen and draw it once.
      activeRef.current = true;
      for (let i = 0; i < 900; i++) step(1 / 120);
      draw();
      return () => window.removeEventListener("resize", resize);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [still]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
