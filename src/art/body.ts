import type { Accessory, OutfitStyle, PortraitSpec } from "../game/types";
import { Grid, Mask, type Ramp, UI, mix, ramp } from "./pixel";
import { AXIS, PW, PH, TORSO, m } from "./stage";

export const SKIN_TONES = ["#f7dcc8", "#efc19e", "#d9a077", "#b57a4e", "#8a5634", "#5c3a26"] as const;
export const DEFAULT_OUTFIT = "#3d5a80";

const EYE_WHITE = "#efe9dc";
export const INK = "#1d1418";
export const SILVER = "#a8b0b5";

export const headMask = (jaw: "soft" | "square" = "soft") =>
  m().sym(
    8,
    [19, 17, 16, 15, ...Array<number>(16).fill(15), ...(jaw === "soft" ? [16, 16, 17, 18, 19, 21] : [15, 16, 16, 17, 18, 20])],
    AXIS,
  );

export const NECK = () => m().rect(20, 30, 8, 8);

export interface SkinRamp extends Ramp {
  blush: string;
  lip: string;
}

export function skinRamp(tone: number): SkinRamp {
  const idx = Number.isInteger(tone) && tone >= 1 && tone <= 6 ? tone - 1 : 1;
  const base = SKIN_TONES[idx];
  const r = ramp(base);
  return { ...r, blush: mix(base, "#e2675a", 0.14), lip: mix(r.outline, "#7a2630", 0.35) };
}

export function drawNeck(g: Grid, skin: Ramp, opening: Mask): void {
  g.paint(NECK().union(opening), skin, { light: false, dither: false });
  g.fill(21, 34, 6, 1, skin.shade);
}

export function drawHead(g: Grid, skin: SkinRamp, jaw: "soft" | "square" = "soft", blush = true): void {
  const earL = m().rows(19, [[14, 15], [13, 15], [13, 15], [13, 15], [13, 15], [14, 15]]);
  const earR = m().rows(19, [[32, 33], [32, 34], [32, 34], [32, 34], [32, 34], [32, 33]]);
  g.paint(earL.union(earR), skin, { light: false, dither: false });
  g.set(14, 21, skin.shade).set(14, 22, skin.shade).set(33, 21, skin.deep).set(33, 22, skin.deep);
  g.paint(headMask(jaw), skin, { dither: false });
  g.set(24, 24, skin.shade).set(24, 25, skin.shade).set(23, 26, skin.deep).set(24, 26, skin.shade);
  g.set(22, 26, skin.shade);
  if (blush) g.fill(18, 25, 2, 1, skin.blush).fill(28, 25, 2, 1, skin.blush);
}

export interface FacePalette {
  brow: string;
  skin: SkinRamp;
}

/** Eye sprites are 4 wide and 7 tall, anchored at (17,17) for the left eye; the right eye mirrors at x=27. */
export function drawEyes(g: Grid, left: readonly string[], right: readonly string[] | "mirror", p: FacePalette): void {
  const pal = { b: p.brow, k: INK, p: INK, w: EYE_WHITE, l: p.skin.shade, s: p.skin.deep, g: "#ffffff", t: UI.cream };
  g.sprite(17, 17, left, pal);
  if (right === "mirror") g.sprite(27, 17, left, pal, true);
  else g.sprite(27, 17, right, pal);
}

/** Mouth sprites are 6 wide, anchored at (21,28). */
export function drawMouth(g: Grid, rows: readonly string[], skin: SkinRamp, x = 21, y = 28): void {
  g.sprite(x, y, rows, { m: skin.lip, d: "#4a1620", t: "#f4efe4", r: skin.shade, o: skin.outline });
}

export type Eyes = NonNullable<Extract<PortraitSpec, { kind: "human" }>["eyes"]>;
export type Mouth = NonNullable<Extract<PortraitSpec, { kind: "human" }>["mouth"]>;

