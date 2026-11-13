import type { DocKind } from "../game/types";
import { drawGpu } from "./parts";
import { Grid, Mask, type PixelSvg, type SpritePalette, UI, drawText, fontSafe, mix, ramp, textWidth } from "./pixel";

type Size = { size?: number };

const out = (g: Grid, opts: Size | undefined, scale = 4): PixelSvg => {
  const s = opts?.size;
  return g.toSvg(typeof s === "number" && Number.isFinite(s) && s > 0 ? s : g.w * scale);
};

const mask = (g: Grid) => new Mask(g.w, g.h);

const STEEL = "#2c332f";

export function stampSvg(kind: "accept" | "reject", opts?: Size): PixelSvg {
  const ink = kind === "reject" ? UI.red : UI.acid;
  const label = kind === "reject" ? "REJECT" : "ACCEPT";
  const g = new Grid(32, 32);
  const handle = ramp(ink);
  g.paint(mask(g).ellipse(16, 6.5, 6.5, 5), handle);
  g.paint(mask(g).rect(13, 10, 6, 6), ramp("#3a403c"), { light: false });
  g.paint(mask(g).rect(2, 15, 28, 11), ramp(STEEL));
  g.paint(mask(g).rect(3, 17, 26, 7), ramp(UI.cream), { light: false });
  drawText(g, 16 - Math.ceil(textWidth(label) / 2), 18, label, mix(ink, UI.charcoal, kind === "reject" ? 0.1 : 0.45));
  g.paint(mask(g).rect(2, 26, 28, 3), ramp(mix(ink, UI.charcoal, 0.25)), { light: false });
  g.fill(4, 29, 24, 1, mix(ink, UI.charcoal, 0.6));
  return out(g, opts);
}

export function scannerSvg(charges: number, opts?: Size): PixelSvg {
  const n = Number.isFinite(charges) ? Math.max(0, Math.floor(charges)) : 0;
  const slots = Math.min(5, Math.max(3, n));
  const lit = Math.min(n, slots);
  const g = new Grid(40, 16);
  g.paint(mask(g).rect(1, 5, 15, 6).del(1, 5).del(1, 10), ramp("#24292b"));
  for (let x = 3; x < 13; x += 2) g.fill(x, 6, 1, 4, "#3a4144");
  const paddle = mask(g).rect(14, 1, 25, 14);
  paddle.del(14, 1).del(38, 1).del(14, 14).del(38, 14).del(15, 1).del(37, 1).del(15, 14).del(37, 14);
  g.paint(paddle, ramp("#3a4144"));
  const coil = mask(g).rect(16, 3, 21, 10).cut(mask(g).rect(17, 4, 19, 8));
  g.fillMask(coil, lit > 0 ? UI.acid : "#5a6a3a");
  g.fill(17, 4, 19, 8, UI.charcoal);
  const total = slots * 3 - 1;
  const x0 = 26 - Math.ceil(total / 2) + 1;
  for (let i = 0; i < slots; i++) g.fill(x0 + i * 3, 6, 2, 4, i < lit ? UI.amber : STEEL);
  return out(g, opts);
}

export function gpuSvg(opts?: Size): PixelSvg {
  const g = new Grid(46, 18);
  drawGpu(g, 4, 2, 40, 13);
  return out(g, opts);
}

export function jacketSvg(opts?: Size): PixelSvg {
  const g = new Grid(24, 24);
  const leather = ramp("#1f2023");
  const body = mask(g).sym(4, [7, 4, 2, ...Array<number>(16).fill(1)], 23);
  g.paint(body, leather);
  g.fillMask(mask(g).sym(4, [10, 10, 10, 11, 11, 11, 11], 23), "#2b2f2c");
  g.line(5, 9, 5, 21, leather.outline).line(18, 9, 18, 21, leather.outline);
  g.fill(2, 20, 20, 1, leather.outline);
  const lapels = mask(g)
    .rows(3, [[8, 10], [7, 10], [6, 10], [6, 9], [7, 10], [8, 10], [9, 10], [9, 10]])
    .rows(3, [[13, 15], [13, 16], [13, 17], [14, 17], [13, 16], [13, 15], [13, 14], [13, 14]]);
  g.paint(lapels, { ...leather, base: leather.light, light: leather.light }, { shade: false });
  g.line(13, 11, 11, 20, "#a8b0b5");
  g.line(3, 9, 3, 16, leather.light).line(20, 9, 20, 15, leather.light);
  g.set(7, 7, "#a8b0b5").set(16, 7, "#a8b0b5");
  return out(g, opts);
}

