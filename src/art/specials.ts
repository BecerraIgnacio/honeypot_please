import type { SpecialPortrait } from "../game/types";
import { OUTFITS, SILVER } from "./body";
import { drawGpu } from "./parts";
import { Grid, UI, mix, ramp } from "./pixel";
import { AXIS, PH, PW, TORSO, backdrop, m, windowFrame } from "./stage";

const BLONDE = ramp("#f0cf63");
const LIPSTICK = { r: UI.red, d: "#8c1420", l: "#ff8a7a" };

function gpuWig(g: Grid): void {
  backdrop(g, "#5a3b52");
  g.paint(m().ellipse(23.5, 18, 18, 14).rect(6, 18, 36, 34).cut(m().rect(0, 52, PW, PH)), BLONDE);
  const dress = ramp("#d9577c");
  g.paint(TORSO(), dress);
  g.paint(m().ellipse(23.5, 38.5, 9, 3.5).cut(m().rect(0, 0, PW, 38)), ramp(mix(dress.base, UI.cream, 0.5)), { shade: false });
  g.paint(m().rect(21, 30, 6, 8), ramp("#7d868d"), { light: false });
  for (let i = 0; i < 9; i++) {
    const x = 16 + i * 2;
    const y = 40 + Math.round(Math.abs(i - 4) * -0.5 + 2);
    g.set(x, y, "#fbf6ea").set(x + 1, y, "#cfc6b4");
  }
  drawGpu(g, 9, 12, 30, 18, { bracket: false });
  g.sprite(20, 24, [".rr..rr.", "rrrrrrrr", "dddddddd", ".rrrrrr.", "..rlrr.."], LIPSTICK);
  const fringe = m()
    .ellipse(23.5, 15, 17, 10)
    .cut(m().rect(0, 11, PW, PH))
    .rows(11, [[8, 20], [8, 13]])
    .rows(6, Array.from({ length: 44 }, (_, i) => [i < 8 ? 7 : 5, 9] as const))
    .rows(6, Array.from({ length: 44 }, (_, i) => [38, i < 8 ? 40 : 42] as const))
    .cut(m().rect(0, 52, PW, PH));
  g.paint(fringe, BLONDE);
  g.line(14, 8, 24, 6, BLONDE.light);
  g.line(10, 11, 17, 8, BLONDE.light);
  for (let y = 20; y < 50; y += 4) g.set(7, y, BLONDE.shade).set(40, y + 2, BLONDE.shade);
  for (const cx of [15, 33]) {
    g.set(cx - 4, 13, UI.charcoal).set(cx - 3, 12, UI.charcoal).set(cx - 1, 11, UI.charcoal).set(cx + 1, 11, UI.charcoal).set(cx + 3, 12, UI.charcoal);
  }
  g.set(30, 25, "#3b2016");
  windowFrame(g);
}

function trenchcoatGpus(g: Grid): void {
  backdrop(g, "#34404a");
  const coat = ramp("#a68650");
  const body = m().rect(6, 30, 34, 30);
  g.paint(body, coat);
  const v = m().sym(30, [17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23], AXIS);
  g.fillMask(v, "#1c1f22");
  drawGpu(g, 15, 34, 18, 9, { fans: 2, fingers: false, bracket: false });
  g.fillMask(m().rect(0, 30, PW, PH).cut(v).clip(body), coat.base);
  g.paint(body.clone().cut(v), coat);
  const lapels = m()
    .rows(30, Array.from({ length: 14 }, (_, i) => [12 + Math.floor(i / 4), 16 + Math.floor(i / 2)] as const))
    .rows(30, Array.from({ length: 14 }, (_, i) => [31 - Math.floor(i / 2), 35 - Math.floor(i / 4)] as const));
  g.paint(lapels.cut(v), { ...coat, base: coat.light });
  g.paint(m().rect(6, 49, 34, 3), ramp("#6e5432"), { light: false });
  g.paint(m().rect(21, 48, 6, 5), ramp(SILVER), { light: false });
  g.fill(23, 50, 2, 1, "#2f3439");
  for (const y of [41, 45]) g.set(14, y, "#4a3520").set(33, y, "#4a3520");
  g.fill(40, 42, 3, 12, "#8c959c").fill(40, 42, 1, 12, "#c6ccd0");
  for (let y = 44; y < 53; y += 2) g.set(41, y, "#4a5157");
  g.fill(10, 59, 10, 1, "#e0b13a");
  const collar = m()
    .rows(24, [[14, 17], [13, 18], [12, 18], [12, 19], [11, 19], [11, 19], [10, 18]])
    .rows(24, [[30, 33], [29, 34], [29, 35], [28, 35], [28, 36], [28, 36], [29, 37]]);
  drawGpu(g, 10, 13, 28, 12, { fingers: false, bracket: false });
  g.paint(collar, coat);
  g.sprite(16, 23, ["..mmm....mmm..", ".mmmmmmmmmmmm.", "mmm.mmmmmm.mmm", "m...........m"], { m: "#3a2516" });
  const hat = ramp("#3d3a34");
  g.paint(m().rows(4, [[16, 31], [14, 33], [13, 34], [13, 34], [13, 34], [13, 34], [12, 35]]).del(23, 4).del(24, 4), hat);
  g.fill(13, 9, 22, 2, UI.charcoal);
  g.paint(m().rect(5, 11, 38, 3).del(5, 11).del(42, 11), hat, { light: false });
  g.line(16, 5, 21, 5, hat.light);
  windowFrame(g);
}

function sentientJacket(g: Grid): void {
  backdrop(g, "#1b211e");
  const glow = UI.acid;
  g.tint(m().ellipse(23.5, 21, 12, 13), glow, 0.08, true);
  g.tint(m().ellipse(23.5, 22, 8, 9), glow, 0.12);
  g.tint(m().ellipse(23.5, 23, 5, 6), glow, 0.12, true);
  g.tint(m().ellipse(23.5, 24, 3, 3.5), glow, 0.18);
  const leather = ramp("#1f2023");
  OUTFITS["leather-jacket"].body(g, leather);
  const lining = m().sym(27, [20, 20, 20, 19, 19, 19, 19, 19, 20, 20, 21, 21], AXIS);
  g.fillMask(lining, "#060907");
  g.tint(m().rect(19, 27, 10, 3), glow, 0.25, true);
  const collar = m()
    .rows(27, [[15, 19], [14, 19], [14, 19], [13, 19], [13, 20], [13, 20], [13, 20], [14, 20], [15, 20], [16, 20], [17, 20]])
    .rows(27, [[28, 32], [28, 33], [28, 33], [28, 34], [27, 34], [27, 34], [27, 34], [27, 33], [27, 32], [27, 31], [27, 30]]);
  g.paint(collar, leather);
  g.line(19, 28, 19, 35, mix(leather.base, glow, 0.35));
  g.line(28, 28, 28, 35, mix(leather.base, glow, 0.35));
  g.line(15, 29, 15, 34, leather.light);
  g.set(21, 23, mix("#1b211e", glow, 0.5)).set(26, 23, mix("#1b211e", glow, 0.5));
  windowFrame(g);
}

const SPECIALS: Record<SpecialPortrait, (g: Grid) => void> = {
  "gpu-wig": gpuWig,
  "trenchcoat-gpus": trenchcoatGpus,
  "sentient-jacket": sentientJacket,
};

export function drawSpecial(g: Grid, id: SpecialPortrait): void {
  (SPECIALS[id] ?? sentientJacket)(g);
}
