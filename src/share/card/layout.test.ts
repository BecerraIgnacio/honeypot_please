import { describe, expect, it } from "vitest";
import type { CardStyle } from "../../game/types";
import { estimateMeasure, fitText, lineWidth } from "./fit";
import { layoutCard } from "./layout";
import { CARD_DIMENSIONS, type CardData, type CardSize, type DrawOp, type TextOp } from "./types";

const STYLES: CardStyle[] = ["security-report", "tabloid", "classified", "board-memo", "propaganda"];
const SIZES: CardSize[] = ["landscape", "square"];

const base: CardData = {
  style: "security-report",
  title: "HONEYPOTTED",
  memePhrase: "If she's a 10, you're an asset.",
  subtext: "Vera Kessling of Lumen Bridge Capital walked out with the Rubin roadmap.",
  stats: [
    { label: "Market cap lost", value: "$840B" },
    { label: "Spies caught", value: "3" },
    { label: "Day reached", value: "2" },
    { label: "Rank", value: "Lobby Intern" },
  ],
  portraitSvg: '<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#b6ff00"/></svg>',
  gameUrl: "https://honeypot.example/play",
  caseFileNo: "RPC7-00417",
};

const long: CardData = {
  ...base,
  title:
    "Supreme Allocator of Romantic Perimeter Integrity and Keeper of the Sacred Leather Jacket Protocol, Second Class",
  memePhrase:
    "She brought a 5090 in her purse, a forged GTC27 pass, a magnolia pin and a forty-page purchase order for one (1) dinner. I approved all of it.",
  subtext: "SupercalifragilisticexpialidociouslyunverifiablebadgenumberNV-00000-Z and a very long explanation that keeps going for a while.",
  stats: [
    { label: "Shareholder value destroyed this fiscal quarter", value: "$4.9T" },
    { label: "Spies", value: "999" },
    { label: "Innocent hearts broken", value: "999" },
    { label: "Rank", value: "Deputy Assistant Vice President of Perimeter" },
    { label: "Ignored fifth stat", value: "nope" },
  ],
  artUrl: "/art/security-report.png",
};

function corners(op: DrawOp): Array<[number, number]> {
  const { x, y, w, h } = op.box;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const a = op.rotate ?? 0;
  return [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ].map(([px, py]) => [
    cx + (px - cx) * Math.cos(a) - (py - cy) * Math.sin(a),
    cy + (px - cx) * Math.sin(a) + (py - cy) * Math.cos(a),
  ]);
}

const texts = (ops: DrawOp[]) => ops.filter((op): op is TextOp => op.kind === "text");
const norm = (s: string) => s.replace(/\s+/g, " ").trim().toUpperCase();

