import { drawAccessory, drawEyes, drawHead, drawMouth, drawOutfit, skinRamp } from "./body";
import { drawGpu } from "./parts";
import { Grid, type PixelSvg, type Ramp, UI, mix, ramp } from "./pixel";
import { AXIS, PH, PW, backdrop, m, sizeOf, windowFrame } from "./stage";

export type JensenMood = "calm" | "wary" | "paranoid" | "unhinged" | "devastated" | "triumphant";
export const JENSEN_MOODS: readonly JensenMood[] = ["calm", "wary", "paranoid", "unhinged", "devastated", "triumphant"];

type HairState = "neat" | "stray" | "wild" | "flat";

interface MoodLook {
  bg: string;
  hair: HairState;
  eyes: { left: string[]; right: string[] | "mirror" };
  mouth: string[];
  mouthX?: number;
  sweat: ReadonlyArray<readonly [number, number]>;
  twitch?: boolean;
  askew?: boolean;
  raiseGpu?: boolean;
}

const MOODS: Record<JensenMood, MoodLook> = {
  calm: {
    bg: "#2e4a3b",
    hair: "neat",
    eyes: { left: ["....", ".bbb", "....", "....", ".kkk", ".wpw", "...."], right: "mirror" },
    mouth: ["m....m", ".mmmm.", "..rr.."],
    sweat: [],
  },
  wary: {
    bg: "#37423d",
    hair: "neat",
    eyes: {
      left: ["....", "..bb", ".b..", "....", ".kkk", ".ppw", ".lll"],
      right: ["....", "bbb.", "....", "....", "kkk.", "ppw.", "lll."],
    },
    mouth: ["......", "..mmm.", "......"],
    sweat: [[31, 12]],
  },
  paranoid: {
    bg: "#3f3c26",
    hair: "stray",
    eyes: {
      left: ["..bb", ".b..", "....", ".kkk", ".www", ".wpw", ".www"],
      right: ["bb..", "..b.", "....", "kkk.", "www.", "wpw.", "s.s."],
    },
    mouth: ["......", "m.mm.m", ".m..m."],
    sweat: [[31, 11], [14, 13], [33, 16]],
    twitch: true,
  },
  unhinged: {
    bg: "#4a2626",
    hair: "wild",
    eyes: {
      left: [".bb.", "...b", "....", ".kkk", ".www", ".wpw", ".www"],
      right: ["....", "bbb.", "....", "....", "kkk.", "wpw.", "lll."],
    },
    mouth: ["mmmmmmmm", "mttttttm", ".mddddm.", "..mmmm.."],
    mouthX: 20,
    sweat: [[31, 10], [14, 12], [34, 15], [12, 17]],
    twitch: true,
    askew: true,
  },
  devastated: {
    bg: "#25292b",
    hair: "flat",
    eyes: { left: ["....", "....", "b...", ".bbb", ".kkk", ".wpw", ".sss", "lsss"], right: "mirror" },
    mouth: ["......", ".mmmm.", "m....m"],
    sweat: [],
  },
  triumphant: {
    bg: "#4b4123",
    hair: "neat",
    eyes: { left: ["....", ".bbb", "....", "....", "..k.", ".k.k", "...."], right: "mirror" },
    mouth: [".mmmm.", "mttttm", ".mddm.", "..mm.."],
    sweat: [],
    raiseGpu: true,
  },
};

const SILVER_HAIR = ramp("#c9ced4");
const LEATHER = ramp("#1e1f22");
const SWEAT = { o: "#2f6f99", c: "#7cc4ef", w: "#e8f6ff" };