export function magnifierSvg(opts?: Size): PixelSvg {
  const g = new Grid(16, 16);
  g.paint(mask(g).ellipse(6.5, 6.5, 5.5, 5.5), ramp("#9aa3a8"), { shade: false });
  g.fillMask(mask(g).ellipse(6.5, 6.5, 4, 4), "#a9d8df");
  g.set(4, 4, "#ffffff").set(5, 4, "#ffffff").set(4, 5, "#ffffff").set(8, 8, "#7fb4be").set(9, 7, "#7fb4be");
  for (let i = 0; i < 5; i++) {
    g.fill(10 + i, 10 + i, 2, 2, i < 1 ? UI.amber : "#3a2a20");
  }
  g.set(15, 15, "#3a2a20");
  return out(g, opts);
}

export function terminalSvg(opts?: Size): PixelSvg {
  const g = new Grid(24, 20);
  g.paint(mask(g).rect(1, 1, 22, 15), ramp("#c9c2ad"));
  g.fill(3, 3, 18, 10, UI.charcoal);
  const dim = mix(UI.acid, UI.charcoal, 0.5);
  g.fill(4, 4, 9, 1, UI.acid).fill(4, 6, 13, 1, dim).fill(4, 8, 6, 1, dim).fill(4, 10, 3, 1, UI.acid).fill(8, 10, 2, 1, UI.acid);
  g.set(19, 14, UI.red).set(17, 14, UI.acid);
  g.paint(mask(g).rect(9, 16, 6, 2), ramp("#8f8875"), { light: false });
  g.paint(mask(g).rect(5, 18, 14, 2), ramp("#8f8875"), { light: false });
  return out(g, opts);
}

const DOC_PAL: SpritePalette = {
  o: "#1c1f1d",
  p: UI.cream,
  s: "#cfc5a8",
  k: "#4a4f4b",
  g: UI.acid,
  r: UI.red,
  R: "#8c1420",
  a: UI.amber,
  b: "#4a7ab0",
  c: "#8ec5e8",
  w: "#ffffff",
  h: "#e0b08a",
  n: "#b98a52",
  N: "#7a5230",
  y: "#f4dc6a",
  Y: "#cdb24a",
  P: "#f0a6bd",
  G: "#3c6a2a",
  K: STEEL,
  A: "#d9b36a",
  B: "#b38c44",
};

