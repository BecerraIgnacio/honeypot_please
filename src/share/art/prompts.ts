import type { CardStyle } from "../../game/types";
import table from "./prompts.json";

export type ArtStyle = keyof typeof table.styles;
export type ArtKey = keyof typeof table.keys;

export interface ArtPrompt {
  prompt: string;
  style: ArtStyle;
}

export const ART_SIZE: string = table.size;

export const ART_PROMPTS: Readonly<Record<ArtKey, ArtPrompt>> = table.keys as Record<ArtKey, ArtPrompt>;

export const ART_KEYS = Object.keys(ART_PROMPTS) as ArtKey[];

export function isArtKey(value: unknown): value is ArtKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(ART_PROMPTS, value);
}

/** The exact text sent to the image model. `scripts/generate-art.mjs` composes it the same way. */
export function buildArtPrompt(key: ArtKey): string {
  const entry = ART_PROMPTS[key];
  return `${entry.prompt} ${table.styles[entry.style]} ${table.suffix}`;
}

/** Every card style has an art key of the same name. */
export function artKeyForStyle(style: CardStyle): ArtKey {
  return style;
}