export const EYES: Record<Eyes, { left: string[]; right: string[] | "mirror" }> = {
  neutral: { left: ["....", ".bbb", "....", ".kkk", ".wpw", ".wpw", "...."], right: "mirror" },
  narrow: { left: ["....", ".bb.", "..bb", "....", ".kkk", ".wpw", ".lll"], right: "mirror" },
  wide: { left: [".bbb", "....", "....", ".kkk", ".www", ".wpw", ".www"], right: "mirror" },
  tired: { left: ["....", "....", ".bbb", ".lll", ".kkk", ".wpw", ".sss"], right: "mirror" },
  smug: {
    left: [".bb.", "...b", "....", ".lll", ".kkk", ".wpw", "...."],
    right: ["....", "bbb.", "....", "lll.", "kkk.", "wpw.", "...."],
  },
  wink: {
    left: ["....", ".bbb", "....", ".kkk", ".wpw", ".wpw", "...."],
    right: ["....", "bbb.", "....", "....", ".k..", "k.k.", "...."],
  },
};

export const MOUTHS: Record<Mouth, string[]> = {
  neutral: ["......", ".mmmm.", "......"],
  smile: ["m....m", ".mmmm.", "..rr.."],
  smirk: [".....m", "..mmm.", "......"],
  frown: ["......", ".mmmm.", "m....m"],
  open: [".mmmm.", ".dttd.", "..mm.."],
};

interface OutfitDef {
  opening: () => Mask;
  body: (g: Grid, r: Ramp) => void;
  collar?: (g: Grid, r: Ramp) => void;
}

const vRows = (y0: number, lefts: number[]) => m().sym(y0, lefts, AXIS);
const ring = (inner: Mask, within: Mask): Mask => {
  const out = m();
  within.each((x, y) => {
    if (inner.has(x, y)) return;
    if (inner.has(x - 1, y) || inner.has(x + 1, y) || inner.has(x, y - 1) || inner.has(x, y + 1)) out.add(x, y);
  });
  return out;
};

const SHIRT = ramp(UI.cream);
const TEE = ramp("#25282a");

