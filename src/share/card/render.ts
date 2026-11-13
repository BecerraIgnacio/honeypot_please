import { drawCard, fontString } from "./draw";
import { layoutCard } from "./layout";
import type { CardAssets, CardData, CardFonts, CardImage, CardSize, FontRole, Measure } from "./types";

const ROLES: readonly FontRole[] = ["pixel", "mono", "display"];

export const FONT_FALLBACKS: CardFonts = {
  pixel: "ui-monospace, monospace",
  mono: "ui-monospace, Menlo, Consolas, monospace",
  display: "Impact, 'Arial Narrow Bold', 'Arial Black', sans-serif",
};

/** Reads `--font-pixel`, `--font-mono`, `--font-display` from the document, with generic fallbacks. */
export function resolveFonts(root: Element = document.documentElement): CardFonts {
  const style = getComputedStyle(root);
  const read = (role: FontRole) => {
    const value = style.getPropertyValue(`--font-${role}`).trim();
    return value ? `${value}, ${FONT_FALLBACKS[role]}` : FONT_FALLBACKS[role];
  };
  return { pixel: read("pixel"), mono: read("mono"), display: read("display") };
}

/** Canvas text only uses a web font once it is loaded, so request each face before drawing. */
export async function ensureFontsLoaded(fonts: CardFonts): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.allSettled(
    ROLES.flatMap((role) => [400, 700].map((weight) => document.fonts.load(fontString({ role, weight, size: 32 }, fonts)))),
  );
  await document.fonts.ready;
}

export function canvasMeasure(ctx: CanvasRenderingContext2D, fonts: CardFonts): Measure {
  return (text, font) => {
    ctx.font = fontString(font, fonts);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    return ctx.measureText(text).width;
  };
}

/**
 * Gives the root `<svg>` explicit pixel dimensions, so browsers rasterize it large and crisp,
 * and the xmlns a data URL needs.
 */
export function svgDataUrl(svg: string, longSide = 1024): string | undefined {
  const open = svg.match(/<svg\b[^>]*>/i);
  if (!open) return undefined;
  const tag = open[0];
  const attr = (name: string) => tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];
  const viewBox = attr("viewBox")?.trim().split(/[\s,]+/).map(Number);
  const vw = viewBox?.[2] || parseFloat(attr("width") ?? "") || 64;
  const vh = viewBox?.[3] || parseFloat(attr("height") ?? "") || 64;
  const scale = longSide / Math.max(vw, vh);
  let next = tag.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, "");
  const extras = [
    `width="${Math.round(vw * scale)}"`,
    `height="${Math.round(vh * scale)}"`,
    viewBox ? "" : `viewBox="0 0 ${vw} ${vh}"`,
    /\sxmlns\s*=/.test(tag) ? "" : `xmlns="http://www.w3.org/2000/svg"`,
  ].filter(Boolean);
  next = next.replace(/^<svg\b/i, `<svg ${extras.join(" ")}`);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(tag, next))}`;
}

export function loadImage(src: string): Promise<CardImage | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    if (!/^(data|blob):/.test(src)) img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(undefined);
    img.src = src;
  });
}

export async function loadCardAssets(data: CardData, fonts: CardFonts): Promise<CardAssets> {
  const portraitUrl = data.portraitSvg ? svgDataUrl(data.portraitSvg) : undefined;
  const [art, portrait] = await Promise.all([
    data.artUrl ? loadImage(data.artUrl) : undefined,
    portraitUrl ? loadImage(portraitUrl) : undefined,
    ensureFontsLoaded(fonts),
  ]);
  return { fonts, art, portrait };
}

export async function renderCardToCanvas(data: CardData, size: CardSize, fonts: CardFonts): Promise<HTMLCanvasElement> {
  const assets = await loadCardAssets(data, fonts);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  const layout = layoutCard(data, size, canvasMeasure(ctx, fonts));
  canvas.width = layout.width;
  canvas.height = layout.height;
  drawCard(ctx, layout.ops, assets);
  return canvas;
}

export async function renderCardToBlob(data: CardData, size: CardSize, fonts: CardFonts): Promise<Blob> {
  const canvas = await renderCardToCanvas(data, size, fonts);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Card export failed"))), "image/png"),
  );
}
