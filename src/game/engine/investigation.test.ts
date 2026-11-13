import { describe, expect, it } from "vitest";
import type { CaseDef } from "../types";
import { makeContent, perfect, play } from "./fixture";
import {
  canScan,
  createRun,
  currentCase,
  discovered,
  notebook,
  offeredQuestions,
  reduce,
  revealedFacts,
  revealedScanFindings,
  suspicion,
  type Action,
  type FactRef,
  type GameContent,
  type GameState,
} from "./index";

function tutorialCase(over: Partial<CaseDef> = {}) {
  const content = makeContent({ tutorial: over });
  const state = reduce(createRun(1, content), { type: "advance" }, content);
  const act = (s: GameState, ...actions: Action[]) => actions.reduce((x, a) => reduce(x, a, content), s);
  return { content, state, act };
}

const ada = (id: string): FactRef => ({ owner: "d1-r0", id });
const compare = (a: FactRef, b: FactRef): Action => ({ type: "compare", a, b });
const open = (docId: string): Action => ({ type: "openDocument", docId });
const view = (recordId: string): Action => ({ type: "viewRecord", recordId });
const ask = (questionId: string): Action => ({ type: "askQuestion", questionId });

describe("discrepancy tool", () => {
  it("a matching pair writes the notebook, grants the token and moves suspicion", () => {
    const { content, state, act } = tutorialCase();
    const s = act(state, open("badge"), view("rec-ada"), compare(ada("badge.no"), ada("rec.badge")));
    expect(s.events.at(-1)).toEqual({ type: "discrepancyFound", caseId: "d1-r0", discrepancyId: "badge-match", kind: "match" });
    expect(notebook(s, content).map((d) => d.id)).toEqual(["badge-match"]);
    expect(discovered(s)).toContain("d:badge-match");
    expect(suspicion(s, content)).toBe(30);
    expect(s.stats.discrepanciesFound).toBe(1);
  });

  it("is order-insensitive", () => {
    const { content, state, act } = tutorialCase();
    const s = act(state, open("badge"), view("rec-ada"), compare(ada("rec.badge"), ada("badge.no")));
    expect(notebook(s, content).map((d) => d.id)).toEqual(["badge-match"]);
  });

  it("an unrelated pair reports no conflict", () => {
    const { content, state, act } = tutorialCase();
    const s = act(state, open("badge"), compare(ada("name"), ada("badge.no")));
    expect(s.events.at(-1)).toEqual({ type: "noConflict", caseId: "d1-r0" });
    expect(notebook(s, content)).toEqual([]);
    expect(s.stats.discrepanciesFound).toBe(0);
  });

  it("matches global directive facts but never another case's fact", () => {
    const { content, state, act } = tutorialCase();
    const s = act(state, open("pass"), compare(ada("pass.date"), { owner: "global", id: "g.d1.cutoff" }));
    expect(notebook(s, content).map((d) => d.id)).toEqual(["date-rule"]);

    const other = act(state, view("rec-d1-r1"), compare(ada("name"), { owner: "d1-r1", id: "rec.name" }));
    expect(other.events.at(-1)).toEqual({ type: "noConflict", caseId: "d1-r0" });
    const own = act(other, view("rec-ada"), compare(ada("name"), ada("rec.name")));
    expect(notebook(own, content).map((d) => d.id)).toEqual(["name-match"]);
  });

  it("does not count a found pair twice", () => {
    const { state, act } = tutorialCase();
    const once = act(state, open("badge"), view("rec-ada"), compare(ada("badge.no"), ada("rec.badge")));
    const twice = act(once, compare(ada("rec.badge"), ada("badge.no")));
    expect(twice).toBe(once);
    expect(twice.stats.discrepanciesFound).toBe(1);
  });

  it("ignores facts that are not revealed yet", () => {
    const { state, act } = tutorialCase();
    expect(act(state, compare(ada("badge.no"), ada("rec.badge")))).toBe(state);
    const opened = act(state, open("badge"), view("rec-ada"));
    expect(act(opened, compare(ada("badge.no"), ada("rec.badge"))).stats.discrepanciesFound).toBe(1);
  });
});

