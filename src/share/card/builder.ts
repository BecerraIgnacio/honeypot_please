import { displayUrl } from "../config";
import { fitText, type FittedText } from "./fit";
import type { Box, CardData, DrawOp, FontRole, Measure, TextOp, TextureKind } from "./types";

export const PALETTE = {
  ink: "#0d0f0e",
  ink2: "#151816",
  acid: "#b6ff00",
  paper: "#f1e9d2",
  red: "#e5322d",
  amber: "#ffb000",
} as const;

export const BRAND = "HONEYPOT, PLEASE";

export function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function inset(box: Box, dx: number, dy = dx): Box {
  return { x: box.x + dx, y: box.y + dy, w: Math.max(0, box.w - 2 * dx), h: Math.max(0, box.h - 2 * dy) };
}

/** Splits a box into columns (px widths; `"*"` shares what is left). */
export function splitH(box: Box, widths: Array<number | "*">, gap: number): Box[] {
  return split(box.w, widths, gap).map(([offset, size]) => ({ x: box.x + offset, y: box.y, w: size, h: box.h }));
}

export function splitV(box: Box, heights: Array<number | "*">, gap: number): Box[] {
  return split(box.h, heights, gap).map(([offset, size]) => ({ x: box.x, y: box.y + offset, w: box.w, h: size }));
}

function split(total: number, parts: Array<number | "*">, gap: number): Array<[number, number]> {
  const fixed = parts.reduce<number>((sum, p) => sum + (p === "*" ? 0 : p), 0);
  const flex = parts.filter((p) => p === "*").length;
  const flexSize = flex ? Math.max(0, (total - fixed - gap * (parts.length - 1)) / flex) : 0;
  let offset = 0;
  return parts.map((p) => {
    const size = p === "*" ? flexSize : p;
    const slot: [number, number] = [offset, size];
    offset += size + gap;
    return slot;
  });
}

export interface TextStyle {
  role: FontRole;
  color: string;
  maxSize: number;
  minSize?: number;
  weight?: number;
  lineHeight?: number;
  maxLines?: number;
  align?: TextOp["align"];
  valign?: TextOp["valign"];
  tracking?: number;
  uppercase?: boolean;
  rotate?: number;
  alpha?: number;
  highlight?: string;
  padX?: number;
  shadow?: TextOp["shadow"];
  stroke?: TextOp["stroke"];
}

export interface Column {
  x: number;
  y: number;
  w: number;
  bottom: number;
}

export function column(box: Box): Column {
  return { x: box.x, y: box.y, w: box.w, bottom: box.y + box.h };
}

export class CardBuilder {
  readonly ops: DrawOp[] = [];
  readonly width: number;
  readonly height: number;
  readonly data: CardData;
  private readonly measure: Measure;
  private seedCounter = 0;

  constructor(width: number, height: number, data: CardData, measure: Measure) {
    this.width = width;
    this.height = height;
    this.data = data;
    this.measure = measure;
  }

  get landscape(): boolean {
    return this.width > this.height;
  }

  get frame(): Box {
    return { x: 0, y: 0, w: this.width, h: this.height };
  }

  /** Area relative to the 1200×675 baseline, so type reads the same weight on both formats. */
  get unit(): number {
    return Math.sqrt((this.width * this.height) / (1200 * 675));
  }

  seed(): number {
    this.seedCounter += 1;
    return hashString(`${this.data.style}|${this.data.title}|${this.seedCounter}`);
  }

  push(op: DrawOp): void {
    this.ops.push(op);
  }

  rect(box: Box, fill: string, extra: Partial<Extract<DrawOp, { kind: "rect" }>> = {}): void {
    this.push({ kind: "rect", box, fill, ...extra });
  }

  frameRect(box: Box, stroke: string, lineWidth: number, extra: Partial<Extract<DrawOp, { kind: "rect" }>> = {}): void {
    this.push({ kind: "rect", box: inset(box, lineWidth / 2), stroke, lineWidth, ...extra });
  }

  ellipse(box: Box, fill?: string, extra: Partial<Extract<DrawOp, { kind: "ellipse" }>> = {}): void {
    this.push({ kind: "ellipse", box, fill, ...extra });
  }

  poly(
    points: Array<[number, number]>,
    style: { fill?: string; stroke?: string; lineWidth?: number; closed?: boolean; alpha?: number; blend?: GlobalCompositeOperation },
  ): void {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const pad = (style.lineWidth ?? 0) / 2;
    const box = {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + 2 * pad,
      h: Math.max(...ys) - Math.min(...ys) + 2 * pad,
    };
    this.push({ kind: "poly", box, points, closed: style.closed ?? true, ...style });
  }

  texture(
    box: Box,
    texture: TextureKind,
    color: string,
    alpha: number,
    extra: { density?: number; blend?: GlobalCompositeOperation; clip?: "ellipse"; origin?: [number, number] } = {},
  ): void {
    this.push({ kind: "texture", box, texture, color, alpha, seed: this.seed(), ...extra });
  }

