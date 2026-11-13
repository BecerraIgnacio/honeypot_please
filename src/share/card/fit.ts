import type { FontRole, FontSpec, Measure } from "./types";

const WIDTH_PER_EM: Record<FontRole, number> = { pixel: 1.0, mono: 0.62, display: 0.64 };

/** Deliberately generous widths, so a layout fitted without a canvas still fits real fonts. */
export const estimateMeasure: Measure = (text, font) =>
  [...text].length * font.size * WIDTH_PER_EM[font.role] * (font.weight >= 700 ? 1.06 : 1);

export interface FitOptions {
  role: FontRole;
  weight: number;
  maxSize: number;
  minSize: number;
  lineHeight: number;
  maxLines?: number;
  /** Extra space after each glyph, in em. */
  tracking?: number;
}

export interface FittedText {
  lines: string[];
  size: number;
  tracking: number;
  truncated: boolean;
  /** Height of the set lines: lines × size × lineHeight. */
  height: number;
}

export function lineWidth(line: string, font: FontSpec, tracking: number, measure: Measure): number {
  return measure(line, font) + tracking * [...line].length;
}

function splitLongWord(word: string, fits: (s: string) => boolean): string[] {
  const parts: string[] = [];
  let current = "";
  for (const char of word) {
    if (current && !fits(current + char)) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export function wrapText(
  text: string,
  width: number,
  font: FontSpec,
  tracking: number,
  measure: Measure,
): string[] {
  const fits = (s: string) => lineWidth(s, font, tracking, measure) <= width;
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    let current = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (fits(candidate)) {
        current = candidate;
        continue;
      }
      if (current) lines.push(current);
      if (fits(word)) {
        current = word;
      } else {
        const pieces = splitLongWord(word, fits);
        current = pieces.pop() ?? "";
        lines.push(...pieces);
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function ellipsize(line: string, fits: (s: string) => boolean): string {
  let chars = [...line];
  while (chars.length && !fits(`${chars.join("").trimEnd()}…`)) chars = chars.slice(0, -1);
  return `${chars.join("").trimEnd()}…`;
}

/**
 * Largest size from maxSize down to minSize at which the wrapped text fits the box.
 * Below minSize it keeps shrinking only as far as one line needs; if it still cannot fit,
 * it truncates with an ellipsis. It never returns lines that overflow the box.
 */
export function fitText(
  text: string,
  box: { w: number; h: number },
  opts: FitOptions,
  measure: Measure,
): FittedText {
  const { role, weight, lineHeight } = opts;
  const maxLines = opts.maxLines ?? Infinity;
  const minSize = Math.min(opts.minSize, opts.maxSize, box.h / lineHeight);
  const clean = text.replace(/[ \t]+/g, " ").trim();
  const attempt = (size: number) => {
    const font = { role, weight, size };
    const tracking = (opts.tracking ?? 0) * size;
    return { font, tracking, lines: wrapText(clean, box.w, font, tracking, measure) };
  };
  const result = (size: number, lines: string[], tracking: number, truncated: boolean): FittedText => ({
    lines,
    size,
    tracking,
    truncated,
    height: lines.length * size * lineHeight,
  });

  let size = Math.max(1, Math.floor(opts.maxSize));
  while (size > minSize) {
    const { lines, tracking } = attempt(size);
    if (lines.length <= maxLines && lines.length * size * lineHeight <= box.h) {
      return result(size, lines, tracking, false);
    }
    size = Math.max(minSize, size > 24 ? Math.floor(size * 0.93) : size - 1);
  }
  size = Math.max(1, Math.floor(minSize));
  const { lines, tracking, font } = attempt(size);
  const room = Math.max(1, Math.min(maxLines, Math.floor(box.h / (size * lineHeight))));
  if (lines.length <= room) return result(size, lines, tracking, false);
  const kept = lines.slice(0, room);
  const fits = (s: string) => lineWidth(s, font, tracking, measure) <= box.w;
  kept[room - 1] = ellipsize(`${kept[room - 1]} ${lines[room]}`, fits);
  return result(size, kept, tracking, true);
}