const DOC_ICONS: Record<DocKind, readonly string[]> = {
  "id-card": [
    "................",
    "................",
    "................",
    ".oooooooooooooo.",
    ".obbbbbbbbbbbbo.",
    ".oppppppppppppo.",
    ".ocnncpkkkkkkpo.",
    ".onhhnppppppppo.",
    ".ochhcpkkkkpppo.",
    ".obbbbppppppppo.",
    ".oppppppkkkkkpo.",
    ".oppppppppppppo.",
    ".oooooooooooooo.",
  ],
  "access-badge": [
    "......oooo......",
    "......owwo......",
    "...oooooooooo...",
    "...opppkkpppo...",
    "...oggggggggo...",
    "...oppppppppo...",
    "...oppcnncppo...",
    "...oppnhhnppo...",
    "...oppchhcppo...",
    "...oppbbbbppo...",
    "...oppppppppo...",
    "...okkkkkkkko...",
    "...oppppppppo...",
    "...okkkkppppo...",
    "...oppppppppo...",
    "...oooooooooo...",
  ],
  "conference-pass": [
    "..r..........r..",
    "...r........r...",
    "....r......r....",
    ".....r....r.....",
    "......rrrr......",
    "......owwo......",
    "...oooooooooo...",
    "...oaaaaaaaao...",
    "...oaoaoaoaao...",
    "...oppppppppo...",
    "...opkpkkpkpo...",
    "...opkpkkpkpo...",
    "...oppppppppo...",
    "...oaaaaaaaao...",
    "...oooooooooo...",
  ],
  "personal-note": [
    "................",
    ".ooooooooooooo..",
    ".oyyyyyyyyyyyo..",
    ".oykkkkyykkkyo..",
    ".oyyyyyyyyyyyo..",
    ".oykkykkkkyyyo..",
    ".oyyyyyyyyyyyo..",
    ".oykkkkkyyyyyo..",
    ".oyyyyyyyyyyyo..",
    ".oyyyyyyPyPyyo..",
    ".oyyyyyyyPyyyo..",
    ".oyyyyyyyyyyyo..",
    ".oyyyyyyyyyYYo..",
    ".oyyyyyyyyYYo...",
    ".ooooooooooo....",
  ],
  "invitation-letter": [
    "................",
    "................",
    "................",
    ".oooooooooooooo.",
    ".okppppppppppko.",
    ".opkppppppppkpo.",
    ".oppkppppppkppo.",
    ".opppkrrrrkpppo.",
    ".opppprRRrppppo.",
    ".oppppprrpppppo.",
    ".oppppppppppppo.",
    ".osssssssssssso.",
    ".oooooooooooooo.",
  ],
  "employee-credential": [
    "................",
    "................",
    "................",
    ".oooooooooooooo.",
    ".oKKKKKKKKKKKKo.",
    ".oKggKpppppKKKo.",
    ".oKggKKKKKKKKKo.",
    ".oKKKKKKKKKKKKo.",
    ".oKaaaKKKKKKKKo.",
    ".oKaaaKpppppKKo.",
    ".oKKKKKKKKKKKKo.",
    ".oKppppppppKgKo.",
    ".oKKKKKKKKKKKKo.",
    ".oooooooooooooo.",
  ],
  "security-memo": [
    "..oooooooooooo..",
    "..oppppppppppo..",
    "..orrrrrrrrrro..",
    "..orwwrwwrwwro..",
    "..oppppppppppo..",
    "..opkkkkkkkkpo..",
    "..oppppppppppo..",
    "..opkkkkkkpppo..",
    "..oppppppppppo..",
    "..opkkkkkkkkpo..",
    "..oppppppppppo..",
    "..opkkkkpppppo..",
    "..opppppprrrpo..",
    "..opppppprrrpo..",
    "..oooooooooooo..",
  ],
  "shipping-record": [
    "................",
    "................",
    ".oooooooooooooo.",
    ".onnnnnNNnnnnno.",
    ".onnnnnNNnnnnno.",
    ".oNNNNNNNNNNNNo.",
    ".onnnnnnnnnnnno.",
    ".onpppppnnnknno.",
    ".onpkkkpnnkkkno.",
    ".onpppppnnnknno.",
    ".onpkkppnnnknno.",
    ".onpppppnnnnnno.",
    ".onnnnnnnnnnnno.",
    ".oooooooooooooo.",
  ],
  "relationship-proof": [
    "................",
    "................",
    ".oooooooooooooo.",
    ".oPPPPPPPPPPPPo.",
    ".oPPrrrPPrrrPPo.",
    ".oPrrrrrrrrrrPo.",
    ".oPrwrrrrrrrrPo.",
    ".oPrrrrrrrrrrPo.",
    ".oPPrrrrrrrrPPo.",
    ".oPPPrrrrrrPPPo.",
    ".oPPPPrrrrPPPPo.",
    ".oPPPPPrrPPPPPo.",
    ".oPPPPPPPPPPPPo.",
    ".oooooooooooooo.",
  ],
  "board-notice": [
    "......kkkk......",
    "..NNNNkwwkNNNN..",
    "..NppppppppppN..",
    "..NpkkkkkkkkpN..",
    "..NppppppppppN..",
    "..NpkkkppppppN..",
    "..NppppppppppN..",
    "..NpkkkkkkpppN..",
    "..NppppppppppN..",
    "..NpkkkkpppppN..",
    "..NppppppppppN..",
    "..NppppppaaapN..",
    "..NppppppaaapN..",
    "..NppppppppppN..",
    "..NNNNNNNNNNNN..",
  ],
  "romance-artifact": [
    "................",
    "......rrr.......",
    ".....rRrrr......",
    "....rrRRrrr.....",
    "....rrrRrrr.....",
    ".....rrrrr......",
    "......rrr.......",
    ".......G........",
    "...GG..G........",
    "....GGGG........",
    ".......G..GG....",
    ".......GGG......",
    ".......G........",
    ".......G........",
    ".......G........",
    "................",
  ],
  photo: [
    "................",
    "..oooooooooooo..",
    "..owwwwwwwwwwo..",
    "..owccccccccwo..",
    "..owcccccaacwo..",
    "..owccGcccaawo..",
    "..owcGGGcccGwo..",
    "..owGGGGGcGGwo..",
    "..owGGGGGGGGwo..",
    "..owwwwwwwwwwo..",
    "..owwwwwwwwwwo..",
    "..owwkkkkkwwwo..",
    "..owwwwwwwwwwo..",
    "..oooooooooooo..",
  ],
  tabloid: [
    "................",
    ".oooooooooooooo.",
    ".orrrrrrrrrrrro.",
    ".orwrwwrwrwwrro.",
    ".oppppppppppppo.",
    ".okkkkkkkkkkkpo.",
    ".okkkkkkkkppppo.",
    ".oppppppppppppo.",
    ".osssssppkkkkpo.",
    ".oshhhspppppppo.",
    ".oshhhsppkkkkpo.",
    ".ossssspppppppo.",
    ".opkkkkkppkkkpo.",
    ".oppppppppppppo.",
    ".oooooooooooooo.",
  ],
  certificate: [
    "................",
    "................",
    ".oooooooooooooo.",
    ".oppppppppppppo.",
    ".opakkkkkkkkapo.",
    ".oppppppppppppo.",
    ".oppkkkkkkkkppo.",
    ".oppppppppppppo.",
    ".opkkkkkppaappo.",
    ".oppppppaaaappo.",
    ".oppppppaaaappo.",
    ".opppppppaapppo.",
    ".ooooooooorrooo.",
    ".........r..r...",
    "........r....r..",
  ],
  receipt: [
    "....oooooooo....",
    "....oppppppo....",
    "....opkkkkpo....",
    "....oppppppo....",
    "....okkkpkko....",
    "....okkppkko....",
    "....oppppppo....",
    "....okkkpkko....",
    "....okkppkko....",
    "....oppppppo....",
    "....okkkkkko....",
    "....oppppppo....",
    "....opkkkppo....",
    "....oppppppo....",
    "....opopopop....",
    "....o.o.o.o.....",
  ],
  other: [
    "................",
    "................",
    "................",
    ".oooooo.........",
    ".oAAAAAoooooooo.",
    ".oAAppppppppAAo.",
    ".oBBBBBBBBBBBBo.",
    ".oAAAAAAAAAAAAo.",
    ".oAAAAAAAAAAAAo.",
    ".oAAAAAAAAAAAAo.",
    ".oAAAAAAAAAAAAo.",
    ".oAAAAAAAAAAAAo.",
    ".oAAAAAAAAAAAAo.",
    ".oooooooooooooo.",
  ],
};

