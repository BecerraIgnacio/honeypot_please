import type { GameConfig } from "../config";
import type { CaseDef, DayDef, DayNumber, Truth } from "../types";
import type { GameContent } from "./state";

type Rand = () => number;

export const DAYS: readonly DayNumber[] = [1, 2, 3, 4, 5];

function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rand: Rand): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(items: readonly T[], rand: Rand): T {
  return items[Math.floor(rand() * items.length)];
}

const count = (cases: readonly CaseDef[], truth: Truth) => cases.filter((c) => c.truth === truth).length;

function meetsMix(cases: readonly CaseDef[], config: GameConfig): boolean {
  return count(cases, "spy") >= config.minSpies && count(cases, "innocent") >= config.minInnocents;
}

function drawDay(day: DayDef, rand: Rand, config: GameConfig): string[] {
  const regular = day.cases.filter((c) => c.slot === "regular");
  const fixed = day.day === 1 ? regular.slice(0, 1) : [];
  const pool = shuffle(regular.slice(fixed.length), rand);
  const chosen = [...fixed];
  const take = (truth: Truth) => {
    const i = pool.findIndex((c) => c.truth === truth);
    if (i < 0) return false;
    chosen.push(...pool.splice(i, 1));
    return true;
  };
  while (count(chosen, "spy") < config.minSpies && take("spy"));
  while (count(chosen, "innocent") < config.minInnocents && take("innocent"));
  while (chosen.length < config.lineupSize && pool.length > 0) chosen.push(pool.shift()!);

  const lineup = [...fixed, ...shuffle(chosen.slice(fixed.length), rand)];
  const rares = day.cases.filter((c) => c.slot === "rare");
  if (rares.length > 0 && rand() < config.rareChance) {
    const rare = pick(rares, rand);
    const slots = lineup
      .map((_, i) => i)
      .filter((i) => i >= fixed.length && meetsMix(lineup.map((c, j) => (j === i ? rare : c)), config));
    if (slots.length > 0) lineup[pick(slots, rand)] = rare;
  }
  return [...lineup, ...day.cases.filter((c) => c.slot === "finale")].map((c) => c.id);
}

export function drawLineup(seed: number, content: GameContent, config: GameConfig): string[][] {
  const rand = mulberry32(seed);
  return DAYS.map((n) => {
    const day = content.days.find((d) => d.day === n);
    return day ? drawDay(day, rand, config) : [];
  });
}
