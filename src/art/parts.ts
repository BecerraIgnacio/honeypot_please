import { Grid, Mask, UI, ramp } from "./pixel";

const SHROUD = ramp("#2f3439");
const TRIM = "#8c959c";
const FAN = { rim: "#121416", blade: "#4a5157", gap: "#1c1f22", hub: "#b9c1c6" };
export const GOLD = ramp("#e0b13a");

export function drawFan(g: Grid, cx: number, cy: number, r: number): void {
  const blades = 7;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const rho = Math.hypot(dx, dy);
      if (rho > r) continue;
      let c = FAN.gap;
      if (rho > r - 1) c = FAN.rim;
      else if (rho < 1.2) c = FAN.hub;
      else {
        const t = (((Math.atan2(dy, dx) / (2 * Math.PI)) * blades + rho * 0.45) % 1 + 1) % 1;
        if (t < 0.5) c = FAN.blade;
      }
      g.set(x, y, c);
    }
  }
}

/**
 * Triple-fan graphics card seen face-on: shroud, fans, accent light strip,
 * optional gold PCIe fingers under it and an I/O bracket on its left.
 */
export function drawGpu(
  g: Grid,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fans?: number; fingers?: boolean; bracket?: boolean } = {},
): void {
  const { fans = 3, fingers = true, bracket = true } = opts;
  const body = new Mask(g.w, g.h).rect(x, y, w, h);
  body.del(x, y).del(x + w - 1, y).del(x, y + h - 1).del(x + w - 1, y + h - 1);
  g.paint(body, SHROUD);
  g.fill(x + 2, y + 1, w - 4, 1, UI.acid);
  g.fill(x + 1, y + h - 2, w - 2, 1, TRIM);
  const r = Math.max(2, Math.min((h - 4) / 2, (w - 4) / (2 * fans)));
  const pitch = (w - 4) / fans;
  for (let i = 0; i < fans; i++) drawFan(g, x + 2 + pitch * (i + 0.5), y + 2 + r, r);
  if (fingers) {
    const fx = x + Math.round(w * 0.25);
    const fw = Math.round(w * 0.45);
    g.fill(fx, y + h, fw, 1, "#1d3b2a");
    for (let i = 0; i < fw; i++) if (i % 2 === 0) g.set(fx + i, y + h + 1, GOLD.base);
  }
  if (bracket) {
    g.fill(x - 2, y - 1, 2, h + 2, TRIM);
    g.fill(x - 2, y - 1, 1, h + 2, "#c6ccd0");
    for (let j = y + 1; j < y + h - 1; j += 2) g.set(x - 1, j, "#4a5157");
  }
}
