export type PixelSvg = string & { readonly __brand: "PixelSvg" };

export const UI = {
  charcoal: "#0d0f0e",
  panel: "#151816",
  acid: "#b6ff00",
  cream: "#f1e9d2",
  red: "#e5322d",
  amber: "#ffb000",
} as const;

const HEX6 = /^#[0-9a-f]{6}$/;
const HEX3 = /^#[0-9a-f]{3}$/;

export function safeHex(input: unknown, fallback: string): string {
  if (typeof input !== "string") return fallback;
  const s = input.trim().toLowerCase();
  if (HEX6.test(s)) return s;
  if (HEX3.test(s)) return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return fallback;
}

function channels(c: string): [number, number, number] {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

export function mix(a: string, b: string, t: number): string {
  const ca = channels(a);
  const cb = channels(b);
  return (
    "#" +
    ca
      .map((v, i) => Math.round(v + (cb[i] - v) * t))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function luma(c: string): number {
  const [r, g, b] = channels(c);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export interface Ramp {
  outline: string;
  deep: string;
  shade: string;
  base: string;
  light: string;
}

/** Hue-shifted ramp: shadows lean cool purple, highlights lean warm cream. */
export function ramp(base: string): Ramp {
  const dark = luma(base) < 0.18;
  return {
    outline: mix(base, UI.charcoal, dark ? 0.55 : 0.68),
    deep: mix(base, "#1b1030", dark ? 0.3 : 0.5),
    shade: mix(base, "#2a1b3d", dark ? 0.15 : 0.3),
    base,
    light: mix(base, "#fff4d6", dark ? 0.22 : 0.32),
  };
}

export class Mask {
  readonly w: number;
  readonly h: number;
  readonly bits: Uint8Array;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.bits = new Uint8Array(w * h);
  }

  has(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h && this.bits[y * this.w + x] === 1;
  }

  add(x: number, y: number): this {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.bits[y * this.w + x] = 1;
    return this;
  }

  del(x: number, y: number): this {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.bits[y * this.w + x] = 0;
    return this;
  }

  rect(x: number, y: number, w: number, h: number): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.add(i, j);
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number): this {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.add(x, y);
      }
    }
    return this;
  }

  /** One inclusive [x0, x1] span per row, starting at row y0. */
  rows(y0: number, spans: ReadonlyArray<readonly [number, number]>): this {
    spans.forEach(([a, b], i) => {
      for (let x = a; x <= b; x++) this.add(x, y0 + i);
    });
    return this;
  }

  /** Rows mirrored about the vertical axis where x and (axis - x) are partners. */
  sym(y0: number, lefts: ReadonlyArray<number>, axis: number): this {
    return this.rows(
      y0,
      lefts.map((a) => [a, axis - a] as const),
    );
  }

  union(o: Mask): this {
    for (let i = 0; i < this.bits.length; i++) if (o.bits[i]) this.bits[i] = 1;
    return this;
  }

  cut(o: Mask): this {
    for (let i = 0; i < this.bits.length; i++) if (o.bits[i]) this.bits[i] = 0;
    return this;
  }

  clip(o: Mask): this {
    for (let i = 0; i < this.bits.length; i++) if (!o.bits[i]) this.bits[i] = 0;
    return this;
  }

  clone(): Mask {
    const m = new Mask(this.w, this.h);
    m.bits.set(this.bits);
    return m;
  }

  each(fn: (x: number, y: number) => void): void {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.bits[y * this.w + x]) fn(x, y);
  }
}

export type SpritePalette = Readonly<Record<string, string | undefined>>;

