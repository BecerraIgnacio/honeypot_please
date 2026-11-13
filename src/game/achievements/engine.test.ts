import { describe, expect, it } from "vitest";
import { makeContent, perfect, play } from "../engine/fixture";
import { createRun } from "../engine";
import type { Achievement, PlayerProfile } from "../types";
import { applyRunToProfile, evaluateAchievements } from "./engine";

const achievement = (id: string, condition: Achievement["condition"]): Achievement => ({
  id,
  title: id,
  description: id,
  rarity: "common",
  flavor: "",
  memePhrase: "",
  shareTemplates: [],
  cardStyle: "security-report",
  condition,
});

const profile: PlayerProfile = {
  runsPlayed: 2,
  victories: 1,
  timesHoneypotted: 1,
  timesBankrupt: 0,
  totalSpiesCaught: 4,
  eggsFound: ["egg-old"],
  unlocked: { old: { at: 10 } },
};

const content = makeContent();
const won = play(createRun(4, content), content, perfect).stats;

describe("evaluateAchievements", () => {
  const list = [
    achievement("winner", ({ stats }) => stats.outcome === "victory"),
    achievement("loser", ({ stats }) => stats.outcome === "honeypotted"),
    achievement("broken", () => {
      throw new Error("bad condition");
    }),
    achievement("old", () => true),
    achievement("on-end", ({ event }) => event.type === "runEnded"),
  ];

  it("returns newly satisfied ids, skipping unlocked ones and throwing conditions", () => {
    const ctx = { event: { type: "runEnded", outcome: "victory" } as const, stats: won, profile };
    expect(evaluateAchievements(list, ctx)).toEqual(["winner", "on-end"]);
    expect(evaluateAchievements(list, ctx, ["winner"])).toEqual(["on-end"]);
  });
});

describe("applyRunToProfile", () => {
  it("adds the run's counters and stamps new unlocks", () => {
    const next = applyRunToProfile(profile, { ...won, spiesCaught: 9, eggsFound: ["egg-old", "egg-new"] }, ["winner", "old"], 99);
    expect(next).toEqual({
      runsPlayed: 3,
      victories: 2,
      timesHoneypotted: 1,
      timesBankrupt: 0,
      totalSpiesCaught: 13,
      eggsFound: ["egg-old", "egg-new"],
      unlocked: { old: { at: 10 }, winner: { at: 99 } },
    });
  });
});
