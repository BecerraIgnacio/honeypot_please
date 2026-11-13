import type { PortraitSpec } from "../game/types";
import {
  ACCESSORY_ORDER,
  DEFAULT_OUTFIT,
  EYES,
  MOUTHS,
  drawAccessory,
  drawEyes,
  drawHead,
  drawMouth,
  drawOutfit,
  skinRamp,
} from "./body";
import { DEFAULT_HAIR, HAIR } from "./hair";
import { Grid, type PixelSvg, ramp, safeHex } from "./pixel";
import { drawSpecial } from "./specials";
import { PH, PW, backdrop, sizeOf, windowFrame } from "./stage";

type Human = Extract<PortraitSpec, { kind: "human" }>;

function drawHuman(g: Grid, spec: Human): void {
  const skin = skinRamp(spec.skin);
  const hr = ramp(safeHex(spec.hair?.color, DEFAULT_HAIR));
  const hair = HAIR[spec.hair?.style] ?? HAIR.bob;

  backdrop(g, spec.bg);
  const back = hair.back?.();
  if (back) g.paint(back, hr);
  drawOutfit(g, spec.outfit?.style, ramp(safeHex(spec.outfit?.color, DEFAULT_OUTFIT)), skin);
  drawHead(g, skin);
  const eyes = EYES[spec.eyes ?? "neutral"] ?? EYES.neutral;
  drawEyes(g, eyes.left, eyes.right, { brow: hair.browColor?.(hr) ?? hr.outline, skin });
  drawMouth(g, MOUTHS[spec.mouth ?? "neutral"] ?? MOUTHS.neutral, skin);
  const front = hair.front?.();
  if (front) {
    if (hair.paintFront) hair.paintFront(g, hr, front, skin);
    else g.paint(front, hr);
    hair.detail?.(g, hr, back ? back.clone().union(front) : front);
  }
  const worn = new Set(spec.accessories ?? []);
  for (const a of ACCESSORY_ORDER) if (worn.has(a)) drawAccessory(g, a);
  windowFrame(g);
}

export function portraitSvg(spec: PortraitSpec, opts?: { size?: number }): PixelSvg {
  const g = new Grid(PW, PH);
  if (spec.kind === "special") drawSpecial(g, spec.id);
  else drawHuman(g, spec);
  return g.toSvg(sizeOf(opts));
}
