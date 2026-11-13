import { describe, expect, it } from "vitest";
import type { DayNumber, DecisionRecord, GameEvent, PlayerProfile, RunOutcome, RunStats } from "../types";
import { ACHIEVEMENTS } from "./achievements";
import { GLOBAL_EGGS } from "./globalEggs";
import { GLOBAL_RECORDS } from "./globalRecords";
import { DISCLAIMER, HEADLINES, dayEndLines, pickHeadline } from "./headlines";
import { JENSEN_LINES, jensenLine, type JensenSituation } from "./jensen";
import { RANKS, pickRank, vulnerabilityLine } from "./ranks";
import { TEMPLATE_VARIABLES, templateVariablesIn } from "./templateVars";

function decision(overrides: Partial<DecisionRecord> = {}): DecisionRecord {
  return {
    caseId: "case",
    applicantName: "Applicant",
    day: 1,
    verdict: "accept",
    truth: "innocent",
    correct: true,
    marketCapDelta: 0,
    stabilityDelta: 0,
    ...overrides,
  };
}

function stats(overrides: Partial<RunStats> = {}): RunStats {
  return {
    seed: 0,
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
    marketCap: 5000,
    startingMarketCap: 5000,
    romanticStability: 100,
    decisions: [],
    outcome: "in-progress",
    ...overrides,
  };
}

function profile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    runsPlayed: 0,
    victories: 0,
    timesHoneypotted: 0,
    timesBankrupt: 0,
    totalSpiesCaught: 0,
    eggsFound: [],
    unlocked: {},
    ...overrides,
  };
}

function unlocked(event: GameEvent, s: RunStats, p: PlayerProfile = profile()): string[] {
  return ACHIEVEMENTS.filter((a) => a.condition({ event, stats: s, profile: p }))
    .map((a) => a.id)
    .sort();
}

const ended = (outcome: RunOutcome): GameEvent => ({ type: "runEnded", outcome });

const spyAccept = (day: DayNumber, name = "Spy") =>
  decision({ day, verdict: "accept", truth: "spy", correct: false, applicantName: name });
const innocentReject = (day: DayNumber) => decision({ day, verdict: "reject", truth: "innocent", correct: false });
const spyReject = (day: DayNumber, name = "Spy") =>
  decision({ day, verdict: "reject", truth: "spy", correct: true, applicantName: name });

