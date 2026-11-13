import type { CardStyle } from "../../game/types";

export interface CardStat {
  label: string;
  value: string;
}

export interface CardData {
  style: CardStyle;
  /** Achievement title or rank. */
  title: string;
  memePhrase: string;
  subtext: string;
  /** Up to 4; extras are dropped. */
  stats: CardStat[];
  /** Applicant or Jensen pixel-art SVG markup, drawn as the illustration. */
  portraitSvg?: string;
  /** Stylized art (static or AI-generated); backs the illustration, the portrait becomes an inset. */
  artUrl?: string;
  gameUrl: string;
  caseFileNo?: string;
}

export type CardSize = "landscape" | "square";

export const CARD_DIMENSIONS: Readonly<Record<CardSize, { width: number; height: number }>> = {
  landscape: { width: 1200, height: 675 },
  square: { width: 1080, height: 1080 },
};

export type FontRole = "pixel" | "mono" | "display";

/** CSS font-family strings per role, resolved from `--font-pixel`, `--font-mono`, `--font-display`. */
export type CardFonts = Readonly<Record<FontRole, string>>;

export interface FontSpec {
  role: FontRole;
  size: number;
  weight: number;
}

/** Width in px of `text` set in `font`, without tracking. */
export type Measure = (text: string, font: FontSpec) => number;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TextureKind =
  | "scanlines"
  | "grain"
  | "noise"
  | "halftone"
  | "glitch"
  | "registration"
  | "rays"
  | "ruled"
  | "grid"
  | "stain"
  | "vignette"
  | "corners";

interface OpBase {
  box: Box;
  alpha?: number;
  blend?: GlobalCompositeOperation;
  /** Radians, about the box center. */
  rotate?: number;
  clip?: "ellipse";
}

export interface TextOp extends OpBase {
  kind: "text";
  /** The source string before casing and wrapping. */
  text: string;
  lines: string[];
  font: FontSpec;
  color: string;
  lineHeight: number;
  align: "left" | "center" | "right";
  valign: "top" | "middle" | "bottom";
  /** Extra px after each glyph. */
  tracking: number;
  /** Horizontal padding reserved inside the box for `highlight`. */
  padX: number;
  highlight?: string;
  shadow?: { color: string; dx: number; dy: number };
  stroke?: { color: string; width: number };
  truncated: boolean;
}

export type DrawOp =
  | (OpBase & { kind: "rect"; fill?: string; stroke?: string; lineWidth?: number; dash?: number[] })
  | (OpBase & { kind: "ellipse"; fill?: string; stroke?: string; lineWidth?: number })
  | (OpBase & {
      kind: "poly";
      points: Array<[number, number]>;
      fill?: string;
      stroke?: string;
      lineWidth?: number;
      closed: boolean;
    })
  | TextOp
  | (OpBase & { kind: "image"; source: "art" | "portrait"; fit: "cover" | "contain" })
  | (OpBase & {
      kind: "texture";
      texture: TextureKind;
      color: string;
      seed: number;
      density?: number;
      /** Rays only: the burst center, which may sit off the box center. */
      origin?: [number, number];
    })
  | (OpBase & { kind: "stamp"; text: string; lines: string[]; font: FontSpec; color: string; seed: number });

export interface CardImage {
  source: CanvasImageSource;
  width: number;
  height: number;
}

export interface CardAssets {
  fonts: CardFonts;
  art?: CardImage;
  portrait?: CardImage;
}

export interface CardLayout {
  width: number;
  height: number;
  ops: DrawOp[];
}
