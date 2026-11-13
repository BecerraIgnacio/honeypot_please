import { describe, expect, it } from "vitest";
import type { CardStyle } from "../../game/types";
import table from "./prompts.json";
import { ART_KEYS, ART_PROMPTS, artKeyForStyle, buildArtPrompt, isArtKey } from "./prompts";

const CARD_STYLES: CardStyle[] = ["security-report", "tabloid", "classified", "board-memo", "propaganda"];
const MOMENTS = ["honeypotted", "bankrupt", "victory", "jacket", "gpu-wig", "trenchcoat", "h100-wedding", "doom"];
const REAL_PEOPLE =
  /\b(jensen|huang|lisa su|musk|elon|altman|zuckerberg|bezos|nadella|pichai|tim cook|bill gates|pat gelsinger)\b/i;

describe("art prompts table", () => {
  it("has a key per card style and per big moment", () => {
    expect([...ART_KEYS].sort()).toEqual([...CARD_STYLES, ...MOMENTS].sort());
    for (const style of CARD_STYLES) expect(isArtKey(artKeyForStyle(style))).toBe(true);
  });

  it("gives every key a substantial prompt and a known style", () => {
    for (const key of ART_KEYS) {
      expect(ART_PROMPTS[key].prompt.length, key).toBeGreaterThan(60);
      expect(Object.keys(table.styles), key).toContain(ART_PROMPTS[key].style);
    }
  });

  it("never names a real person and always forbids text and likeness", () => {
    for (const key of ART_KEYS) {
      const prompt = buildArtPrompt(key);
      expect(prompt, key).not.toMatch(REAL_PEOPLE);
      expect(prompt, key).not.toMatch(/\bnvidia\b/i);
      expect(prompt, key).toContain("No text");
      expect(prompt, key).toContain("no recognizable real person");
    }
  });

  it("rejects free text and prototype keys", () => {
    expect(isArtKey("a photo of anyone you like")).toBe(false);
    expect(isArtKey("toString")).toBe(false);
    expect(isArtKey(42)).toBe(false);
  });
});
