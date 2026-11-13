import { describe, expect, it } from "vitest";
import { currentCase, notebook, revealedFacts } from "../game/engine";
import type { Verdict } from "../game/types";
import { CONTENT, refKey } from "./content";
import { INITIAL, uiReducer, type UiAction, type UiState } from "./state";

const run = (s: UiState, ...actions: UiAction[]) => actions.reduce(uiReducer, s);

function playOut(s: UiState, verdict: Verdict): UiState {
  for (let i = 0; i < 200 && s.run!.phase.kind !== "ended"; i++) {
    s = uiReducer(s, s.run!.phase.kind === "case" ? { type: "engine", action: { type: "decide", verdict } } : { type: "engine", action: { type: "advance" } });
  }
  return s;
}

describe("ui reducer on real content", () => {
  it("compares two revealed facts into the readout and notebook", () => {
    let s = run(INITIAL, { type: "newRun", seed: 7 }, { type: "engine", action: { type: "advance" } });
    const c = currentCase(s.run!, CONTENT)!;
    for (const d of c.documents) s = uiReducer(s, { type: "openDoc", id: d.id, x: 0, y: 0, rot: 0 });
    expect(s.openDocs.map((d) => d.id)).toEqual(c.documents.map((d) => d.id));

    const revealed = new Map(revealedFacts(s.run!, CONTENT).map((f) => [f.fact.id, f.ref]));
    const target = c.discrepancies.find((d) => revealed.has(d.facts[0]) && revealed.has(d.facts[1]))!;
    s = run(s, { type: "select", ref: revealed.get(target.facts[0])! }, { type: "select", ref: revealed.get(target.facts[1])! });
    expect(s.selection.map(refKey)).toEqual([refKey(revealed.get(target.facts[0])!), refKey(revealed.get(target.facts[1])!)]);

    s = uiReducer(s, { type: "compare" });
    expect(s.readout?.kind).toBe(target.kind);
    expect(s.readout?.text).toBe(target.note);
    expect(notebook(s.run!, CONTENT).map((d) => d.id)).toEqual([target.id]);
    expect(s.selection).toEqual([]);

    s = run(s, { type: "select", ref: revealed.get(target.facts[1])! }, { type: "select", ref: revealed.get(target.facts[0])! }, { type: "compare" });
    expect(s.readout?.kind).toBe("repeat");
  });

  it("a third selected fact replaces the oldest, and clicking a selected fact clears it", () => {
    let s = run(INITIAL, { type: "newRun", seed: 3 }, { type: "engine", action: { type: "advance" } });
    const [a, b, c] = currentCase(s.run!, CONTENT)!.claims.map((f) => ({ owner: currentCase(s.run!, CONTENT)!.id, id: f.id }));
    s = run(s, { type: "select", ref: a }, { type: "select", ref: b }, { type: "select", ref: c });
    expect(s.selection).toEqual([b, c]);
    s = uiReducer(s, { type: "select", ref: b });
    expect(s.selection).toEqual([c]);
  });

  it("rejecting everyone ends romantically bankrupt and records the run in the profile", () => {
    const s = playOut(run(INITIAL, { type: "newRun", seed: 11 }), "reject");
    expect(s.run!.stats.outcome).toBe("romantically-bankrupt");
    expect(s.profile.runsPlayed).toBe(1);
    expect(s.profile.timesBankrupt).toBe(1);
    expect(s.unlockedThisRun).toContain("the-incel-protocol");
    expect(s.profile.unlocked["the-incel-protocol"]).toBeDefined();
  });

  it("accepting everyone ends honeypotted with the spy named", () => {
    const s = playOut(run(INITIAL, { type: "newRun", seed: 5 }), "accept");
    expect(s.run!.stats.outcome).toBe("honeypotted");
    expect(s.run!.stats.fatalSpyName).toBeTruthy();
    expect(s.unlockedThisRun).toContain("you-got-honeypotted");
    expect(s.profile.timesHoneypotted).toBe(1);
  });

  it("stamp spam on the title screen lands in the profile without a run", () => {
    const s = uiReducer(INITIAL, { type: "uiEgg", name: "stamp-spam" });
    expect(s.run).toBeNull();
    expect(s.profile.eggsFound).toEqual(["ui-stamp-spam"]);
    expect(Object.keys(s.profile.unlocked)).toContain("stamp-enjoyer");
    expect(s.toasts.map((t) => t.kind)).toEqual(["egg", "achievement"]);
  });

  it("three scan presses with no charges fire the scan-empty egg", () => {
    let s = run(INITIAL, { type: "newRun", seed: 9 }, { type: "engine", action: { type: "advance" } });
    s = { ...s, run: { ...s.run!, scansLeft: 0 } };
    s = run(s, { type: "scanPress" }, { type: "scanPress" }, { type: "scanPress" });
    expect(s.run!.stats.eggsFound).toContain("ui-scan-empty");
  });
});
