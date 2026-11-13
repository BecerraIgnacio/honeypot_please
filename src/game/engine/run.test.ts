import { describe, expect, it } from "vitest";
import type { GameEvent } from "../types";
import { acceptAll, makeContent, perfect, play, rejectAll } from "./fixture";
import { caseById, createRun, currentCase, daySummary, reduce, reviewView, type Action, type GameState } from "./index";

const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1);
const advance: Action = { type: "advance" };

function run(seed: number, content = makeContent()) {
  return { content, state: reduce(createRun(seed, content), advance, content) };
}

const lastEvents = (s: GameState, n: number): GameEvent["type"][] => s.events.slice(-n).map((e) => e.type);

describe("verdicts", () => {
  it("accepting a spy ends the run at once as honeypotted", () => {
    const { content, state } = run(1, makeContent({ tutorial: { truth: "spy" } }));
    const s = reduce(state, { type: "decide", verdict: "accept" }, content);
    expect(s.stats.outcome).toBe("honeypotted");
    expect(s.stats.fatalSpyName).toBe("Ada Quill");
    expect(s.stats.marketCap).toBe(3800);
    expect(lastEvents(s, 2)).toEqual(["decided", "runEnded"]);
    expect(s.phase.kind).toBe("review");
    expect(reviewView(s, content)?.outcome.text).toBe("Accepted d1-r0");
    const ended = reduce(s, advance, content);
    expect(ended.phase.kind).toBe("ended");
    expect(reduce(ended, advance, content)).toBe(ended);
  });

  it("rejecting an innocent costs stability and market cap", () => {
    const { content, state } = run(1);
    const s = reduce(state, { type: "decide", verdict: "reject" }, content);
    expect(s.stats.romanticStability).toBe(65);
    expect(s.stats.marketCap).toBe(4910);
    expect(s.stats.innocentsRejected).toBe(1);
    expect(s.stats.outcome).toBe("in-progress");
  });

  it("enough wrongful rejections end the run as romantically bankrupt", () => {
    const content = makeContent();
    const s = play(createRun(5, content), content, rejectAll);
    expect(s.stats.outcome).toBe("romantically-bankrupt");
    expect(s.stats.romanticStability).toBe(0);
    expect(s.stats.decisions.at(-1)).toMatchObject({ verdict: "reject", truth: "innocent" });
    expect(lastEvents(s, 2)).toEqual(["decided", "runEnded"]);
    expect(s.phase.kind).toBe("ended");
  });

  it("two honest mistakes on Day 1 still reach victory", () => {
    const content = makeContent();
    let wrong = 0;
    const s = play(createRun(42, content), content, (c) => {
      if (c.truth === "innocent" && wrong < 2) {
        wrong++;
        return "reject";
      }
      return perfect(c);
    });
    expect(s.stats.innocentsRejected).toBe(2);
    expect(s.stats.outcome).toBe("victory");
  });

  it("reject-everyone is bankrupt by Day 2 on every seed", () => {
    const content = makeContent();
    const ends = SEEDS.map((seed) => play(createRun(seed, content), content, rejectAll).stats);
    expect(new Set(ends.map((s) => s.outcome))).toEqual(new Set(["romantically-bankrupt"]));
    expect(Math.max(...ends.map((s) => s.day))).toBe(2);
  });

  it("accept-everyone is honeypotted on Day 1 on every seed", () => {
    const content = makeContent();
    const ends = SEEDS.map((seed) => play(createRun(seed, content), content, acceptAll).stats);
    expect(new Set(ends.map((s) => s.outcome))).toEqual(new Set(["honeypotted"]));
    expect(new Set(ends.map((s) => s.day))).toEqual(new Set([1]));
    expect(ends.every((s) => /^Applicant d1-/.test(s.fatalSpyName ?? ""))).toBe(true);
  });

  it("perfect play wins every seed with full stability", () => {
    const content = makeContent();
    const ends = SEEDS.map((seed) => play(createRun(seed, content), content, perfect).stats);
    expect(new Set(ends.map((s) => s.outcome))).toEqual(new Set(["victory"]));
    expect(new Set(ends.map((s) => s.decisions.length))).toEqual(new Set([25]));
    expect(new Set(ends.map((s) => s.romanticStability))).toEqual(new Set([100]));
  });

  it("victory is declared on the last decision of Day 5 and the run ends after the summary", () => {
    const content = makeContent();
    const s = play(createRun(9, content), content, perfect, (x) => x.stats.outcome === "victory");
    expect(lastEvents(s, 3)).toEqual(["decided", "dayCompleted", "runEnded"]);
    const summary = reduce(s, advance, content);
    expect(summary.phase.kind).toBe("dayEnd");
    expect(daySummary(summary)).toMatchObject({ day: 5, correct: 5 });
    expect(reduce(summary, advance, content).phase.kind).toBe("ended");
  });
});