describe("ids", () => {
  it("are unique across achievements, ranks, eggs and records", () => {
    const ids = [...ACHIEVEMENTS, ...RANKS, ...GLOBAL_EGGS, ...GLOBAL_RECORDS].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("global record facts are unique, start with g.w. and are non-empty", () => {
    const facts = GLOBAL_RECORDS.flatMap((r) => r.facts);
    expect(GLOBAL_RECORDS.length).toBeGreaterThanOrEqual(24);
    expect(new Set(facts.map((f) => f.id)).size).toBe(facts.length);
    for (const f of facts) {
      expect(f.id.startsWith("g.w."), f.id).toBe(true);
      expect(f.label.trim() && f.value.trim(), f.id).toBeTruthy();
    }
    for (const r of GLOBAL_RECORDS) {
      for (const k of r.keywords) expect(k, r.id).toBe(k.toLowerCase());
    }
  });
});

describe("share templates", () => {
  const longestRank = RANKS.map((r) => r.title).reduce((a, b) => (b.length > a.length ? b : a));
  const worstCase = (title: string, memePhrase: string): Record<string, string> => ({
    achievementTitle: title,
    memePhrase,
    marketCapLost: "$4.9T",
    marketCapPreserved: "$4.9T",
    marketCap: "$4.9T",
    correctDecisions: "99",
    wrongRejections: "99",
    spiesCaught: "99",
    dayReached: "5",
    spyName: "X".repeat(28),
    playerRank: longestRank,
    gameUrl: "u".repeat(23),
    launchTweetUrl: "u".repeat(23),
    launchTweetUrlOrGameUrl: "u".repeat(23),
  });

  it("every achievement has 2-4 templates that end with the link on its own line and fit a post", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30);
    for (const a of ACHIEVEMENTS) {
      expect(a.shareTemplates.length, a.id).toBeGreaterThanOrEqual(2);
      expect(a.shareTemplates.length, a.id).toBeLessThanOrEqual(4);
      const values = worstCase(a.title, a.memePhrase);
      for (const t of a.shareTemplates) {
        expect(t.endsWith("\n{launchTweetUrlOrGameUrl}"), `${a.id}: ${t}`).toBe(true);
        for (const v of templateVariablesIn(t)) expect(TEMPLATE_VARIABLES, `${a.id} uses {${v}}`).toContain(v);
        const filled = t.replace(/\{([A-Za-z]+)\}/g, (_, v: string) => values[v]);
        expect(filled.length, `${a.id}: ${filled}`).toBeLessThanOrEqual(250);
      }
    }
  });

  it("{spyName} only appears on achievements that cannot unlock without a fatal spy", () => {
    const spyAchievements = ACHIEVEMENTS.filter((a) => a.shareTemplates.some((t) => t.includes("{spyName}")));
    const events: GameEvent[] = [
      ended("honeypotted"),
      ended("victory"),
      ended("romantically-bankrupt"),
      { type: "decided", decision: spyAccept(1), investigated: 0 },
      { type: "decided", decision: spyAccept(5), investigated: 9 },
      { type: "dayCompleted", day: 5 },
      { type: "eggFound", eggId: "rocm-heresy" },
    ];
    const statsWithoutSpy = [1, 2, 5].flatMap((day) =>
      (["honeypotted", "victory", "romantically-bankrupt"] as const).map((outcome) =>
        stats({ day: day as DayNumber, outcome, decisions: [spyAccept(day as DayNumber)], marketCap: 3000 }),
      ),
    );
    expect(spyAchievements.map((a) => a.id)).toContain("you-got-honeypotted");
    for (const a of spyAchievements) {
      for (const event of events) {
        for (const s of statsWithoutSpy) {
          expect(a.condition({ event, stats: s, profile: profile({ timesHoneypotted: 5 }) }), a.id).toBe(false);
        }
      }
    }
  });

  it("spreads card styles and rarities across the full range", () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.cardStyle))).toEqual(
      new Set(["security-report", "tabloid", "classified", "board-memo", "propaganda"]),
    );
    expect(new Set(ACHIEVEMENTS.map((a) => a.rarity))).toEqual(new Set(["common", "rare", "epic", "legendary", "cursed"]));
    expect(ACHIEVEMENTS.filter((a) => a.secret).length).toBeGreaterThanOrEqual(4);
  });
});

describe("required achievements", () => {
  it("include every named title", () => {
    const titles = ACHIEVEMENTS.map((a) => a.title);
    for (const t of [
      "YOU GOT HONEYPOTTED",
      "THE UNHONEYPOTABLE",
      "TRILLION DOLLAR SIMP",
      "CUDA OR NOTHING",
      "THE INCEL PROTOCOL",
      "LEATHER JACKET SUPREMACY",
      "I CAN FIX HER DRIVERS",
      "ROMANTIC INTELLIGENCE FAILURE",
      "MARKET CAP: IT'S COMPLICATED",
      "PRESERVED THE MOAT",
    ]) {
      expect(titles).toContain(t);
    }
  });

  it("every case egg and global egg unlocks exactly one achievement when found", () => {
    const caseEggs = [
      "keynote-savant",
      "gpu-in-a-wig",
      "three-gpus-trenchcoat",
      "cuda-eula",
      "rocm-heresy",
      "doom-doc",
      "h100-wedding",
      "jacket-memo",
      "sentient-jacket",
      "export-waiver",
    ];
    for (const eggId of [...caseEggs, ...GLOBAL_EGGS.map((e) => e.id)]) {
      expect(unlocked({ type: "eggFound", eggId }, stats({ eggsFound: [eggId] })), eggId).toHaveLength(1);
    }
    expect(unlocked({ type: "eggFound", eggId: "rocm-heresy" }, stats({ eggsFound: ["rocm-heresy"] }))).toEqual(["cuda-or-nothing"]);
    expect(unlocked({ type: "eggFound", eggId: "ui-jacket-clicks" }, stats())).toEqual(["leather-jacket-supremacy"]);
    expect(unlocked({ type: "eggFound", eggId: "not-an-egg" }, stats())).toEqual([]);
  });
});

