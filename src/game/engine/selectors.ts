import type {
  CaseDef,
  DayDef,
  DayNumber,
  DbRecord,
  DecisionRecord,
  Discrepancy,
  EasterEgg,
  Fact,
  Outcome,
  Question,
  ScanFinding,
  Token,
  Truth,
} from "../types";
import { GLOBAL, type FactRef, type GameContent, type GameState } from "./state";

export interface DbHit {
  /** Case id, or `GLOBAL` for directives and global records. */
  owner: string;
  record: DbRecord;
}

export type FactSource =
  | { kind: "claim" }
  | { kind: "document" | "question" | "record" | "scan"; id: string };

export interface RevealedFact {
  ref: FactRef;
  fact: Fact;
  from: FactSource;
}

export interface ReviewView {
  case: CaseDef;
  decision: DecisionRecord;
  /** `onAccept` or `onReject`, whichever was chosen. */
  outcome: Outcome;
  explanation: string;
  truth: Truth;
  hiddenTruth: string;
  cluesFound: Token[];
  cluesMissed: Token[];
  redHerringsFound: Token[];
}

export interface DaySummary {
  day: DayNumber;
  decisions: DecisionRecord[];
  correct: number;
  marketCapDelta: number;
  stabilityDelta: number;
}

export const clamp = (lo: number, hi: number, n: number) => Math.min(hi, Math.max(lo, n));

export function caseById(content: GameContent, id: string): CaseDef | undefined {
  for (const day of content.days) {
    const found = day.cases.find((c) => c.id === id);
    if (found) return found;
  }
  return undefined;
}

export function currentDay(state: GameState, content: GameContent): DayDef | undefined {
  return content.days.find((d) => d.day === state.stats.day);
}

export function todayLineup(state: GameState): string[] {
  return state.lineup[state.stats.day - 1] ?? [];
}

/** The case under investigation (case phase) or under review (review phase). */
export function currentCase(state: GameState, content: GameContent): CaseDef | null {
  const { phase } = state;
  if (phase.kind !== "case" && phase.kind !== "review") return null;
  return caseById(content, todayLineup(state)[phase.index]) ?? null;
}

export function lineupPosition(state: GameState): { day: DayNumber; index: number; total: number } | null {
  const { phase } = state;
  if (phase.kind !== "case" && phase.kind !== "review") return null;
  return { day: state.stats.day, index: phase.index, total: todayLineup(state).length };
}

/** Tokens discovered in the current case, in discovery order. */
export function discovered(state: GameState): readonly Token[] {
  const { phase } = state;
  return phase.kind === "case" || phase.kind === "review" ? phase.tokens : [];
}

export function canDecide(state: GameState): boolean {
  return state.phase.kind === "case";
}

export function canScan(state: GameState): boolean {
  return state.phase.kind === "case" && state.scansLeft > 0 && !state.phase.tokens.includes("scan");
}

export function offeredQuestions(state: GameState, content: GameContent): { question: Question; asked: boolean }[] {
  const c = currentCase(state, content);
  if (!c) return [];
  const tokens = discovered(state);
  return c.questions
    .filter((q) => (q.requires ?? []).every((t) => tokens.includes(t)))
    .map((question) => ({ question, asked: tokens.includes(`q:${question.id}`) }));
}

export function revealedScanFindings(state: GameState, content: GameContent): ScanFinding[] {
  const c = currentCase(state, content);
  const tokens = discovered(state);
  return c ? c.scan.filter((s) => tokens.includes(`scan:${s.id}`)) : [];
}

/** Discrepancy entries found in the current case, in the order found. */
export function notebook(state: GameState, content: GameContent): Discrepancy[] {
  const c = currentCase(state, content);
  if (!c) return [];
  return discovered(state)
    .filter((t) => t.startsWith("d:"))
    .map((t) => c.discrepancies.find((d) => `d:${d.id}` === t)!);
}

export function suspicion(state: GameState, content: GameContent): number {
  const c = currentCase(state, content);
  if (!c) return 0;
  const has = (t: Token) => discovered(state).includes(t);
  const total =
    c.baseSuspicion +
    c.questions.reduce((sum, q) => sum + (has(`q:${q.id}`) ? (q.suspicion ?? 0) : 0), 0) +
    c.discrepancies.reduce((sum, d) => sum + (has(`d:${d.id}`) ? d.suspicion : 0), 0) +
    c.scan.reduce((sum, s) => sum + (has(`scan:${s.id}`) ? s.suspicion : 0), 0);
  return clamp(0, 100, total);
}