export function docIconSvg(kind: DocKind, opts?: Size): PixelSvg {
  const g = new Grid(16, 16);
  g.sprite(0, 0, DOC_ICONS[kind] ?? DOC_ICONS.other, DOC_PAL);
  return out(g, opts);
}

/** Up to three centred lines of at most eight characters; longer words are cut. */
function sealLines(text: string): string[] {
  const words = fontSafe(text).split(" ").filter(Boolean).map((w) => w.slice(0, 8));
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 1 + w.length <= 8) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines.slice(0, 3);
}

export function sealSvg(text: string, opts?: Size): PixelSvg {
  const g = new Grid(44, 44);
  const disc = mask(g).ellipse(22, 22, 21, 21);
  disc.each((x, y) => {
    const a = Math.atan2(y + 0.5 - 22, x + 0.5 - 22);
    const r = Math.hypot(x + 0.5 - 22, y + 0.5 - 22);
    if (r > 19.6 && Math.cos(a * 16) < -0.2) disc.del(x, y);
  });
  const red = ramp(UI.red);
  g.paint(disc, { ...red, light: red.base });
  const ring = mask(g).ellipse(22, 22, 17.5, 17.5).cut(mask(g).ellipse(22, 22, 16.5, 16.5));
  g.fillMask(ring, UI.cream);
  const dots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (i * Math.PI) / 6);
  for (const a of dots) g.set(Math.round(22 + Math.cos(a) * 19), Math.round(22 + Math.sin(a) * 19), red.light);
  const lines = sealLines(text);
  const top = 22 - Math.round((lines.length * 6 - 1) / 2);
  lines.forEach((line, i) => drawText(g, 22 - Math.ceil(textWidth(line) / 2), top + i * 6, line, UI.cream));
  const star = [".a.", "aaa", ".a."];
  if (lines.length < 3) {
    g.sprite(21, top - 7, star, { a: UI.amber });
    g.sprite(21, top + lines.length * 6 + 1, star, { a: UI.amber });
  }
  return out(g, opts);
}