describe("lineup", () => {
  const content = makeContent();
  const lineups = Array.from({ length: 1000 }, (_, seed) => createRun(seed, content).lineup);

  it("is 4 regulars plus the finale, tutorial first on Day 1, finale last", () => {
    for (const lineup of lineups) {
      expect(lineup.map((day) => day.length)).toEqual([5, 5, 5, 5, 5]);
      expect(lineup[0][0]).toBe("d1-r0");
      expect(lineup.map((day) => day[4])).toEqual(["d1-fin", "d2-fin", "d3-fin", "d4-fin", "d5-fin"]);
    }
  });

  it("always has at least 1 spy and 2 innocents among the regular slots", () => {
    for (const lineup of lineups) {
      for (const day of lineup) {
        const truths = day.slice(0, 4).map((id) => caseById(content, id)!.truth);
        expect(truths.filter((t) => t === "spy").length).toBeGreaterThanOrEqual(1);
        expect(truths.filter((t) => t === "innocent").length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("substitutes a rare case on about 35% of days", () => {
    const days = lineups.flat();
    const rate = days.filter((day) => day.some((id) => id.endsWith("-rare"))).length / days.length;
    expect(rate).toBeGreaterThan(0.32);
    expect(rate).toBeLessThan(0.38);
  });

  it("is reproduced by its seed and varies between seeds", () => {
    expect(createRun(123, content).lineup).toEqual(createRun(123, content).lineup);
    expect(new Set(lineups.slice(0, 50).map((l) => l[1].join())).size).toBeGreaterThan(10);
  });
});

describe("review", () => {
  it("shows the chosen outcome, the truth and which clues were found", () => {
    const { content, state } = run(1);
    let s = reduce(state, { type: "openDocument", docId: "badge" }, content);
    s = reduce(s, { type: "decide", verdict: "reject" }, content);
    const view = reviewView(s, content)!;
    expect(view.decision).toMatchObject({ caseId: "d1-r0", verdict: "reject", truth: "innocent", correct: false });
    expect(view.outcome.text).toBe("Rejected d1-r0");
    expect(view.explanation).toBe("Ada is fine.");
    expect(view.hiddenTruth).toBe("Truth of d1-r0");
    expect(view.cluesFound).toEqual(["doc:badge"]);
    expect(view.cluesMissed).toEqual(["d:badge-match", "q:why"]);
    expect(s.events.at(-1)).toMatchObject({ type: "decided", investigated: 1 });
  });

  it("moves to the next case, then to the day summary", () => {
    const content = makeContent();
    const s = play(createRun(3, content), content, perfect, (x) => x.phase.kind === "dayEnd");
    expect(s.stats.day).toBe(1);
    expect(daySummary(s)).toMatchObject({ day: 1, correct: 5 });
    expect(s.stats.casesSeen).toBe(5);
    const next = reduce(s, advance, content);
    expect(next.phase.kind).toBe("briefing");
    expect(next.stats.day).toBe(2);
  });
});

describe("serialization", () => {
  it("a JSON round trip mid-run continues identically", () => {
    const content = makeContent();
    const actions: Action[] = [
      { type: "openDocument", docId: "badge" },
      { type: "askQuestion", questionId: "why" },
      { type: "scan" },
      { type: "search", query: "rocm" },
    ];
    let s = run(77, content).state;
    for (const a of actions) s = reduce(s, a, content);
    const restored: GameState = JSON.parse(JSON.stringify(s));
    expect(restored).toEqual(s);

    const finish = (x: GameState) => play(x, content, perfect);
    const a = finish(s);
    const b = finish(restored);
    expect(b).toEqual(a);
    expect(b.stats.outcome).toBe("victory");
    expect(currentCase(restored, content)?.id).toBe("d1-r0");
  });
});