describe("questions", () => {
  const offered = (s: GameState, content: GameContent) =>
    offeredQuestions(s, content).map((o) => `${o.question.id}${o.asked ? "*" : ""}`);

  it("are offered only once every required token is discovered", () => {
    const { content, state, act } = tutorialCase();
    expect(offered(state, content)).toEqual(["why", "hobby"]);
    expect(act(state, ask("badge-q"))).toBe(state);
    const s = act(state, open("badge"));
    expect(offered(s, content)).toEqual(["why", "badge-q", "hobby"]);
    const deep = act(s, ask("why"), open("pass"));
    expect(offered(deep, content)).toEqual(["why*", "badge-q", "deep", "hobby"]);
  });

  it("reveal their answer facts only when asked", () => {
    const { content, state, act } = tutorialCase();
    const ids = (s: GameState) => revealedFacts(s, content).map((f) => `${f.ref.owner}:${f.ref.id}`);
    expect(ids(state)).toEqual(["d1-r0:name", "d1-r0:employer", "global:g.d1.cutoff"]);
    const s = act(state, ask("why"));
    expect(ids(s)).toEqual(["d1-r0:name", "d1-r0:employer", "d1-r0:why.claim", "global:g.d1.cutoff"]);
    expect(suspicion(s, content)).toBe(45);
    expect(s.stats.questionsAsked).toBe(1);
    expect(act(s, ask("why"))).toBe(s);
  });
});

describe("scan", () => {
  it("reveals every finding for one charge, and repeating it is free", () => {
    const { content, state, act } = tutorialCase();
    expect(canScan(state)).toBe(true);
    const s = act(state, { type: "scan" });
    expect(s.scansLeft).toBe(1);
    expect(discovered(s)).toEqual(["scan", "scan:bag", "scan:clean"]);
    expect(s.events.at(-1)).toEqual({ type: "scanUsed", caseId: "d1-r0", findings: 2 });
    expect(revealedScanFindings(s, content).map((f) => f.id)).toEqual(["bag", "clean"]);
    expect(suspicion(s, content)).toBe(55);
    expect(canScan(s)).toBe(false);
    expect(act(s, { type: "scan" })).toBe(s);
  });

  it("runs out after two cases and refills the next morning", () => {
    const { content, state, act } = tutorialCase();
    const decide: Action = { type: "decide", verdict: "accept" };
    const advance: Action = { type: "advance" };
    let s = act(state, { type: "scan" }, decide, advance);
    s = act(s, { type: "scan" });
    expect(s.scansLeft).toBe(0);
    s = act(s, { type: "decide", verdict: perfect(currentCase(s, content)!) }, advance);
    expect(canScan(s)).toBe(false);
    expect(act(s, { type: "scan" })).toBe(s);
    const nextMorning = play(s, content, perfect, (x) => x.phase.kind === "briefing");
    expect(nextMorning.stats.day).toBe(2);
    expect(nextMorning.scansLeft).toBe(2);
  });
});

describe("suspicion", () => {
  it("clamps at 100", () => {
    const { content, state, act } = tutorialCase({ baseSuspicion: 95 });
    expect(suspicion(act(state, ask("why"), { type: "scan" }), content)).toBe(100);
  });

  it("clamps at 0", () => {
    const { content, state, act } = tutorialCase({ baseSuspicion: 2 });
    expect(suspicion(act(state, open("badge"), view("rec-ada"), compare(ada("badge.no"), ada("rec.badge"))), content)).toBe(0);
  });
});

describe("easter eggs", () => {
  const eggEvents = (s: GameState) => s.events.filter((e) => e.type === "eggFound");

  it("a case egg fires on its token once per run", () => {
    const { state, act } = tutorialCase();
    const s = act(state, open("badge"));
    expect(s.events.slice(-2)).toEqual([
      { type: "docOpened", caseId: "d1-r0", docId: "badge" },
      { type: "eggFound", eggId: "egg-badge" },
    ]);
    expect(s.stats.eggsFound).toEqual(["egg-badge"]);
  });

  it("search eggs match the term inside a query, case-insensitively, once", () => {
    const { state, act } = tutorialCase();
    const s = act(state, { type: "search", query: "she said rocm with affection" }, { type: "search", query: "ROCM" });
    expect(eggEvents(s)).toEqual([{ type: "eggFound", eggId: "egg-rocm" }]);
    expect(s.events.filter((e) => e.type === "dbSearched")).toHaveLength(2);
  });

  it("ui eggs fire through uiTrigger, once", () => {
    const { state, act } = tutorialCase();
    expect(act(state, { type: "uiTrigger", name: "nothing" })).toBe(state);
    const s = act(state, { type: "uiTrigger", name: "jacket" });
    expect(eggEvents(s)).toEqual([{ type: "eggFound", eggId: "egg-jacket" }]);
    expect(act(s, { type: "uiTrigger", name: "jacket" })).toBe(s);
    expect(s.stats.eggsFound).toEqual(["egg-jacket"]);
  });
});
