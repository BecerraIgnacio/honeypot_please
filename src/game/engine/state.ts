import type {
  DayDef,
  DbRecord,
  DecisionRecord,
  EasterEgg,
  GameEvent,
  RunStats,
  Token,
  Verdict,
} from "../types";

export interface GameContent {
  days: DayDef[];
  globalRecords: DbRecord[];
  globalEggs: EasterEgg[];
}

/** Owner of global facts and records: directives and `globalRecords`. */
export const GLOBAL = "global";

/** `owner` is a case id or `GLOBAL`. */
export interface FactRef {
  owner: string;
  id: string;
}

export type Phase =
  | { kind: "briefing" }
  /** `index` points into today's lineup. `tokens` are in discovery order. */
  | { kind: "case"; index: number; tokens: Token[] }
  | { kind: "review"; index: number; tokens: Token[]; decision: DecisionRecord }
  | { kind: "dayEnd" }
  | { kind: "ended" };

/** Plain JSON. Safe to persist and restore with JSON.stringify / JSON.parse. */
export interface GameState {
  version: 1;
  /** Case ids per day: `lineup[day - 1]`, finale last. Fixed at createRun. */
  lineup: string[][];
  phase: Phase;
  scansLeft: number;
  stats: RunStats;
  /** Append-only. Read by index. */
  events: GameEvent[];
}

export type Action =
  /** briefing -> first case, review -> next case | dayEnd | ended, dayEnd -> next briefing | ended. */
  | { type: "advance" }
  | { type: "openDocument"; docId: string }
  | { type: "askQuestion"; questionId: string }
  /** Log a submitted query. Results come from `searchDatabase`. */
  | { type: "search"; query: string }
  | { type: "viewRecord"; recordId: string }
  | { type: "compare"; a: FactRef; b: FactRef }
  | { type: "scan" }
  | { type: "decide"; verdict: Verdict }
  | { type: "uiTrigger"; name: string };