describe("achievement conditions", () => {
  it("honeypotted by the first applicant on Day 1", () => {
    const s = stats({
      day: 1,
      outcome: "honeypotted",
      decisions: [spyAccept(1, "Mara Quell")],
      spiesAccepted: 1,
      fatalSpyName: "Mara Quell",
      marketCap: 4100,
    });
    expect(unlocked(ended("honeypotted"), s)).toEqual([
      "first-date-last-day",
      "romantic-intelligence-failure",
      "you-got-honeypotted",
    ]);
  });

  it("a perfect first-run victory with no scans", () => {
    const s = stats({
      day: 5,
      outcome: "victory",
      spiesCaught: 9,
      innocentsRejected: 0,
      scansUsed: 0,
      discrepanciesFound: 12,
      marketCap: 5200,
      romanticStability: 100,
    });
    expect(unlocked(ended("victory"), s)).toEqual([
      "emotionally-overclocked",
      "first-try-no-notes",
      "made-it-to-friday",
      "no-scan-no-problem",
      "preserved-the-moat",
      "survived-gtc",
      "tensor-core-paranoia",
      "the-unhoneypotable",
    ]);
  });

  it("rejecting everyone until bankrupt is THE INCEL PROTOCOL, not the simp", () => {
    const s = stats({
      day: 2,
      outcome: "romantically-bankrupt",
      romanticStability: 0,
      innocentsRejected: 4,
      spiesCaught: 2,
      decisions: [innocentReject(1), spyReject(1), innocentReject(1), innocentReject(2), spyReject(2), innocentReject(2)],
    });
    expect(unlocked(ended("romantically-bankrupt"), s, profile({ runsPlayed: 3 }))).toEqual([
      "alone-with-the-jacket",
      "the-incel-protocol",
    ]);
  });

  it("accepting everyone until Vera Kessling, for the third time, with a trillion lost", () => {
    const s = stats({
      day: 2,
      outcome: "honeypotted",
      decisions: [decision(), decision(), decision({ day: 2 }), spyAccept(2, "Vera Kessling")],
      fatalSpyName: "Vera Kessling",
      marketCap: 3700,
    });
    expect(unlocked(ended("honeypotted"), s, profile({ timesHoneypotted: 2, runsPlayed: 4 }))).toEqual([
      "honeypot-loyalty-gold",
      "market-cap-its-complicated",
      "the-magnolia-incident",
      "trillion-dollar-simp",
      "you-got-honeypotted",
    ]);
  });

  it("decisions: zero investigation, deep investigation then accepting a spy", () => {
    expect(unlocked({ type: "decided", decision: spyAccept(3), investigated: 0 }, stats({ day: 3 }))).toEqual([
      "vibes-based-security",
    ]);
    expect(unlocked({ type: "decided", decision: spyAccept(3), investigated: 7 }, stats({ day: 3 }))).toEqual([
      "i-can-fix-her-drivers",
    ]);
    expect(
      unlocked({ type: "decided", decision: innocentReject(1), investigated: 3 }, stats({ decisions: [innocentReject(1)] })),
    ).toEqual(["trust-issues"]);
  });

  it("rejecting Vera Kessling as the third spy of the day", () => {
    const vera = spyReject(2, "Vera Kessling");
    const s = stats({ day: 2, spiesCaught: 3, decisions: [spyReject(1), spyReject(2), decision({ day: 2 }), spyReject(2), vera] });
    expect(unlocked({ type: "decided", decision: vera, investigated: 5 }, s)).toEqual([
      "counter-honeypot",
      "magnolia-denied",
      "three-spies-before-lunch",
    ]);
  });

  it("lifetime egg milestones count distinct eggs across profile and run", () => {
    const p = profile({ eggsFound: ["doom-doc", "search-amd", "search-doom", "ui-idle"] });
    expect(unlocked({ type: "eggFound", eggId: "ui-konami" }, stats({ eggsFound: ["ui-konami", "doom-doc"] }), p)).toEqual([
      "secrets-of-endeavor",
      "up-up-down-down-due-diligence",
    ]);
  });
});

