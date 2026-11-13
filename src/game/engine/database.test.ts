import { describe, expect, it } from "vitest";
import { makeContent, perfect, play } from "./fixture";
import { createRun, reduce, revealedFacts, searchDatabase, type GameState } from "./index";

const content = makeContent();
const day1 = reduce(createRun(1, content), { type: "advance" }, content);
const day2 = play(day1, content, perfect, (s) => s.stats.day === 2 && s.phase.kind === "case");
const ids = (s: GameState, q: string) => searchDatabase(s, content, q).map((h) => `${h.owner}:${h.record.id}`);

describe("database search", () => {
  it("an empty query lists the directives in force, newest day first", () => {
    expect(ids(day1, "")).toEqual(["global:dir-1"]);
    expect(ids(day2, "   ")).toEqual(["global:dir-2", "global:dir-1"]);
  });

  it("returns nothing for a one-character query", () => {
    expect(ids(day1, "a")).toEqual([]);
    expect(ids(day1, "ad")).toEqual(["d1-r0:rec-ada"]);
  });

  it("requires every term, case-insensitively, across title, keywords, category and fact values", () => {
    expect(ids(day1, "ADA quill")).toEqual(["d1-r0:rec-ada"]);
    expect(ids(day1, "ada meridian")).toEqual([]);
    expect(ids(day1, "nv-12345")).toEqual(["d1-r0:rec-ada"]);
    expect(ids(day1, "watchlist")).toEqual(["global:glob-meridian"]);
    expect(ids(day1, "lumen")).toEqual(["global:glob-meridian"]);
  });

  it("covers today's whole pool, including cases outside the lineup, and nothing from other days", () => {
    expect(ids(day1, "d1-rare")).toEqual(["d1-rare:rec-d1-rare"]);
    expect(ids(day1, "d1-r5")).toEqual(["d1-r5:rec-d1-r5"]);
    expect(ids(day1, "d2-r1")).toEqual([]);
    expect(ids(day2, "d1-r5")).toEqual([]);
    expect(ids(day2, "d2-r1")).toEqual(["d2-r1:rec-d2-r1"]);
  });

  it("scopes directives to the days already reached", () => {
    expect(ids(day1, "rule2")).toEqual([]);
    expect(ids(day2, "rule2")).toEqual(["global:dir-2"]);
    expect(ids(day2, "rule1")).toEqual(["global:dir-1"]);
  });

  it("logs searches and record views as events and grants the record token", () => {
    let s = reduce(day1, { type: "search", query: "ada" }, content);
    expect(s.events.at(-1)).toEqual({ type: "dbSearched", query: "ada", hits: 1 });
    s = reduce(s, { type: "viewRecord", recordId: "rec-ada" }, content);
    expect(s.events.at(-1)).toEqual({ type: "recordViewed", recordId: "rec-ada" });
    expect(s.stats.recordsViewed).toBe(1);
    expect(revealedFacts(s, content).filter((f) => f.from.kind === "record" && f.ref.owner !== "global").map((f) => f.ref.id)).toEqual([
      "rec.badge",
      "rec.name",
    ]);
    expect(reduce(s, { type: "viewRecord", recordId: "rec-ada" }, content)).toBe(s);
    expect(reduce(s, { type: "viewRecord", recordId: "rec-d2-r1" }, content)).toBe(s);
  });
});
