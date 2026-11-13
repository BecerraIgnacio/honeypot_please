import { CONFIG } from "../config";
import type { CaseDef, DayNumber, DecisionRecord, RunOutcome, RunStats, Token, Truth, Verdict } from "../types";
import { drawLineup } from "./lineup";
import {
  canScan,
  clamp,
  currentCase,
  findRecord,
  offeredQuestions,
  revealedFacts,
  searchDatabase,
  todayLineup,
} from "./selectors";
import { GLOBAL, type Action, type FactRef, type GameContent, type GameState } from "./state";

type CounterKey = "spiesCaught" | "spiesAccepted" | "innocentsAccepted" | "innocentsRejected";

const COUNTER: Record<Verdict, Record<Truth, CounterKey>> = {
  accept: { spy: "spiesAccepted", innocent: "innocentsAccepted" },
  reject: { spy: "spiesCaught", innocent: "innocentsRejected" },
};

export function createRun(seed: number, content: GameContent): GameState {
  const normalized = seed >>> 0;
  return {
    version: 1,
    lineup: drawLineup(normalized, content, CONFIG),
    phase: { kind: "briefing" },
    scansLeft: CONFIG.scansPerDay,
    stats: {
      seed: normalized,
      day: 1,
      casesSeen: 0,
      spiesCaught: 0,
      spiesAccepted: 0,
      innocentsAccepted: 0,
      innocentsRejected: 0,
      questionsAsked: 0,
      discrepanciesFound: 0,
      scansUsed: 0,
      recordsViewed: 0,
      eggsFound: [],
      marketCap: CONFIG.startingMarketCap,
      startingMarketCap: CONFIG.startingMarketCap,
      romanticStability: CONFIG.startingStability,
      decisions: [],
      outcome: "in-progress",
    },
    events: [],
  };
}

function edit(state: GameState, fn: (d: GameState) => void): GameState {
  const d = structuredClone(state);
  fn(d);
  return d;
}

function tokensOf(d: GameState): Token[] {
  if (d.phase.kind !== "case") throw new Error(`expected case phase, got ${d.phase.kind}`);
  return d.phase.tokens;
}

function foundEgg(d: GameState, eggId: string) {
  if (d.stats.eggsFound.includes(eggId)) return;
  d.stats.eggsFound.push(eggId);
  d.events.push({ type: "eggFound", eggId });
}

function grant(d: GameState, c: CaseDef, granted: Token[]) {
  const tokens = tokensOf(d);
  for (const t of granted) {
    if (tokens.includes(t)) continue;
    tokens.push(t);
    for (const egg of c.eggs ?? []) if (egg.on === t) foundEgg(d, egg.id);
  }
}

function end(d: GameState, outcome: Exclude<RunOutcome, "in-progress">) {
  d.stats.outcome = outcome;
  d.events.push({ type: "runEnded", outcome });
}

function startCase(d: GameState, index: number) {
  const caseId = todayLineup(d)[index];
  if (caseId === undefined) {
    d.phase = { kind: "dayEnd" };
    completeDay(d);
    return;
  }
  d.phase = { kind: "case", index, tokens: [] };
  d.stats.casesSeen += 1;
  d.events.push({ type: "caseStarted", caseId });
}

function completeDay(d: GameState) {
  d.events.push({ type: "dayCompleted", day: d.stats.day });
  if (d.stats.day === 5) end(d, "victory");
}

function advance(state: GameState): GameState {
  const { phase } = state;
  switch (phase.kind) {
    case "briefing":
      return edit(state, (d) => startCase(d, 0));
    case "review":
      return edit(state, (d) => {
        const lost = d.stats.outcome === "honeypotted" || d.stats.outcome === "romantically-bankrupt";
        if (lost) d.phase = { kind: "ended" };
        else if (phase.index + 1 < todayLineup(d).length) startCase(d, phase.index + 1);
        else d.phase = { kind: "dayEnd" };
      });
    case "dayEnd":
      return edit(state, (d) => {
        if (d.stats.day === 5) {
          d.phase = { kind: "ended" };
          return;
        }
        d.stats.day = (d.stats.day + 1) as DayNumber;
        d.scansLeft = CONFIG.scansPerDay;
        d.phase = { kind: "briefing" };
      });
    case "case":
    case "ended":
      return state;
  }
}

const refKey = (r: FactRef) => `${r.owner}|${r.id}`;

function compare(state: GameState, content: GameContent, c: CaseDef, a: FactRef, b: FactRef): GameState {
  const revealed = new Set(revealedFacts(state, content).map((f) => refKey(f.ref)));
  if (!revealed.has(refKey(a)) || !revealed.has(refKey(b))) return state;
  const owns = (ref: FactRef, id: string) => ref.id === id && ref.owner === (id.startsWith("g.") ? GLOBAL : c.id);
  const hit = c.discrepancies.find(({ facts: [x, y] }) => (owns(a, x) && owns(b, y)) || (owns(a, y) && owns(b, x)));
  if (!hit) return edit(state, (d) => void d.events.push({ type: "noConflict", caseId: c.id }));
  if (state.phase.kind === "case" && state.phase.tokens.includes(`d:${hit.id}`)) return state;
  return edit(state, (d) => {
    d.stats.discrepanciesFound += 1;
    d.events.push({ type: "discrepancyFound", caseId: c.id, discrepancyId: hit.id, kind: hit.kind });
    grant(d, c, [`d:${hit.id}`]);
  });
}

