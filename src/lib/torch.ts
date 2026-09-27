/**
 * Paints the dark over the room, with a soft hole where the torch points and a soft spill
 * of light. One canvas, one pass per frame, drawn at 1x: every edge here is soft, so extra
 * pixels would only cost frames.
 */
export type Beam = { x: number; y: number; r: number };

const NIGHT = "15 14 12";
/** How dark the room is outside the beam: enough to hide detail, not enough to hide shapes. */
const OUTSIDE = 0.92;

export function createTorch(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true })!;
  let w = 0, h = 0, painted = false;

  const resize = () => {
    w = canvas.width = canvas.clientWidth;
    h = canvas.height = canvas.clientHeight;
  };

  const draw = (beam: Beam) => {
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

      // A soft white spill, added on top so the lit patch glows rather than just showing through.
      ctx.globalCompositeOperation = "lighter";
      const spill = ctx.createRadialGradient(beam.x, beam.y, 0, beam.x, beam.y, beam.r * 0.9);
      spill.addColorStop(0, "rgb(255 248 238 / .16)");
      spill.addColorStop(0.5, "rgb(255 248 238 / .06)");
      spill.addColorStop(1, "rgb(255 248 238 / 0)");
      ctx.fillStyle = spill;
      ctx.fillRect(beam.x - beam.r, beam.y - beam.r, beam.r * 2, beam.r * 2);
    }

    // The canvas wears solid night in CSS until it has painted, so the room never flashes on load.
    if (!painted) { painted = true; canvas.style.background = "transparent"; }
  };

  resize();
  return { resize, draw };
}
