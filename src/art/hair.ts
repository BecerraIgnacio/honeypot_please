import type { HairStyle } from "../game/types";
import { Grid, Mask, type Ramp, UI, mix } from "./pixel";
import { AXIS, PH, PW, m } from "./stage";

export const DEFAULT_HAIR = "#3a2a20";

export interface HairDef {
  back?: () => Mask;
  front?: () => Mask;
  /** Runs after the front is painted; area is back and front together. */
  detail?: (g: Grid, r: Ramp, area: Mask) => void;
  /** Replaces the default outlined paint of the front mask. */
  paintFront?: (g: Grid, r: Ramp, front: Mask, skin: Ramp) => void;
  /** Brows take the hair color unless the hair is hidden or absent. */
  browColor?: (r: Ramp) => string;
}

const CAP = [19, 17, 15, 14, 13, 13] as const;
const bumpy = (mask: Mask, period: number): Mask => {
  const edge: [number, number][] = [];
  mask.each((x, y) => {
    if (!mask.has(x - 1, y) || !mask.has(x + 1, y) || !mask.has(x, y - 1) || !mask.has(x, y + 1)) edge.push([x, y]);
  });
  edge.forEach(([x, y]) => {
    if ((x * 7 + y * 3) % period === 0) mask.del(x, y);
  });
  return mask;
};
/** Texture only the pixels that currently show the hair's own fill, never face or outline. */
const speckle = (g: Grid, r: Ramp, area: Mask, pick: (x: number, y: number) => "light" | "shade" | null): void => {
  area.each((x, y) => {
    const c = g.get(x, y);
    if (c !== r.base && c !== r.light) return;
    const tone = pick(x, y);
    if (tone) g.set(x, y, r[tone]);
  });
};
const faceWindow = () =>
  m().sym(11, [19, 17, ...Array<number>(17).fill(16), 17, 17, 18, 19, 20, 21], AXIS);