function decide(state: GameState, c: CaseDef, verdict: Verdict): GameState {
  if (state.phase.kind !== "case") return state;
  const { index, tokens } = state.phase;
  const effect = CONFIG.verdicts[verdict][c.truth];
  return edit(state, (d) => {
    const s: RunStats = d.stats;
    const before = s.romanticStability;
    s.romanticStability = clamp(0, CONFIG.maxStability, before + effect.stability);
    const marketCapDelta = effect.marketCap + effect.marketCapPerDay * (s.day - 1);
    s.marketCap += marketCapDelta;
    s[COUNTER[verdict][c.truth]] += 1;
    const decision: DecisionRecord = {
      caseId: c.id,
      applicantName: c.applicant.name,
      day: s.day,
      verdict,
      truth: c.truth,
      correct: (verdict === "reject") === (c.truth === "spy"),
      marketCapDelta,
      stabilityDelta: s.romanticStability - before,
    };
    s.decisions.push(decision);
    d.phase = { kind: "review", index, tokens: [...tokens], decision };
    d.events.push({ type: "decided", decision, investigated: tokens.length });
    if (effect.fatal) {
      s.fatalSpyName = c.applicant.name;
      end(d, "honeypotted");
    } else if (s.romanticStability <= 0) {
      end(d, "romantically-bankrupt");
    } else if (index === todayLineup(d).length - 1) {
      completeDay(d);
    }
  });
}

function globalEggs(state: GameState, content: GameContent, matches: (on: string) => boolean): GameState {
  const fresh = content.globalEggs.filter((e) => matches(e.on) && !state.stats.eggsFound.includes(e.id));
  if (fresh.length === 0) return state;
  return edit(state, (d) => fresh.forEach((e) => foundEgg(d, e.id)));
}

function search(state: GameState, content: GameContent, query: string): GameState {
  if (state.phase.kind === "ended") return state;
  const hits = searchDatabase(state, content, query).length;
  const q = query.toLowerCase();
  const logged = edit(state, (d) => void d.events.push({ type: "dbSearched", query, hits }));
  return globalEggs(logged, content, (on) => {
    const term = on.startsWith("search:") ? on.slice(7).toLowerCase() : "";
    return term !== "" && q.includes(term);
  });
}

/**
 * The whole game. Pure: the same state, action and content always produce the same
 * result. An action that changes nothing returns the input state object itself.
 */
export function reduce(state: GameState, action: Action, content: GameContent): GameState {
  switch (action.type) {
    case "advance":
      return advance(state);
    case "search":
      return search(state, content, action.query);
    case "uiTrigger":
      return globalEggs(state, content, (on) => on === `ui:${action.name}`);
  }

  const c = currentCase(state, content);
  if (state.phase.kind !== "case" || !c) return state;
  const tokens = state.phase.tokens;

  switch (action.type) {
    case "openDocument": {
      const token = `doc:${action.docId}`;
      if (tokens.includes(token) || !c.documents.some((doc) => doc.id === action.docId)) return state;
      return edit(state, (d) => {
        d.events.push({ type: "docOpened", caseId: c.id, docId: action.docId });
        grant(d, c, [token]);
      });
    }
    case "askQuestion": {
      const offered = offeredQuestions(state, content).find((o) => o.question.id === action.questionId);
      if (!offered || offered.asked) return state;
      return edit(state, (d) => {
        d.stats.questionsAsked += 1;
        d.events.push({ type: "questionAsked", caseId: c.id, questionId: action.questionId });
        grant(d, c, [`q:${action.questionId}`]);
      });
    }
    case "viewRecord": {
      const token = `rec:${action.recordId}`;
      if (tokens.includes(token) || !findRecord(state, content, action.recordId)) return state;
      return edit(state, (d) => {
        d.stats.recordsViewed += 1;
        d.events.push({ type: "recordViewed", recordId: action.recordId });
        grant(d, c, [token]);
      });
    }
    case "compare":
      return compare(state, content, c, action.a, action.b);
    case "scan":
      if (!canScan(state)) return state;
      return edit(state, (d) => {
        d.scansLeft -= 1;
        d.stats.scansUsed += 1;
        d.events.push({ type: "scanUsed", caseId: c.id, findings: c.scan.length });
        grant(d, c, ["scan", ...c.scan.map((s) => `scan:${s.id}`)]);
      });
    case "decide":
      return decide(state, c, action.verdict);
  }
}