const LOGO_FONT: Record<string, readonly string[]> = {
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  N: ["#...#", "##..#", "#.#.#", "#.#.#", "#..##", "#...#", "#...#"],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  ",": ["..", "..", "..", "..", "##", ".#", "#."],
};

function logoText(g: Grid, cx: number, y: number, text: string, scale: number, c: string, shadow: string): void {
  const glyphs = Array.from(text).map((ch) => LOGO_FONT[ch]);
  const width = glyphs.reduce((w, gl) => w + (gl[0].length + 1) * scale, -scale);
  let x = cx - Math.floor(width / 2);
  for (const gl of glyphs) {
    gl.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] !== "#") continue;
        g.fill(x + i * scale + 1, y + j * scale + 1, scale, scale, shadow);
      }
    });
    gl.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] === "#") g.fill(x + i * scale, y + j * scale, scale, scale, c);
    });
    x += (gl[0].length + 1) * scale;
  }
}

export function logoSvg(opts?: Size): PixelSvg {
  const g = new Grid(120, 66);
  const honey = ramp(UI.amber);
  const drips: ReadonlyArray<readonly [number, number]> = [
    [11, 9], [24, 16], [43, 6], [60, 12], [79, 18], [95, 7], [108, 13],
  ];
  const shape = mask(g).rect(3, 3, 114, 42);
  shape.del(3, 3).del(116, 3).del(3, 44).del(116, 44);
  for (let x = 4; x < 116; x++) if (Math.sin(x * 0.45) > 0.2) shape.add(x, 45);
  for (const [x, len] of drips) {
    for (let j = 0; j < len; j++) {
      const half = j < 2 ? 4 - j : 2;
      shape.rect(x - half, 44 + j, half * 2 + 1, 1);
    }
    shape.ellipse(x + 0.5, 44 + len, 3.6, 3.2);
  }
  g.paint(shape, honey);
  for (const [x, len] of drips) {
    g.set(x - 1, 43 + len, "#fff2b0").set(x - 2, 44 + len, honey.light);
    g.line(x - 1, 46, x - 1, 41 + len, honey.light);
  }
  for (let y = 9; y < 42; y += 4) {
    for (let x = 9 + ((y / 4) % 2) * 3; x < 112; x += 6) g.set(x, y, mix(UI.amber, "#c47c00", 0.5));
  }
  const frame = mask(g).rect(6, 6, 108, 36).cut(mask(g).rect(7, 7, 106, 34));
  g.fillMask(frame, UI.charcoal);
  logoText(g, 60, 10, "HONEYPOT,", 2, UI.charcoal, "#c47c00");
  g.paint(mask(g).rect(18, 28, 84, 18), ramp(UI.red), { shade: false });
  g.fill(19, 29, 82, 1, mix(UI.red, UI.cream, 0.35));
  logoText(g, 60, 30, "PLEASE", 2, UI.cream, "#8c1420");
  return out(g, opts);
}