  /** Fits text into the box and records it with a box shrunk to the lines it actually uses. */
  text(box: Box, content: string, style: TextStyle): FittedText & { box: Box } {
    const lineHeight = style.lineHeight ?? 1.1;
    const padX = style.padX ?? 0;
    const source = style.uppercase ? content.toUpperCase() : content;
    const fitted = fitText(
      source,
      { w: Math.max(1, box.w - 2 * padX), h: box.h },
      {
        role: style.role,
        weight: style.weight ?? 400,
        maxSize: style.maxSize * this.unit,
        minSize: (style.minSize ?? Math.max(10, style.maxSize * 0.35)) * this.unit,
        lineHeight,
        maxLines: style.maxLines,
        tracking: style.tracking,
      },
      this.measure,
    );
    const valign = style.valign ?? "top";
    const used = Math.min(box.h, Math.ceil(fitted.height));
    const y = valign === "top" ? box.y : valign === "bottom" ? box.y + box.h - used : box.y + (box.h - used) / 2;
    const tight = { x: box.x, y, w: box.w, h: used };
    this.push({
      kind: "text",
      box: tight,
      text: content,
      lines: fitted.lines,
      font: { role: style.role, size: fitted.size, weight: style.weight ?? 400 },
      color: style.color,
      lineHeight,
      align: style.align ?? "left",
      valign: "top",
      tracking: fitted.tracking,
      padX,
      highlight: style.highlight,
      shadow: style.shadow,
      stroke: style.stroke,
      rotate: style.rotate,
      alpha: style.alpha,
      truncated: fitted.truncated,
    });
    return { ...fitted, box: tight };
  }

  /** Places text at the column cursor and advances it. */
  flow(col: Column, content: string, style: TextStyle, maxHeight: number, gap: number): void {
    if (!content.trim()) return;
    const h = Math.max(0, Math.min(maxHeight, col.bottom - col.y));
    if (h < 8) return;
    const placed = this.text({ x: col.x, y: col.y, w: col.w, h }, content, style);
    col.y += placed.box.h + gap;
  }

  stamp(box: Box, content: string, color: string, rotate: number, maxSize: number): void {
    const fitted = fitText(
      content.toUpperCase(),
      { w: box.w * 0.84, h: box.h * 0.7 },
      { role: "display", weight: 700, maxSize: maxSize * this.unit, minSize: 12, lineHeight: 1, maxLines: 2 },
      this.measure,
    );
    this.push({
      kind: "stamp",
      box,
      text: content,
      lines: fitted.lines,
      font: { role: "display", size: fitted.size, weight: 700 },
      color,
      rotate,
      seed: this.seed(),
      alpha: 0.88,
    });
  }

  stats(): CardData["stats"] {
    return this.data.stats.filter((s) => s.label.trim() || s.value.trim()).slice(0, 4);
  }

  /** The jacket silhouette: the built-in illustration when there is no portrait. */
  silhouette(box: Box, fill: string, accent: string): void {
    const cx = box.x + box.w / 2;
    const s = Math.min(box.w, box.h);
    const top = box.y + box.h - s * 0.92;
    const head = { x: cx - s * 0.16, y: top, w: s * 0.32, h: s * 0.36 };
    const shoulderY = top + s * 0.42;
    const base = box.y + box.h;
    this.poly(
      [
        [cx - s * 0.12, shoulderY - s * 0.04],
        [cx + s * 0.12, shoulderY - s * 0.04],
        [cx + s * 0.4, shoulderY + s * 0.08],
        [cx + s * 0.46, base],
        [cx - s * 0.46, base],
        [cx - s * 0.4, shoulderY + s * 0.08],
      ],
      { fill },
    );
    this.poly(
      [
        [cx - s * 0.12, shoulderY - s * 0.03],
        [cx, shoulderY + s * 0.3],
        [cx + s * 0.12, shoulderY - s * 0.03],
        [cx + s * 0.05, base],
        [cx - s * 0.05, base],
      ],
      { stroke: accent, lineWidth: Math.max(2, s * 0.012), closed: true, alpha: 0.7 },
    );
    this.ellipse(head, fill);
  }

  /**
   * Illustration panel: procedural backdrop, then art (if any), then the portrait.
   * Art that fails to load is skipped at draw time, so the backdrop always shows.
   */
  illustration(box: Box, opts: { bg: string; fg: string; accent: string; clip?: "ellipse" }): void {
    const { data } = this;
    const clip = opts.clip;
    this.push({ kind: "rect", box, fill: opts.bg, clip });
    this.texture(box, "halftone", opts.accent, 0.28, { density: Math.round(11 * this.unit), clip });
    if (!data.portraitSvg) this.silhouette(inset(box, box.w * 0.12, box.h * 0.06), opts.fg, opts.accent);
    if (data.artUrl) this.push({ kind: "image", box, source: "art", fit: "cover", clip });
    if (data.portraitSvg) {
      if (data.artUrl) {
        const side = Math.min(box.w, box.h) * 0.36;
        const pad = 12 * this.unit;
        const mug = { x: box.x + pad, y: box.y + box.h - side - pad, w: side, h: side };
        this.rect(inset(mug, -4 * this.unit), PALETTE.paper);
        this.push({ kind: "image", box: mug, source: "portrait", fit: "contain" });
      } else {
        this.push({ kind: "image", box: inset(box, box.w * 0.06, box.h * 0.04), source: "portrait", fit: "contain", clip });
      }
    }
  }

  footer(box: Box, color: string, accent: string): void {
    const [brand, url] = splitH(box, ["*", "*"], 16 * this.unit);
    this.text(brand, BRAND, { role: "pixel", color: accent, maxSize: 18, minSize: 9, maxLines: 1, valign: "middle", lineHeight: 1.2 });
    this.text(url, displayUrl(this.data.gameUrl) || BRAND, {
      role: "mono",
      weight: 700,
      color,
      maxSize: 18,
      minSize: 9,
      maxLines: 1,
      align: "right",
      valign: "middle",
      lineHeight: 1.2,
    });
  }
}

export function starPoints(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  spikes: number,
  rotation = -Math.PI / 2,
): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + (i * Math.PI) / spikes;
    points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return points;
}

export function fileNumber(data: CardData): string {
  return data.caseFileNo?.trim() || `RPC7-${String(hashString(data.title) % 100000).padStart(5, "0")}`;
}
