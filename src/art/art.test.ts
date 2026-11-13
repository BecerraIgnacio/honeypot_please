import { describe, expect, it } from "vitest";
import type { Accessory, DocKind, HairStyle, OutfitStyle, PortraitSpec, SpecialPortrait } from "../game/types";
import { JENSEN_MOODS, jensenSvg } from "./jensen";
import { portraitSvg } from "./portrait";
import {
  docIconSvg,
  gpuSvg,
  jacketSvg,
  logoSvg,
  magnifierSvg,
  scannerSvg,
  sealSvg,
  stampSvg,
  terminalSvg,
} from "./props";

type Human = Extract<PortraitSpec, { kind: "human" }>;

const HAIRS: HairStyle[] = ["bob", "long", "bun", "pixie", "curly", "ponytail", "braids", "afro", "bangs", "shaved", "hijab"];
const ACCESSORIES: Accessory[] = ["glasses", "sunglasses", "earpiece", "earrings", "lanyard", "headset", "beret", "pin", "scarf", "vr-headset"];
const OUTFITS: OutfitStyle[] = ["blazer", "hoodie", "dress", "turtleneck", "leather-jacket", "lab-coat", "trench", "tshirt"];
const SKINS: Human["skin"][] = [1, 2, 3, 4, 5, 6];
const EYES: NonNullable<Human["eyes"]>[] = ["neutral", "narrow", "wide", "tired", "smug", "wink"];
const MOUTHS: NonNullable<Human["mouth"]>[] = ["neutral", "smile", "smirk", "frown", "open"];
const SPECIALS: SpecialPortrait[] = ["gpu-wig", "trenchcoat-gpus", "sentient-jacket"];
const DOC_KINDS: DocKind[] = [
  "id-card", "access-badge", "conference-pass", "personal-note", "invitation-letter", "employee-credential",
  "security-memo", "shipping-record", "relationship-proof", "board-notice", "romance-artifact", "photo",
  "tabloid", "certificate", "receipt", "other",
];

const BASE: Human = {
  kind: "human",
  skin: 3,
  hair: { style: "bob", color: "#4a3020" },
  eyes: "neutral",
  mouth: "neutral",
  accessories: [],
  outfit: { style: "blazer", color: "#3d5a80" },
  bg: "#3f4d45",
};

const ALLOWED = new Set(["svg", "g", "rect", "path", "circle"]);

/** Returns the reasons the markup is not a well-formed pixel SVG; empty when it is. */
function problems(svg: string): string[] {
  const out: string[] = [];
  if (/NaN|undefined|null|Infinity/.test(svg)) out.push("non-numeric token in markup");
  if (!/^<svg [^>]*viewBox="0 0 \d+ \d+"[^>]*>/.test(svg)) out.push("root is not an svg with an integer viewBox");
  if (!svg.includes('shape-rendering="crispEdges"')) out.push("missing crispEdges");
  const stack: string[] = [];
  const tag = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[\w:-]+="[^"<>]*")*)\s*(\/?)>/g;
  let consumed = 0;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(svg))) {
    if (m.index !== consumed) out.push(`stray text at ${consumed}`);
    consumed = m.index + m[0].length;
    const [, close, name, , self] = m;
    if (!ALLOWED.has(name)) out.push(`element <${name}> not allowed`);
    if (close) {
      if (stack.pop() !== name) out.push(`unbalanced </${name}>`);
    } else if (!self) stack.push(name);
  }
  if (consumed !== svg.length) out.push("trailing text");
  if (stack.length) out.push(`unclosed ${stack.join(",")}`);
  return out;
}

const human = (patch: Partial<Human>): PortraitSpec => ({ ...BASE, ...patch });

describe("problems()", () => {
  it("rejects broken markup so the axis tests mean something", () => {
    expect(problems('<svg viewBox="0 0 4 4" shape-rendering="crispEdges"><g fill="#000"><rect x="0"/></g></svg>')).toEqual([]);
    expect(problems('<svg viewBox="0 0 4 4" shape-rendering="crispEdges"><g><rect x="NaN"/></svg>')).toEqual([
      "non-numeric token in markup",
      "unbalanced </svg>",
      "unclosed svg",
    ]);
    expect(problems('<svg viewBox="0 0 4 4" shape-rendering="crispEdges"><text>hi</text></svg>')).toContain("element <text> not allowed");
  });
});