export const HAIR: Record<HairStyle, HairDef> = {
  bob: {
    back: () => m().sym(6, [...CAP, ...Array<number>(18).fill(12), 11, 11, 12], AXIS),
    front: () =>
      m()
        .sym(6, CAP, AXIS)
        .rows(12, [[13, 31], [13, 28], [13, 25], [13, 21], [13, 18], [13, 16]])
        .rows(12, Array.from({ length: 21 }, () => [12, 15] as const))
        .rows(12, Array.from({ length: 21 }, () => [32, 35] as const)),
    detail: (g, r) => {
      g.line(26, 7, 17, 15, r.light);
      g.line(29, 8, 30, 11, r.shade);
    },
  },
  long: {
    back: () => m().sym(6, [...CAP, ...Array<number>(32).fill(12)], AXIS),
    front: () =>
      m()
        .sym(6, CAP, AXIS)
        .rows(12, [[13, 22], [13, 19], [13, 17], [13, 16]])
        .rows(12, [[25, 34], [28, 34], [30, 34], [31, 34]])
        .rows(16, Array.from({ length: 34 }, (_, i) => [i < 14 ? 12 : 11, 15 + (i > 16 ? 1 : 0)] as const))
        .rows(16, Array.from({ length: 34 }, (_, i) => [32 - (i > 16 ? 1 : 0), i < 14 ? 35 : 36] as const))
        .rows(50, [[12, 15], [32, 35]]),
    detail: (g, r) => {
      for (let y = 7; y < 12; y++) g.set(23, y, r.shade);
      for (let y = 30; y < 50; y += 3) {
        g.set(13, y, r.shade).set(34, y + 1, r.shade);
      }
      g.line(20, 8, 15, 13, r.light);
    },
  },
  bun: {
    back: () => m().ellipse(23.5, 5, 5.5, 4),
    front: () =>
      m()
        .sym(6, [19, 17, 15, 14, 14, 14], AXIS)
        .rows(12, [[14, 17], [14, 15], [14, 15], [14, 15], [14, 15], [14, 15], [14, 15]])
        .rows(12, [[30, 33], [32, 33], [32, 33], [32, 33], [32, 33], [32, 33], [32, 33]]),
    detail: (g, r) => {
      g.line(20, 4, 23, 2, r.shade);
      g.line(25, 6, 27, 4, r.shade);
      g.line(19, 9, 22, 7, r.light);
      g.line(28, 9, 25, 7, r.shade);
      g.set(21, 3, r.light).set(22, 3, r.light);
    },
  },
  pixie: {
    front: () =>
      m()
        .sym(7, [18, 16, 15, 14, 13], AXIS)
        .rows(5, [[19, 19], [22, 23], [26, 26]])
        .rows(6, [[18, 20], [21, 24], [26, 28]])
        .rows(12, [[14, 33], [19, 33], [24, 33], [29, 33]])
        .rows(12, Array.from({ length: 7 }, () => [13, 15] as const))
        .rows(16, Array.from({ length: 3 }, () => [32, 34] as const)),
    detail: (g, r) => {
      g.line(17, 9, 21, 12, r.light);
      g.line(22, 9, 27, 13, r.shade);
      g.line(28, 9, 31, 14, r.shade);
    },
  },
  curly: {
    back: () => bumpy(m().ellipse(23.5, 19, 15.5, 15), 4),
    front: () =>
      bumpy(
        m()
          .ellipse(23.5, 19, 15.5, 15)
          .cut(faceWindow())
          .cut(m().rect(0, 31, PW, PH))
          .union(m().rows(12, [[16, 18], [20, 23], [24, 27], [29, 31]]))
          .union(m().rows(13, [[16, 17], [21, 22], [25, 26], [30, 31]])),
        5,
      ),
    detail: (g, r, area) => speckle(g, r, area, (x, y) => ((x * 3 + y * 5) % 7 === 0 ? "light" : (x * 3 + y * 5) % 7 === 3 ? "shade" : null)),
  },
  ponytail: {
    back: () =>
      m().rows(10, [
        [33, 36], [33, 37], [33, 38], ...Array.from({ length: 8 }, () => [34, 39] as const),
        ...Array.from({ length: 8 }, () => [35, 39] as const), ...Array.from({ length: 6 }, () => [35, 38] as const),
        [36, 38], [36, 38], [36, 37], [37, 37],
      ] as const),
    front: () =>
      m()
        .sym(6, [19, 17, 15, 14, 14, 14], AXIS)
        .rows(12, [[14, 18], [14, 15], [14, 15], [14, 15], [14, 15], [14, 15], [14, 15]])
        .rows(12, [[29, 33], [32, 33], [32, 33], [32, 33], [32, 33], [32, 33], [32, 33]]),
    detail: (g, r) => {
      g.line(17, 9, 31, 8, r.shade);
      g.line(19, 7, 30, 7, r.light);
      g.fill(33, 11, 3, 2, UI.red);
      for (let y = 16; y < 36; y += 4) g.set(37, y, r.shade);
    },
  },
  braids: {
    back: () => m().sym(6, [...CAP, ...Array<number>(18).fill(13)], AXIS),
    front: () =>
      m()
        .sym(6, [19, 17, 15, 14, 14, 14], AXIS)
        .rows(12, [[14, 22], [14, 18], [14, 16]])
        .rows(12, [[25, 33], [29, 33], [31, 33]])
        .rows(15, Array.from({ length: 12 }, () => [13, 15] as const))
        .rows(15, Array.from({ length: 12 }, () => [32, 34] as const))
        .rows(27, Array.from({ length: 24 }, () => [12, 15] as const))
        .rows(27, Array.from({ length: 24 }, () => [32, 35] as const))
        .rows(51, [[13, 14], [33, 34]]),
    detail: (g, r) => {
      for (let y = 7; y < 12; y++) g.set(23, y, r.shade);
      for (let y = 28; y < 49; y += 3) {
        g.line(13, y, 14, y + 1, r.light);
        g.set(14, y + 2, r.outline);
        g.line(33, y, 34, y + 1, r.light);
        g.set(33, y + 2, r.outline);
      }
      g.fill(12, 49, 4, 2, UI.amber).fill(32, 49, 4, 2, UI.amber);
    },
  },
  afro: {
    back: () => bumpy(m().ellipse(23.5, 15, 18, 14.5), 3),
    front: () =>
      bumpy(
        m()
          .ellipse(23.5, 15, 18, 14.5)
          .cut(m().sym(11, [19, 17, 16, 16, 15], AXIS).rect(16, 16, 16, 30))
          .cut(m().rect(0, 27, PW, PH)),
        3,
      ),
    detail: (g, r, area) =>
      speckle(g, r, area, (x, y) => ((x * 5 + y * 11) % 13 === 0 ? "light" : (x * 7 + y * 3) % 11 === 0 ? "shade" : null)),
  },
  bangs: {
    back: () => m().sym(6, [...CAP, ...Array<number>(33).fill(12), 13], AXIS),
    front: () =>
      m()
        .sym(6, CAP, AXIS)
        .rows(12, Array.from({ length: 6 }, () => [13, 34] as const))
        .rows(18, Array.from({ length: 27 }, () => [12, 15] as const))
        .rows(18, Array.from({ length: 27 }, () => [32, 35] as const)),
    detail: (g, r) => {
      for (let x = 15; x < 33; x += 3) {
        g.set(x, 15, r.shade).set(x, 16, r.shade);
      }
      g.line(16, 8, 30, 8, r.light);
    },
  },
  shaved: {
    front: () => m().sym(9, [18, 17, 16, 16, 16], AXIS).rows(14, [[16, 16], [16, 16], [16, 16]]).rows(14, [[31, 31], [31, 31], [31, 31]]),
    paintFront: (g, r, front, skin) => {
      front.each((x, y) => g.set(x, y, (x + y) % 2 === 0 ? r.base : mix(skin.base, r.base, 0.45)));
      g.line(19, 10, 22, 10, mix(skin.base, "#ffffff", 0.3));
    },
    browColor: (r) => mix(r.outline, "#2b1d16", 0.4),
  },
  hijab: {
    browColor: () => "#2b1d16",
    back: () => m().ellipse(23.5, 17, 13.5, 13).rect(10, 22, 28, 18),
    front: () =>
      m()
        .ellipse(23.5, 17, 13.5, 13)
        .rect(11, 24, 26, 12)
        .sym(34, [12, 11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 8, 9, 11, 14], AXIS)
        .cut(faceWindow().cut(m().rect(0, 34, PW, PH))),
    detail: (g, r) => {
      g.line(13, 10, 17, 6, r.light);
      g.line(12, 36, 18, 47, r.shade);
      g.line(35, 36, 29, 47, r.shade);
      g.line(20, 37, 23, 47, r.shade);
      g.line(14, 20, 14, 30, r.shade);
    },
  },
};