function drawHair(g: Grid, r: Ramp, state: HairState): void {
  const top = state === "flat" ? 7 : 4;
  const cap = m()
    .sym(top, [20, 18, 16, 15, 14, 14, 14].slice(0, 11 - top), AXIS)
    .rows(11, [[14, 19], [14, 16], [14, 15], [14, 15], [14, 15], [14, 15], [14, 15], [14, 15]])
    .rows(11, [[28, 33], [31, 33], [32, 33], [32, 33], [32, 33], [32, 33], [32, 33], [32, 33]]);
  g.paint(cap, r);
  for (let i = 0; i < 4; i++) g.line(16 + i * 4, 10, 20 + i * 4, top + 2, r.light);
  for (let i = 0; i < 3; i++) g.line(18 + i * 4, 10, 21 + i * 4, top + 4, r.shade);
  const strands: Record<HairState, ReadonlyArray<readonly [number, number, number, number]>> = {
    neat: [],
    stray: [[19, 4, 18, 1], [27, 4, 29, 1], [21, 11, 22, 14]],
    wild: [
      [17, 4, 15, 0], [22, 4, 22, 0], [27, 4, 30, 0], [15, 6, 11, 2], [32, 6, 37, 2],
      [14, 9, 9, 7], [33, 9, 38, 7], [14, 12, 10, 14], [33, 12, 37, 14], [21, 11, 23, 15],
    ],
    flat: [[18, 11, 18, 14], [21, 11, 20, 13], [26, 11, 27, 14], [29, 11, 30, 13]],
  };
  for (const [x0, y0, x1, y1] of strands[state]) {
    g.line(x0, y0, x1, y1, r.base);
    g.set(x1, y1, r.light);
  }
}

function drawSweat(g: Grid, at: ReadonlyArray<readonly [number, number]>): void {
  for (const [x, y] of at) g.sprite(x, y, [".o.", "oco", "owo", ".o."], SWEAT);
}

function drawTwitch(g: Grid): void {
  const c = UI.amber;
  g.line(35, 18, 36, 17, c).line(36, 21, 37, 21, c).line(35, 24, 36, 25, c);
}

function drawRaisedGpu(g: Grid, skin: Ramp): void {
  g.paint(m().rect(36, 24, 7, 20).union(m().rect(34, 38, 8, 6)), LEATHER);
  g.line(38, 26, 38, 40, LEATHER.light);
  drawGpu(g, 26, 8, 19, 10, { fans: 2, fingers: false });
  g.paint(m().rect(36, 16, 7, 8).del(36, 16).del(42, 16), skin, { light: false });
  g.line(37, 18, 41, 18, skin.shade).line(37, 20, 41, 20, skin.shade);
  const spark = (x: number, y: number) =>
    g.sprite(x, y, [".a.", "aya", ".a."], { a: UI.amber, y: "#fff2b0" });
  spark(21, 3);
  spark(40, 3);
  spark(37, 26);
}

export function jensenSvg(mood: JensenMood, opts?: { size?: number }): PixelSvg {
  const look = MOODS[mood] ?? MOODS.calm;
  const g = new Grid(PW, PH);
  const skin = skinRamp(2);
  const hair = look.hair === "flat" ? ramp(mix(SILVER_HAIR.base, "#8a9096", 0.4)) : SILVER_HAIR;

  backdrop(g, look.bg);
  drawOutfit(g, "leather-jacket", LEATHER, skin);
  drawHead(g, skin, "square", false);
  drawEyes(g, look.eyes.left, look.eyes.right, { brow: mix(hair.outline, "#3a3f44", 0.5), skin });
  drawMouth(g, look.mouth, skin, look.mouthX ?? 21);
  drawHair(g, hair, look.hair);
  drawAccessory(g, "glasses");
  if (look.askew) {
    g.fill(26, 19, 6, 5, skin.base);
    drawEyes(g, look.eyes.left, look.eyes.right, { brow: mix(hair.outline, "#3a3f44", 0.5), skin });
    const f = "#231a1e";
    g.line(26, 20, 31, 20, f).line(26, 24, 31, 24, f).line(26, 21, 26, 23, f).line(31, 21, 31, 23, f);
  }
  if (look.twitch) drawTwitch(g);
  drawSweat(g, look.sweat);
  if (look.raiseGpu) drawRaisedGpu(g, skin);
  windowFrame(g);
  return g.toSvg(sizeOf(opts));
}
