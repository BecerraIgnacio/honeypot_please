import type { JensenMood } from "../art/jensen";
import { DAYS } from "../game/cases";
import { GLOBAL_EGGS } from "../game/content/globalEggs";
import { GLOBAL_RECORDS } from "../game/content/globalRecords";
import { caseById, findEgg, type FactRef, type GameContent, type GameState } from "../game/engine";
import type { CaseDef, DayNumber, Rarity, Token } from "../game/types";

export const CONTENT: GameContent = { days: DAYS, globalRecords: GLOBAL_RECORDS, globalEggs: GLOBAL_EGGS };

export const TOTAL_EGGS = new Set([
  ...DAYS.flatMap((d) => d.cases.flatMap((c) => (c.eggs ?? []).map((e) => e.id))),
  ...GLOBAL_EGGS.map((e) => e.id),
]).size;

export const refKey = (r: FactRef) => `${r.owner}|${r.id}`;
export const sameRef = (a: FactRef, b: FactRef) => a.owner === b.owner && a.id === b.id;

/** Deterministic [0, 1) from any number of parts, so reducer output never depends on Math.random. */
export function rng01(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const ch of parts.join("|")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function money(billions: number): string {
  const sign = billions < 0 ? "-" : "";
  const abs = Math.abs(billions);
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}T`;
  return `${sign}$${Math.round(abs)}B`;
}

export const signedMoney = (b: number) => (b > 0 ? `+${money(b)}` : money(b));
export const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export function jensenMood(run: GameState | null, suspicion = 0): JensenMood {
  if (!run) return "calm";
  if (run.stats.outcome === "honeypotted") return "devastated";
  if (run.stats.outcome === "victory") return "triumphant";
  const heat = (run.stats.day - 1) * 17 + suspicion * 0.45 + (100 - run.stats.romanticStability) * 0.15;
  if (heat < 22) return "calm";
  if (heat < 48) return "wary";
  if (heat < 74) return "paranoid";
  return "unhinged";
}

function recordTitle(c: CaseDef, id: string): string | undefined {
  return (
    c.records.find((r) => r.id === id)?.title ??
    DAYS.flatMap((d) => d.directives).find((r) => r.id === id)?.title ??
    GLOBAL_RECORDS.find((r) => r.id === id)?.title
  );
}

/** Human label for a progress token, for the review screen. */
export function tokenLabel(c: CaseDef, token: Token): { verb: string; text: string } {
  const [kind, id = ""] = token.split(/:(.*)/);
  switch (kind) {
    case "doc":
      return { verb: "Read", text: c.documents.find((d) => d.id === id)?.title ?? id };
    case "q":
      return { verb: "Asked", text: c.questions.find((q) => q.id === id)?.prompt ?? id };
    case "d":
      return { verb: "Compared", text: c.discrepancies.find((d) => d.id === id)?.note ?? id };
    case "rec":
      return { verb: "Pulled", text: recordTitle(c, id) ?? id };
    case "scan":
      return id
        ? { verb: "Scan found", text: c.scan.find((s) => s.id === id)?.title ?? id }
        : { verb: "Ran", text: "the advanced scan" };
    default:
      return { verb: "Noted", text: token };
  }
}

export function eggTitle(eggId: string): string {
  return findEgg(CONTENT, eggId)?.title ?? eggId;
}

/** The spy who ended the run, for her portrait on the share card. */
export function fatalCase(run: GameState): CaseDef | undefined {
  const last = [...run.stats.decisions].reverse().find((d) => d.verdict === "accept" && d.truth === "spy");
  return last ? caseById(CONTENT, last.caseId) : undefined;
}

export const RARITY: Record<Rarity, { color: string; label: string }> = {
  common: { color: "#cfc6ad", label: "Common" },
  rare: { color: "#b6ff00", label: "Rare" },
  epic: { color: "#6fd3ff", label: "Epic" },
  legendary: { color: "#ffb000", label: "Legendary" },
  cursed: { color: "#e5322d", label: "Cursed" },
};

export const DAY_DATES: Record<DayNumber, string> = {
  1: "Monday, March 15, 2027",
  2: "Tuesday, March 16, 2027",
  3: "Wednesday, March 17, 2027",
  4: "Thursday, March 18, 2027",
  5: "Friday, March 19, 2027",
};