describe.each(STYLES)("layoutCard %s", (style) => {
  describe.each(SIZES)("%s", (size) => {
    const { width, height } = CARD_DIMENSIONS[size];

    const cases: Array<[string, CardData]> = [
      ["typical", { ...base, style }],
      ["worst case", { ...long, style }],
      ["bare", { ...base, style, portraitSvg: undefined, stats: [], subtext: "", caseFileNo: undefined }],
    ];
    for (const [name, data] of cases) {
      it(`${name}: keeps every op inside the ${width}x${height} canvas`, () => {
        const layout = layoutCard(data, size);
        expect(layout).toMatchObject({ width, height });
        for (const op of layout.ops) {
          for (const [px, py] of corners(op)) {
            expect(px, `${op.kind} x`).toBeGreaterThanOrEqual(-0.5);
            expect(px, `${op.kind} x`).toBeLessThanOrEqual(width + 0.5);
            expect(py, `${op.kind} y`).toBeGreaterThanOrEqual(-0.5);
            expect(py, `${op.kind} y`).toBeLessThanOrEqual(height + 0.5);
          }
          if (op.kind === "poly") {
            for (const [px, py] of op.points) {
              expect(px >= 0 && px <= width && py >= 0 && py <= height, "poly point").toBe(true);
            }
          }
        }
      });

      it(`${name}: shows title, meme phrase, branding and game URL`, () => {
        const ops = texts(layoutCard(data, size).ops);
        const sources = ops.map((op) => op.text);
        expect(sources).toContain(data.title);
        expect(sources).toContain(data.memePhrase);
        expect(sources).toContain("HONEYPOT, PLEASE");
        expect(sources).toContain("honeypot.example/play");
      });

      it(`${name}: sets every text inside its box`, () => {
        for (const op of texts(layoutCard(data, size).ops)) {
          expect(op.lines.length * op.font.size * op.lineHeight, op.text).toBeLessThanOrEqual(op.box.h + 1);
          for (const line of op.lines) {
            expect(lineWidth(line, op.font, op.tracking, estimateMeasure), line).toBeLessThanOrEqual(op.box.w - 2 * op.padX + 0.5);
          }
        }
      });
    }

    it("wraps or shrinks a long title instead of overflowing, without losing it", () => {
      const short = texts(layoutCard({ ...base, style }, size).ops).find((op) => op.text === base.title)!;
      const big = texts(layoutCard({ ...long, style }, size).ops).find((op) => op.text === long.title)!;
      expect(big.lines.length > 1 || big.font.size < short.font.size).toBe(true);
      expect(big.truncated).toBe(false);
      expect(norm(big.lines.join(" "))).toBe(norm(long.title));
    });

    it("draws art and an inset portrait when both are given, and only the built-in art otherwise", () => {
      const withArt = layoutCard({ ...base, style, artUrl: "/art/x.png" }, size).ops.filter((op) => op.kind === "image");
      expect(withArt.map((op) => op.kind === "image" && op.source)).toEqual(["art", "portrait"]);
      const bare = layoutCard({ ...base, style, portraitSvg: undefined }, size).ops;
      expect(bare.some((op) => op.kind === "image")).toBe(false);
      expect(bare.some((op) => op.kind === "poly")).toBe(true);
    });
  });
});

describe("layoutCard determinism", () => {
  it("produces the same ops for the same data", () => {
    expect(layoutCard({ ...base, style: "classified" }, "square")).toEqual(layoutCard({ ...base, style: "classified" }, "square"));
  });
});

describe("fitText", () => {
  const opts = { role: "display", weight: 700, maxSize: 80, minSize: 20, lineHeight: 1.1 } as const;

  it("keeps the max size when the text fits", () => {
    expect(fitText("SHORT", { w: 1000, h: 200 }, opts, estimateMeasure)).toMatchObject({ size: 80, lines: ["SHORT"], truncated: false });
  });

  it("shrinks and wraps to fit", () => {
    const fitted = fitText("THE MORE YOU BUY THE MORE YOU SAVE", { w: 400, h: 120 }, opts, estimateMeasure);
    expect(fitted.size).toBeLessThan(80);
    expect(fitted.lines.length).toBeGreaterThan(1);
    expect(fitted.height).toBeLessThanOrEqual(120);
    expect(fitted.lines.join(" ")).toBe("THE MORE YOU BUY THE MORE YOU SAVE");
  });

  it("breaks a single word wider than the box", () => {
    const fitted = fitText("A".repeat(60), { w: 300, h: 400 }, { ...opts, maxLines: 8 }, estimateMeasure);
    expect(fitted.lines.join("")).toBe("A".repeat(60));
    for (const line of fitted.lines) expect(lineWidth(line, { role: "display", weight: 700, size: fitted.size }, 0, estimateMeasure)).toBeLessThanOrEqual(300);
  });

  it("truncates with an ellipsis only when even the minimum size cannot fit", () => {
    const fitted = fitText("word ".repeat(200), { w: 200, h: 60 }, opts, estimateMeasure);
    expect(fitted.truncated).toBe(true);
    expect(fitted.lines.at(-1)?.endsWith("…")).toBe(true);
    expect(fitted.height).toBeLessThanOrEqual(60);
  });
});