export const OUTFITS: Record<OutfitStyle, OutfitDef> = {
  tshirt: {
    opening: () => vRows(38, [20, 21, 22]),
    body: (g, r) => {
      g.paint(TORSO(), r);
      g.line(12, 45, 12, 59, r.shade);
      g.line(35, 45, 35, 59, r.shade);
    },
    collar: (g, r) => g.fillMask(ring(vRows(38, [20, 21, 22]), TORSO()), r.shade),
  },
  blazer: {
    opening: () => vRows(38, [21, 22]),
    body: (g, r) => {
      const torso = TORSO();
      g.paint(torso, r);
      const shirt = vRows(38, [19, 19, 20, 20, 21, 21, 22, 22, 23]);
      g.paint(shirt, SHIRT, { light: false });
      const lapelL = m().rows(38, Array.from({ length: 13 }, (_, i) => [Math.max(15, 17 + Math.floor(i / 2) - 2), 18 + Math.floor(i / 2)] as const));
      const lapelR = m().rows(38, Array.from({ length: 13 }, (_, i) => [29 - Math.floor(i / 2), Math.min(32, 30 - Math.floor(i / 2) + 2)] as const));
      g.paint(lapelL.union(lapelR).cut(shirt), { ...r, base: r.light, light: r.light });
      g.set(16, 42, r.outline).set(31, 42, r.outline);
      g.line(23, 47, 23, 59, r.outline);
      g.set(22, 50, r.deep).set(22, 54, r.deep);
      g.line(12, 46, 12, 59, r.shade);
      g.line(35, 46, 35, 59, r.shade);    },
  },
  hoodie: {
    opening: () => vRows(38, [21, 22]),
    body: (g, r) => {
      g.paint(TORSO(), r);
      g.paint(m().ellipse(23.5, 38.5, 10.5, 4.5), { ...r, base: r.shade, light: r.base });
      g.line(14, 52, 33, 52, r.outline);
      g.line(14, 52, 12, 59, r.outline);
      g.line(33, 52, 35, 59, r.outline);
    },
    collar: (g, r) => {
      g.fillMask(ring(vRows(38, [21, 22]), TORSO()), r.deep);
      for (let y = 42; y < 50; y++) {
        g.set(21, y, UI.cream).set(26, y, UI.cream);
      }
      g.fill(21, 50, 1, 2, SHIRT.shade).fill(26, 50, 1, 2, SHIRT.shade);
    },
  },
  dress: {
    opening: () => vRows(38, [19, 19, 20, 21, 22]),
    body: (g, r) => {
      g.paint(TORSO(), r);
      g.paint(m().ellipse(9, 44, 4.5, 4).union(m().ellipse(39, 44, 4.5, 4)), r);
      g.line(9, 41, 7, 43, r.light);
      g.line(39, 41, 41, 43, r.light);
      g.line(16, 53, 31, 53, r.shade);
      for (let x = 17; x < 31; x += 3) g.set(x, 54, r.deep);
    },
    collar: (g) => {
      const open = vRows(38, [19, 19, 20, 21, 22]);
      const c = ring(open, TORSO()).union(ring(ring(open, TORSO()).union(open), TORSO()).cut(m().rect(0, 42, PW, PH)));
      g.paint(c, SHIRT, { light: false, shade: false });
    },
  },
  turtleneck: {
    opening: () => m(),
    body: (g, r) => {
      g.paint(TORSO(), r);
      TORSO().each((x, y) => {
        if (x % 3 === 0 && y > 42 && (x + y) % 2 === 0) g.set(x, y, r.shade);
      });
    },
    collar: (g, r) => {
      const tube = m().rect(19, 32, 10, 8);
      g.paint(tube, r, { light: false });
      tube.each((x, y) => {
        if (x > 19 && x < 28 && y > 32 && x % 2 === 0) g.set(x, y, r.shade);
      });
      g.line(19, 35, 28, 35, r.outline);
    },
  },
  "leather-jacket": {
    opening: () => vRows(38, [21, 22]),
    body: (g, r) => {
      g.paint(TORSO(), r);
      g.paint(vRows(38, [19, 19, 20, 20, 21, 21, 22, 23]), TEE, { light: false });
      const lapels = m().rows(38, Array.from({ length: 11 }, (_, i) => [15 + Math.floor(i / 3), 18 + Math.floor(i / 2)] as const));
      lapels.union(m().rows(38, Array.from({ length: 11 }, (_, i) => [29 - Math.floor(i / 2), 32 - Math.floor(i / 3)] as const)));
      g.paint(lapels.cut(vRows(38, [19, 19, 20, 20, 21, 21, 22, 23])), r);
      g.line(26, 46, 21, 59, SILVER);
      g.line(13, 45, 13, 53, r.light);
      g.line(34, 45, 34, 52, r.light);
      g.set(10, 41, r.light).set(11, 41, r.light).set(37, 41, r.light);
      g.set(17, 47, SILVER).set(30, 47, SILVER);
    },
    collar: (g, r) => {
      const c = m().rows(32, [[18, 19], [17, 19], [16, 19], [16, 19], [15, 19], [15, 19], [15, 18]]);
      c.union(m().rows(32, [[28, 29], [28, 30], [28, 31], [28, 31], [28, 32], [28, 32], [29, 32]]));
      g.paint(c, r);
      g.line(17, 34, 17, 37, r.light);
      g.line(30, 34, 30, 37, r.shade);
    },
  },
  "lab-coat": {
    opening: () => vRows(38, [21, 22]),
    body: (g, r) => {
      const coat = ramp("#e6eaec");
      g.paint(TORSO(), coat);
      const shirt = vRows(38, [19, 19, 20, 20, 21, 21, 22, 22, 23]);
      g.paint(shirt, r, { light: false });
      g.paint(m().rect(23, 41, 2, 7), ramp(mix(r.base, UI.charcoal, 0.4)), { light: false });
      g.line(18, 38, 23, 48, coat.outline);
      g.line(29, 38, 24, 48, coat.outline);
      g.line(23, 49, 23, 59, coat.shade);
      g.paint(m().rect(29, 47, 6, 6), { ...coat, base: coat.base }, { light: false });
      g.fill(30, 45, 1, 3, UI.red).fill(32, 45, 1, 3, "#3a6fd8").fill(33, 46, 1, 2, UI.amber);
      g.line(12, 45, 12, 59, coat.shade);
      g.line(35, 45, 35, 59, coat.shade);
    },
  },
  trench: {
    opening: () => vRows(38, [21, 22]),
    body: (g, r) => {
      g.paint(TORSO(), r);
      g.paint(vRows(38, [19, 19, 20, 20, 21, 22]), SHIRT, { light: false });
      const lapels = m().rows(38, Array.from({ length: 13 }, (_, i) => [13 + Math.floor(i / 3), 18 + Math.floor(i / 2)] as const));
      lapels.union(m().rows(38, Array.from({ length: 13 }, (_, i) => [29 - Math.floor(i / 2), 34 - Math.floor(i / 3)] as const)));
      g.paint(lapels.cut(vRows(38, [19, 19, 20, 20, 21, 22])), { ...r, base: r.light, light: r.light });
      g.paint(m().rect(7, 41, 8, 2).rect(33, 41, 8, 2), r, { shade: false });
      g.set(13, 41, r.deep).set(34, 41, r.deep);
      for (const y of [51, 56]) g.set(19, y, r.deep).set(28, y, r.deep);
    },
    collar: (g, r) => {
      const c = m().rows(31, [[17, 19], [16, 19], [15, 19], [14, 19], [14, 19], [13, 19], [13, 18], [14, 17]]);
      c.union(m().rows(31, [[28, 30], [28, 31], [28, 32], [28, 33], [28, 33], [28, 34], [29, 34], [30, 33]]));
      g.paint(c, r);
    },
  },
};