describe("portraitSvg", () => {
  const axes: Record<string, PortraitSpec[]> = {
    hair: HAIRS.map((style) => human({ hair: { style, color: "#4a3020" } })),
    accessory: ACCESSORIES.map((a) => human({ accessories: [a] })),
    outfit: OUTFITS.map((style) => human({ outfit: { style, color: "#3d5a80" } })),
    skin: SKINS.map((skin) => human({ skin })),
    eyes: EYES.map((eyes) => human({ eyes })),
    mouth: MOUTHS.map((mouth) => human({ mouth })),
    special: SPECIALS.map((id): PortraitSpec => ({ kind: "special", id })),
  };

  for (const [axis, specs] of Object.entries(axes)) {
    it(`renders every ${axis} as well-formed, pairwise distinct SVG`, () => {
      const svgs = specs.map((s) => portraitSvg(s));
      for (const svg of svgs) expect(problems(svg)).toEqual([]);
      expect(new Set(svgs).size).toBe(specs.length);
    });
  }

  it("changes the output when any single axis of the base changes", () => {
    const base = portraitSvg(BASE);
    const variants: PortraitSpec[] = [
      human({ skin: 4 }),
      human({ hair: { style: "afro", color: "#4a3020" } }),
      human({ hair: { style: "bob", color: "#e3c06a" } }),
      human({ eyes: "wink" }),
      human({ mouth: "smile" }),
      human({ accessories: ["glasses"] }),
      human({ outfit: { style: "hoodie", color: "#3d5a80" } }),
      human({ outfit: { style: "blazer", color: "#8a2f4a" } }),
      human({ bg: "#5a3b52" }),
    ];
    for (const v of variants) expect(portraitSvg(v)).not.toBe(base);
  });

  it("stacks every accessory at once into one valid portrait", () => {
    const svg = portraitSvg(human({ accessories: ACCESSORIES }));
    expect(problems(svg)).toEqual([]);
    expect(svg).not.toBe(portraitSvg(human({ accessories: ["glasses"] })));
  });

  it("is deterministic and ignores accessory order and duplicates", () => {
    expect(portraitSvg(BASE)).toBe(portraitSvg({ ...BASE }));
    expect(portraitSvg(human({ accessories: ["pin", "glasses"] }))).toBe(
      portraitSvg(human({ accessories: ["glasses", "pin", "glasses"] })),
    );
  });

  it("uses a 48x60 viewBox and scales width with size", () => {
    expect(portraitSvg(BASE)).toMatch(/^<svg [^>]*viewBox="0 0 48 60" width="192" height="240"/);
    expect(portraitSvg(BASE, { size: 96 })).toContain('width="96" height="120"');
    expect(portraitSvg(BASE, { size: Number.NaN })).toContain('width="192" height="240"');
  });

  it("falls back to default colors for invalid hex input", () => {
    const junk = ["not-a-color", "#12", "#gggggg", "red", '"/><script>', ""];
    const defaults = portraitSvg(human({ hair: { style: "bob", color: "#3a2a20" }, outfit: { style: "blazer", color: "#3d5a80" }, bg: "#3f4d45" }));
    for (const bad of junk) {
      const svg = portraitSvg(human({ hair: { style: "bob", color: bad }, outfit: { style: "blazer", color: bad }, bg: bad }));
      expect(problems(svg)).toEqual([]);
      expect(svg).not.toContain("script");
      expect(svg).toBe(defaults);
    }
  });

  it("accepts three-digit hex as its six-digit expansion", () => {
    expect(portraitSvg(human({ bg: "#ABC" }))).toBe(portraitSvg(human({ bg: "#aabbcc" })));
  });
});

describe("jensenSvg", () => {
  it("renders six well-formed, pairwise distinct moods", () => {
    const svgs = JENSEN_MOODS.map((mood) => jensenSvg(mood));
    for (const svg of svgs) expect(problems(svg)).toEqual([]);
    expect(new Set(svgs).size).toBe(6);
    expect(jensenSvg("paranoid")).toBe(jensenSvg("paranoid"));
  });
});

describe("props", () => {
  it("renders every desk prop as well-formed SVG", () => {
    const all = [
      stampSvg("accept"),
      stampSvg("reject"),
      scannerSvg(0),
      scannerSvg(3),
      scannerSvg(-2),
      scannerSvg(Number.NaN),
      scannerSvg(99),
      gpuSvg(),
      jacketSvg(),
      magnifierSvg(),
      terminalSvg(),
      sealSvg("VERIFIED"),
      sealSvg(""),
      sealSvg('<script>alert("x")</script> Endeavor Security Office'),
      logoSvg(),
    ];
    for (const svg of all) expect(problems(svg)).toEqual([]);
  });

  it("distinguishes stamps, scanner charge levels and seal texts", () => {
    expect(stampSvg("accept")).not.toBe(stampSvg("reject"));
    expect(new Set([0, 1, 2, 3].map((n) => scannerSvg(n))).size).toBe(4);
    expect(scannerSvg(-2)).toBe(scannerSvg(0));
    expect(sealSvg("VOID")).not.toBe(sealSvg("VERIFIED"));
    expect(sealSvg("<script>")).not.toContain("script");
  });

  it("gives every DocKind its own well-formed icon", () => {
    const icons = DOC_KINDS.map((k) => docIconSvg(k));
    for (const svg of icons) expect(problems(svg)).toEqual([]);
    expect(new Set(icons).size).toBe(DOC_KINDS.length);
  });
});
