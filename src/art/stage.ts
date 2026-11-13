import { Grid, Mask, UI, mix, safeHex } from "./pixel";

/** Portrait grid shared by human portraits, specials and Jensen. */
export const PW = 48;
export const PH = 60;
/** x and AXIS - x are mirror partners; the face is centred between columns 23 and 24. */
export const AXIS = 47;
export const DEFAULT_SIZE = PW * 4;
export const DEFAULT_BG = "#3f4d45";

export const m = () => new Mask(PW, PH);

/** Shoulders and chest, from the base of the neck to the bottom of the grid. */
export const TORSO = () => m().sym(38, [15, 12, 9, 8, 7, ...Array<number>(17).fill(6)], AXIS);

export function sizeOf(opts?: { size?: number }): number {
  const s = opts?.size;
  return typeof s === "number" && Number.isFinite(s) && s > 0 ? s : DEFAULT_SIZE;
}

export function backdrop(g: Grid, bg: string | undefined): void {
  const base = safeHex(bg, DEFAULT_BG);
  const dark = mix(base, UI.charcoal, 0.35);
  const line = mix(base, UI.cream, 0.12);
  for (let y = 0; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      const top = y < 6 || (y < 10 && (x + y) % 2 === 0);
      g.set(x, y, top ? dark : base);
    }
  }
  for (let y = 14; y < 54; y += 8) {
    g.fill(3, y, 4, 1, line);
    g.fill(41, y, 4, 1, line);
    g.fill(3, y + 4, 2, 1, line);
    g.fill(43, y + 4, 2, 1, line);
  }
}

/** Checkpoint window: glass glare, counter ledge, frame. Drawn last, over the sitter. */
export function windowFrame(g: Grid): void {
  const glare = m();
  for (let y = 3; y < 13; y++) {
    for (let x = 33; x < PW - 3; x++) {
      const d = x + y;
      if (d >= 46 && d <= 47) glare.add(x, y);
      if (d === 50) glare.add(x, y);
    }
  }
  g.tint(glare, UI.cream, 0.28);
  g.fill(0, 55, PW, 1, "#2c332f");
  g.fill(0, 56, PW, 1, UI.panel);
  g.fill(0, 57, PW, 3, UI.charcoal);
  g.fill(4, 57, 5, 1, UI.acid);
  g.fill(10, 57, 1, 1, UI.amber);
  g.fill(37, 57, 7, 1, "#2c332f");
  for (let x = 0; x < PW; x++) {
    g.set(x, 0, UI.charcoal).set(x, 1, UI.charcoal).set(x, 2, UI.panel);
  }
  for (let y = 0; y < 55; y++) {
    g.set(0, y, UI.charcoal).set(1, y, UI.charcoal).set(2, y, UI.panel);
    g.set(PW - 1, y, UI.charcoal).set(PW - 2, y, UI.charcoal).set(PW - 3, y, UI.panel);
  }
  g.fill(3, 3, 4, 1, "#2c332f");
  g.fill(3, 3, 1, 4, "#2c332f");
}