describe("ranks", () => {
  it("pickRank is total over a grid of plausible stats", () => {
    const outcomes: RunOutcome[] = ["in-progress", "honeypotted", "romantically-bankrupt", "victory"];
    const histories = [[], [spyAccept(1)], [decision(), decision(), spyAccept(1)], [innocentReject(1), spyReject(1)]];
    const rankIds = RANKS.map((r) => r.id);
    for (const outcome of outcomes)
      for (const day of [1, 2, 3, 4, 5] as DayNumber[])
        for (const decisions of histories)
          for (const innocentsRejected of [0, 2, 6])
            for (const marketCap of [6000, 5000, 3500, 0]) {
              const rank = pickRank(stats({ outcome, day, decisions, innocentsRejected, marketCap }));
              expect(rankIds).toContain(rank.id);
            }
  });

  it("every rank is reachable", () => {
    const honeypottedMid = [decision(), innocentReject(1), decision({ day: 3 }), spyAccept(3)];
    const cases: [Partial<RunStats>, string][] = [
      [{ outcome: "honeypotted", day: 2, decisions: [decision(), decision(), spyAccept(2)] }, "rank-trillion-dollar-simp"],
      [{ outcome: "honeypotted", day: 1, decisions: [innocentReject(1), spyAccept(1)] }, "rank-chief-vulnerability-officer"],
      [{ outcome: "honeypotted", day: 3, decisions: honeypottedMid, marketCap: 3800 }, "rank-board-level-disaster"],
      [{ outcome: "honeypotted", day: 4, decisions: honeypottedMid, marketCap: 4600 }, "rank-mildly-compromised"],
      [{ outcome: "honeypotted", day: 3, decisions: honeypottedMid, marketCap: 4600 }, "rank-asset-in-training"],
      [{ outcome: "victory", day: 5, innocentsRejected: 0 }, "rank-the-unhoneypotable"],
      [{ outcome: "victory", day: 5, innocentsRejected: 5 }, "rank-paranoid-but-profitable"],
      [{ outcome: "victory", day: 5, innocentsRejected: 2 }, "rank-romantically-secure"],
      [{ outcome: "romantically-bankrupt", day: 2, decisions: [innocentReject(1), spyReject(1)] }, "rank-romantic-firewall-misconfigured"],
      [{ outcome: "romantically-bankrupt", day: 3, decisions: [decision(), innocentReject(3)] }, "rank-emotionally-insolvent"],
      [{ outcome: "in-progress" }, "rank-under-review"],
    ];
    const reached = cases.map(([overrides, expected]) => {
      expect(pickRank(stats(overrides)).id).toBe(expected);
      return expected;
    });
    expect(new Set(reached)).toEqual(new Set(RANKS.map((r) => r.id)));
    expect(RANKS.map((r) => r.title)).toEqual(
      expect.arrayContaining([
        "Romantically Secure",
        "Mildly Compromised",
        "Board-Level Disaster",
        "Chief Vulnerability Officer",
        "The Unhoneypotable",
        "Trillion Dollar Simp",
      ]),
    );
  });

  it("vulnerabilityLine is a deterministic, labelled-fictional percentile", () => {
    const s = stats({
      seed: 0,
      outcome: "honeypotted",
      spiesAccepted: 1,
      spiesCaught: 2,
      discrepanciesFound: 4,
      scansUsed: 1,
      decisions: [innocentReject(1), spyAccept(1)],
    });
    expect(vulnerabilityLine(s)).toBe(
      "You are more vulnerable to espionage than 79% of NVIDIA executives. (Figure invented by the Board. Not a real statistic.)",
    );
    expect(vulnerabilityLine(stats({ seed: 8, outcome: "victory", spiesCaught: 20 }))).toBe(
      "You are more vulnerable to espionage than 1% of GTC 2027 attendees. (Fictional percentile. Do not cite it in an earnings call.)",
    );
  });
});

