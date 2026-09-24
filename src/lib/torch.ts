/**
 * Paints the dark over the room, with a soft hole where the torch points, a warm spill
 * of light, and dust motes that only show inside the beam. One canvas, one pass per frame,
 * drawn at 1x: every edge here is soft, so extra pixels would only cost frames.
 */
export type Beam = { x: number; y: number; r: number };

const NIGHT = "20 11 6";
/** How dark the room is outside the beam: enough to hide detail, not enough to hide shapes. */
const OUTSIDE = 0.92;

export function createTorch(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true })!;
  let w = 0, h = 0, painted = false;
  type Mote = { x: number; y: number; r: number; vx: number; vy: number; phase: number };
  let motes: Mote[] = [];

  const resize = () => {
    w = canvas.width = canvas.clientWidth;
    h = canvas.height = canvas.clientHeight;
    motes = Array.from({ length: Math.round((w * h) / 4200) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * Math.random() * 2,
      vx: (Math.random() - 0.5) * 8,
      vy: -2 - Math.random() * 6,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (beam: Beam, time: number, dt: number) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    if (beam.r < 1) {
      ctx.fillStyle = `rgb(${NIGHT})`;
      ctx.fillRect(0, 0, w, h);
    } else {
      const dark = ctx.createRadialGradient(beam.x, beam.y, 0, beam.x, beam.y, beam.r);
      dark.addColorStop(0, `rgb(${NIGHT} / 0)`);
      dark.addColorStop(0.4, `rgb(${NIGHT} / 0)`);
      dark.addColorStop(0.7, `rgb(${NIGHT} / ${OUTSIDE * 0.55})`);
      dark.addColorStop(0.88, `rgb(${NIGHT} / ${OUTSIDE * 0.92})`);
      dark.addColorStop(1, `rgb(${NIGHT} / ${OUTSIDE})`);
      ctx.fillStyle = dark;
      ctx.fillRect(0, 0, w, h);

      // Warm spill, added on top so the lit patch glows rather than just showing through.
      ctx.globalCompositeOperation = "lighter";
      const spill = ctx.createRadialGradient(beam.x, beam.y, 0, beam.x, beam.y, beam.r * 0.9);
      spill.addColorStop(0, "rgb(255 185 95 / .24)");
      spill.addColorStop(0.5, "rgb(255 160 60 / .09)");
      spill.addColorStop(1, "rgb(255 160 60 / 0)");
      ctx.fillStyle = spill;
      ctx.fillRect(beam.x - beam.r, beam.y - beam.r, beam.r * 2, beam.r * 2);

      // Dust, visible only where the light falls.
      for (const m of motes) {
        const d = Math.hypot(m.x - beam.x, m.y - beam.y);
        if (d > beam.r * 0.8) continue;
        const lit = 1 - d / (beam.r * 0.8);
        const twinkle = 0.4 + 0.6 * Math.sin(time * 1.6 + m.phase) ** 2;
        ctx.fillStyle = `rgb(255 222 170 / ${lit * twinkle * (0.4 + m.r * 0.25)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const m of motes) {
      m.x += (m.vx + Math.sin(time * 0.7 + m.phase) * 6) * dt;
      m.y += m.vy * dt;
      if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
      if (m.x < -4) m.x = w + 4;
      if (m.x > w + 4) m.x = -4;
    }

    // The canvas wears solid night in CSS until it has painted, so the room never flashes on load.
    if (!painted) { painted = true; canvas.style.background = "transparent"; }
  };

  resize();
  return { resize, draw };
}