export const ACCESSORY_ORDER: Accessory[] = [
  "lanyard",
  "pin",
  "scarf",
  "earrings",
  "earpiece",
  "headset",
  "glasses",
  "sunglasses",
  "vr-headset",
  "beret",
];

const GOLD = ramp("#e8b923");

export function drawAccessory(g: Grid, a: Accessory): void {
  switch (a) {
    case "glasses": {
      const frame = "#231a1e";
      for (const x0 of [16, 26]) {
        g.line(x0, 19, x0 + 5, 19, frame);
        g.line(x0, 23, x0 + 5, 23, frame);
        g.line(x0, 20, x0, 22, frame);
        g.line(x0 + 5, 20, x0 + 5, 22, frame);
        g.set(x0 + 1, 20, "#ffffff");
      }
      g.line(22, 20, 25, 20, frame);
      g.set(15, 20, frame).set(14, 20, frame).set(32, 20, frame).set(33, 20, frame);
      return;
    }
    case "sunglasses": {
      const lens = m().rect(16, 20, 6, 4).rect(26, 20, 6, 4);
      lens.del(16, 23).del(21, 23).del(26, 23).del(31, 23);
      g.paint(lens, { outline: "#07080a", deep: "#0f1114", shade: "#13161a", base: "#1b1f24", light: "#3c4650" }, { shade: false });
      g.line(17, 21, 18, 21, "#6f7d88").line(27, 21, 28, 21, "#6f7d88");
      g.line(22, 20, 25, 20, "#07080a");
      g.set(15, 20, "#07080a").set(14, 20, "#07080a").set(32, 20, "#07080a").set(33, 20, "#07080a");
      return;
    }
    case "earpiece": {
      g.fill(33, 21, 2, 2, "#1a1c1e").set(33, 21, "#4a5056");
      const coil = ["#d8e2df", "#8fa19c"];
      for (let y = 23; y < 40; y++) g.set(y % 2 === 0 ? 34 : 33, y, coil[y % 2]);
      return;
    }
    case "earrings": {
      for (const x of [13, 33]) {
        g.set(x + 1, 26, GOLD.outline);
        g.sprite(x, 27, [".g.", "g.g", ".g."], { g: GOLD.base });
        g.set(x + 1, 29, GOLD.light);
      }
      return;
    }
    case "lanyard": {
      const strap = UI.red;
      g.line(19, 39, 22, 46, strap);
      g.line(20, 39, 23, 46, mix(strap, UI.charcoal, 0.3));
      g.line(28, 39, 25, 46, strap);
      g.line(27, 39, 24, 46, mix(strap, UI.charcoal, 0.3));
      g.paint(m().rect(20, 46, 8, 8), ramp(UI.cream), { light: false });
      g.fill(21, 47, 6, 1, UI.acid);
      g.fill(21, 48, 3, 3, "#8a9690");
      g.fill(25, 49, 2, 1, "#5a625e").fill(25, 51, 2, 1, "#5a625e").fill(21, 52, 6, 1, "#5a625e");
      g.fill(23, 45, 2, 1, SILVER);
      return;
    }
    case "headset": {
      const band = ramp("#30363a");
      const arc = m().ellipse(23.5, 18, 12.5, 13).cut(m().ellipse(23.5, 18, 10.5, 11)).cut(m().rect(0, 18, PW, PH));
      g.paint(arc, band, { shade: false });
      g.paint(m().rect(10, 18, 5, 8), band);
      g.paint(m().rect(33, 19, 3, 6), band);
      g.set(11, 21, UI.acid);
      g.line(13, 26, 19, 30, "#30363a");
      g.fill(19, 29, 2, 2, "#1b1f22");
      return;
    }
    case "beret": {
      const r = ramp("#8f1f2c");
      g.paint(m().rows(5, [[18, 31], [14, 34], [11, 36], [10, 36], [10, 35], [11, 33], [12, 30], [14, 22]]), r);
      g.fill(25, 3, 2, 2, r.outline);
      g.line(15, 7, 23, 6, r.light);
      return;
    }
    case "pin": {
      g.sprite(29, 43, [".cc.", "cppc", "cppc", ".cc.", "..g."], { c: "#f6eef2", p: "#e48aa6", g: "#5f8a3a" });
      return;
    }
    case "scarf": {
      const r = ramp("#d9822b");
      const wrap = m().rows(34, [[18, 29], [17, 30], [16, 31], [16, 31], [17, 30], [18, 29]]);
      const tail = m().rows(39, Array.from({ length: 12 }, (_, i) => [26 + (i > 6 ? 1 : 0), 30 + (i > 6 ? 1 : 0)] as const));
      g.paint(wrap.union(tail), r);
      for (let x = 17; x < 31; x += 3) g.line(x, 35, x + 1, 38, r.shade);
      for (let y = 42; y < 50; y += 3) g.line(27, y, 30, y, UI.cream);
      g.set(27, 51, r.outline).set(29, 51, r.outline).set(31, 51, r.outline);
      return;
    }
    case "vr-headset": {
      const body = ramp("#2a2f34");
      g.paint(m().rect(11, 19, 3, 4).rect(34, 19, 3, 4), body, { shade: false });
      const visor = m().rect(13, 16, 22, 10);
      visor.del(13, 16).del(34, 16).del(13, 25).del(34, 25);
      g.paint(visor, body);
      g.fill(15, 20, 18, 2, UI.acid);
      g.fill(15, 22, 18, 1, mix(UI.acid, "#2a2f34", 0.55));
      g.fill(16, 18, 6, 1, body.light);
      return;
    }
  }
}

/** Torso, neck and anything of the outfit that wraps over the neck. */
export function drawOutfit(g: Grid, style: OutfitStyle, color: Ramp, skin: Ramp): void {
  const outfit = OUTFITS[style] ?? OUTFITS.tshirt;
  outfit.body(g, color);
  drawNeck(g, skin, outfit.opening());
  outfit.collar?.(g, color);
}