describe("jensen", () => {
  const situations = Object.keys(JENSEN_LINES) as JensenSituation[];

  it("covers every situation with at least 5 distinct lines per paranoia tier", () => {
    expect(situations).toHaveLength(12);
    for (const s of situations) {
      for (const tier of JENSEN_LINES[s]) {
        expect(tier.length, s).toBeGreaterThanOrEqual(5);
        expect(new Set(tier).size, s).toBe(tier.length);
      }
    }
  });

  it("jensenLine returns a non-empty line for every situation and day, escalating by tier", () => {
    for (const s of situations)
      for (const day of [1, 2, 3, 4, 5] as DayNumber[])
        for (const r of [0, 0.5, 0.999999, 1, -1, Number.NaN]) {
          expect(jensenLine(s, day, r).trim().length, `${s} day ${day} rng ${r}`).toBeGreaterThan(0);
        }
    expect(jensenLine("scanEmpty", 1, 0)).toBe("No scan charges left. Use your eyes. They're free.");
    expect(jensenLine("scanEmpty", 2, 0)).toBe("No scan charges left. Use your eyes. They're free.");
    expect(jensenLine("scanEmpty", 3, 0)).toBe("No scans left. I'm going to stare at her really hard. That's basically a scan.");
    expect(jensenLine("scanEmpty", 5, 0.999)).toBe("The scanner has nothing left to give. Same, honestly.");
  });
});

describe("headlines", () => {
  it("each outcome has at least 8 headlines using only known variables", () => {
    for (const pool of Object.values(HEADLINES)) {
      expect(pool.length).toBeGreaterThanOrEqual(8);
      for (const h of pool) {
        for (const v of templateVariablesIn(`${h.headline} ${h.subhead}`)) expect(TEMPLATE_VARIABLES).toContain(v);
      }
    }
  });

  it("pickHeadline never picks a {spyName} headline when no spy ended the run", () => {
    const noSpy = stats({ outcome: "honeypotted" });
    for (let i = 0; i < 100; i++) {
      const h = pickHeadline("honeypotted", noSpy, i / 100);
      expect(`${h.headline} ${h.subhead}`).not.toContain("{spyName}");
    }
    const withSpy = stats({ outcome: "honeypotted", fatalSpyName: "Vera Kessling" });
    const seen = new Set(Array.from({ length: 100 }, (_, i) => pickHeadline("honeypotted", withSpy, i / 100).headline));
    expect(seen).toContain("{spyName} WALKS OUT WITH THE MOAT");
  });

  it("pickHeadline is deterministic in rng01", () => {
    expect(pickHeadline("victory", stats({ outcome: "victory" }), 0)).toEqual({
      headline: "THE UNHONEYPOTABLE",
      subhead: "CEO survives GTC week. {spiesCaught} spies denied at the lobby desk.",
      boardStatement: "The Board wishes to reassure shareholders that the romantic perimeter remains a core competency.",
    });
  });

  it("has day-end lines for every day and a parody disclaimer", () => {
    for (const day of [1, 2, 3, 4, 5] as DayNumber[]) expect(dayEndLines[day].length).toBeGreaterThan(0);
    expect(DISCLAIMER).toMatch(/parody/);
    expect(DISCLAIMER).toMatch(/not affiliated with/);
  });
});

describe("global eggs", () => {
  it("has at least 8 eggs with valid triggers", () => {
    const uiTriggers = ["ui:jacket-clicks", "ui:konami", "ui:idle", "ui:scan-empty", "ui:stamp-spam"];
    expect(GLOBAL_EGGS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(GLOBAL_EGGS.map((e) => e.on)).size).toBe(GLOBAL_EGGS.length);
    for (const e of GLOBAL_EGGS) {
      const ok = e.on.startsWith("search:") ? e.on === e.on.toLowerCase() : uiTriggers.includes(e.on);
      expect(ok, e.on).toBe(true);
    }
  });

  it("every search egg term also finds a global record", () => {
    for (const e of GLOBAL_EGGS.filter((g) => g.on.startsWith("search:"))) {
      const term = e.on.slice("search:".length);
      const hit = GLOBAL_RECORDS.some((r) => r.title.toLowerCase().includes(term) || r.keywords.some((k) => k.includes(term)));
      expect(hit, term).toBe(true);
    }
  });
});