export class Grid {
  readonly w: number;
  readonly h: number;
  private readonly px: (string | undefined)[];

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.px = new Array<string | undefined>(w * h);
  }

  mask(): Mask {
    return new Mask(this.w, this.h);
  }

  get(x: number, y: number): string | undefined {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return undefined;
    return this.px[y * this.w + x];
  }

  set(x: number, y: number, c: string | undefined): this {
    if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c;
    return this;
  }

  fill(x: number, y: number, w: number, h: number, c: string): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
    return this;
  }

  fillMask(m: Mask, c: string): this {
    m.each((x, y) => this.set(x, y, c));
    return this;
  }

  /** Blend existing pixels toward c; with dither, only every other pixel. */
  tint(m: Mask, c: string, t: number, dither = false): this {
    m.each((x, y) => {
      const cur = this.get(x, y);
      if (cur && (!dither || (x + y) % 2 === 0)) this.set(x, y, mix(cur, c, t));
    });
    return this;
  }

  /**
   * Fill a mask with a ramp: 1px darker outline on its edge, a dithered shadow band
   * on the bottom-right inside, a highlight band on the top-left inside.
   * Pixels off the grid count as inside so shapes cut by the frame stay open.
   */
  paint(m: Mask, r: Ramp, opts: { outline?: boolean; shade?: boolean; light?: boolean; dither?: boolean } = {}): this {
    const { outline = true, shade = true, light = true, dither = true } = opts;
    const inside = (x: number, y: number) => x < 0 || y < 0 || x >= this.w || y >= this.h || m.has(x, y);
    m.each((x, y) => {
      let c = r.base;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (edge && outline) c = r.outline;
      else if (shade && (!inside(x + 2, y) || !inside(x, y + 2) || !inside(x + 1, y + 1))) c = r.shade;
      else if (shade && dither && (x + y) % 2 === 0 && (!inside(x + 3, y) || !inside(x, y + 3))) c = r.shade;
      else if (light && (!inside(x - 2, y) || !inside(x, y - 2)) && !(edge && !outline)) c = r.light;
      this.set(x, y, c);
    });
    return this;
  }

  /** Rows of characters; each character maps to a color, unknown characters are transparent. */
  sprite(x: number, y: number, rows: ReadonlyArray<string>, pal: SpritePalette, flip = false): this {
    rows.forEach((row, j) => {
      const len = row.length;
      for (let i = 0; i < len; i++) {
        const ch = flip ? row[len - 1 - i] : row[i];
        this.set(x + i, y + j, pal[ch]);
      }
    });
    return this;
  }

  line(x0: number, y0: number, x1: number, y1: number, c: string): this {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      this.set(x, y, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
    return this;
  }

  /** Serialize with horizontal runs merged, then identical runs merged down rows, grouped by fill. */
  toSvg(width: number): PixelSvg {
    const outW = Number.isFinite(width) && width > 0 ? Math.round(width) : this.w;
    const outH = Math.round((outW * this.h) / this.w);
    interface Run {
      x: number;
      y: number;
      w: number;
      h: number;
      c: string;
    }
    const groups = new Map<string, string[]>();
    const emit = (r: Run) => {
      const list = groups.get(r.c) ?? [];
      list.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>`);
      groups.set(r.c, list);
    };
    let open = new Map<string, Run>();
    for (let y = 0; y < this.h; y++) {
      const next = new Map<string, Run>();
      let x = 0;
      while (x < this.w) {
        const c = this.px[y * this.w + x];
        let end = x + 1;
        while (end < this.w && this.px[y * this.w + end] === c) end++;
        if (c) {
          const key = `${x},${end - x},${c}`;
          const prev = open.get(key);
          if (prev) {
            prev.h++;
            open.delete(key);
            next.set(key, prev);
          } else {
            next.set(key, { x, y, w: end - x, h: 1, c });
          }
        }
        x = end;
      }
      open.forEach(emit);
      open = next;
    }
    open.forEach(emit);
    let body = "";
    groups.forEach((rects, c) => {
      body += `<g fill="${c}">${rects.join("")}</g>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${outW}" height="${outH}" shape-rendering="crispEdges">${body}</svg>` as PixelSvg;
  }
}

const FONT_3X5: Readonly<Record<string, readonly string[]>> = {
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["..#", "..#", "..#", "#.#", ".#."],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"],
  O: [".#.", "#.#", "#.#", "#.#", ".#."],
  P: ["##.", "#.#", "##.", "#..", "#.."],
  Q: [".#.", "#.#", "#.#", "##.", ".##"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."],
  W: ["#.#", "#.#", "###", "###", "#.#"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  Z: ["###", "..#", ".#.", "#..", "###"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["##.", "..#", ".#.", "#..", "###"],
  "3": ["##.", "..#", ".#.", "..#", "##."],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "##.", "..#", "##."],
  "6": [".##", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "##."],
  "-": ["...", "...", "###", "...", "..."],
  ".": ["...", "...", "...", "...", ".#."],
  ",": ["...", "...", "...", ".#.", "#.."],
  "!": [".#.", ".#.", ".#.", "...", ".#."],
  "?": ["##.", "..#", ".#.", "...", ".#."],
  "#": ["#.#", "###", "#.#", "###", "#.#"],
  "&": [".#.", "#.#", ".#.", "#.#", ".##"],
  "/": ["..#", "..#", ".#.", "#..", "#.."],
  ":": ["...", ".#.", "...", ".#.", "..."],
  "'": [".#.", ".#.", "...", "...", "..."],
  " ": ["...", "...", "...", "...", "..."],
};

/** Uppercases and drops characters the 3x5 font cannot draw. */
export function fontSafe(text: string): string {
  return Array.from(String(text).toUpperCase())
    .filter((ch) => ch in FONT_3X5)
    .join("");
}

export function textWidth(text: string, scale = 1): number {
  const n = fontSafe(text).length;
  return n === 0 ? 0 : (n * 4 - 1) * scale;
}

export function drawText(g: Grid, x: number, y: number, text: string, c: string, scale = 1): void {
  Array.from(fontSafe(text)).forEach((ch, i) => {
    FONT_3X5[ch].forEach((row, j) => {
      for (let k = 0; k < 3; k++) {
        if (row[k] === "#") g.fill(x + (i * 4 + k) * scale, y + j * scale, scale, scale, c);
      }
    });
  });
}