/** Directives from Day 1 through today, newest day first. */
export function directivesInForce(state: GameState, content: GameContent): DbHit[] {
  return content.days
    .filter((d) => d.day <= state.stats.day)
    .sort((a, b) => b.day - a.day)
    .flatMap((d) => d.directives.map((record) => ({ owner: GLOBAL, record })));
}

function visibleRecords(state: GameState, content: GameContent): DbHit[] {
  const pool = content.days
    .filter((d) => d.day === state.stats.day)
    .flatMap((d) => d.cases)
    .flatMap((c) => c.records.map((record) => ({ owner: c.id, record })));
  return [
    ...directivesInForce(state, content),
    ...pool,
    ...content.globalRecords.map((record) => ({ owner: GLOBAL, record })),
  ];
}

/** A visible record by id, preferring the current case's own record when ids collide. */
export function findRecord(state: GameState, content: GameContent, recordId: string): DbHit | undefined {
  const hits = visibleRecords(state, content).filter((h) => h.record.id === recordId);
  const caseId = currentCase(state, content)?.id;
  return hits.find((h) => h.owner === caseId) ?? hits[0];
}

function haystack(r: DbRecord): string {
  return [r.title, ...r.keywords, r.category, ...r.facts.map((f) => f.value)].join("\n").toLowerCase();
}

export function searchDatabase(state: GameState, content: GameContent, query: string): DbHit[] {
  const q = query.trim().toLowerCase();
  if (q === "") return directivesInForce(state, content);
  if (q.length < 2) return [];
  const terms = q.split(/\s+/);
  return visibleRecords(state, content).filter((h) => {
    const hay = haystack(h.record);
    return terms.every((t) => hay.includes(t));
  });
}

/** Facts the player may select for `compare` in the current case. */
export function revealedFacts(state: GameState, content: GameContent): RevealedFact[] {
  const c = currentCase(state, content);
  if (!c) return [];
  const tokens = discovered(state);
  const has = (t: Token) => tokens.includes(t);
  const out = new Map<string, RevealedFact>();
  const add = (owner: string, facts: Fact[] | undefined, from: FactSource) => {
    for (const fact of facts ?? []) {
      const key = `${owner}|${fact.id}`;
      if (!out.has(key)) out.set(key, { ref: { owner, id: fact.id }, fact, from });
    }
  };

  add(c.id, c.claims, { kind: "claim" });
  for (const d of c.documents) if (has(`doc:${d.id}`)) add(c.id, d.facts, { kind: "document", id: d.id });
  for (const q of c.questions) if (has(`q:${q.id}`)) add(c.id, q.facts, { kind: "question", id: q.id });
  for (const s of c.scan) if (has(`scan:${s.id}`)) add(c.id, s.facts, { kind: "scan", id: s.id });
  for (const h of directivesInForce(state, content)) add(h.owner, h.record.facts, { kind: "record", id: h.record.id });
  for (const t of tokens) {
    if (!t.startsWith("rec:")) continue;
    const h = findRecord(state, content, t.slice(4));
    if (h) add(h.owner, h.record.facts, { kind: "record", id: h.record.id });
  }
  return [...out.values()];
}

export function reviewView(state: GameState, content: GameContent): ReviewView | null {
  const { phase } = state;
  const c = currentCase(state, content);
  if (phase.kind !== "review" || !c) return null;
  const found = (t: Token) => phase.tokens.includes(t);
  return {
    case: c,
    decision: phase.decision,
    outcome: phase.decision.verdict === "accept" ? c.onAccept : c.onReject,
    explanation: c.solution.explanation,
    truth: c.truth,
    hiddenTruth: c.hiddenTruth,
    cluesFound: c.solution.clues.filter(found),
    cluesMissed: c.solution.clues.filter((t) => !found(t)),
    redHerringsFound: c.solution.redHerrings.filter(found),
  };
}

export function daySummary(state: GameState, day: DayNumber = state.stats.day): DaySummary {
  const decisions = state.stats.decisions.filter((d) => d.day === day);
  return {
    day,
    decisions,
    correct: decisions.filter((d) => d.correct).length,
    marketCapDelta: decisions.reduce((sum, d) => sum + d.marketCapDelta, 0),
    stabilityDelta: decisions.reduce((sum, d) => sum + d.stabilityDelta, 0),
  };
}

/** Looks up an egg by id among every case egg and global egg, for the toast. */
export function findEgg(content: GameContent, eggId: string): EasterEgg | undefined {
  const all = [...content.days.flatMap((d) => d.cases.flatMap((c) => c.eggs ?? [])), ...content.globalEggs];
  return all.find((e) => e.id === eggId);
}
