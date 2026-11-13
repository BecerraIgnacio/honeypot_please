import { describe, expect, it } from "vitest";
import type { Achievement, Rank, RunOutcome, RunStats } from "../game/types";
import {
  FALLBACK_TEMPLATES,
  buildShareVars,
  eligibleTemplates,
  fitsX,
  formatMoney,
  pickShareText,
  renderTemplate,
  shareTextOptions,
  xLength,
  type ShareVars,
} from "./text";

const GAME = "https://honeypot.example";
const TWEET = "https://x.com/someone/status/1234567890";

function stats(overrides: Partial<RunStats> = {}): RunStats {
  return {
    seed: 1,
    day: 3,
    casesSeen: 9,
    spiesCaught: 2,
    spiesAccepted: 1,
    innocentsAccepted: 4,
    innocentsRejected: 2,
    questionsAsked: 12,
    discrepanciesFound: 5,
    scansUsed: 1,
    recordsViewed: 3,
    eggsFound: [],
    marketCap: 4160,
    startingMarketCap: 5000,
    romanticStability: 40,
    decisions: [
      { caseId: "a", applicantName: "A", day: 1, verdict: "reject", truth: "spy", correct: true, marketCapDelta: 0, stabilityDelta: 0 },
      { caseId: "b", applicantName: "B", day: 1, verdict: "accept", truth: "innocent", correct: true, marketCapDelta: 0, stabilityDelta: 0 },
      { caseId: "c", applicantName: "C", day: 2, verdict: "reject", truth: "innocent", correct: false, marketCapDelta: 0, stabilityDelta: -20 },
    ],
    outcome: "honeypotted",
    fatalSpyName: "Vera Kessling",
    ...overrides,
  };
}

const rank: Rank = { id: "intern", title: "Lobby Intern", blurb: "" };
const achievement = {
  id: "honeypotted",
  title: "HONEYPOTTED",
  memePhrase: "If she's a 10, you're an asset.",
} as Achievement;

function worstVars(overrides: Partial<ShareVars> = {}): ShareVars {
  return {
    achievementTitle: "A".repeat(60),
    memePhrase: "M".repeat(90),
    marketCapLost: "$999B",
    marketCapPreserved: "$999B",
    marketCap: "$999B",
    correctDecisions: "999",
    wrongRejections: "999",
    spiesCaught: "999",
    dayReached: "5",
    spyName: "Maximiliana Wolkenstein-Okonkwo-Brightwater",
    playerRank: "Deputy Assistant Vice President of Romantic Perimeter Integrity",
    gameUrl: "https://a-very-long-subdomain.honeypot-please-the-game.vercel.app/play",
    launchTweetUrl: "https://x.com/somebody_with_a_long_handle/status/18000000000000000000",
    launchTweetUrlOrGameUrl: "https://x.com/somebody_with_a_long_handle/status/18000000000000000000",
    ...overrides,
  };
}

describe("formatMoney", () => {
  it.each([
    [840, "$840B"],
    [1200, "$1.2T"],
    [5000, "$5T"],
    [4160, "$4.2T"],
    [1.5, "$1.5B"],
    [0.4, "$400M"],
    [0, "$0B"],
    [-840, "-$840B"],
    [999.6, "$1T"],
    [9.96, "$10B"],
  ])("%d billions -> %s", (billions, expected) => {
    expect(formatMoney(billions)).toBe(expected);
  });
});

describe("buildShareVars", () => {
  it("derives every variable from the run", () => {
    expect(buildShareVars(stats(), rank, achievement, { gameUrl: GAME })).toEqual({
      achievementTitle: "HONEYPOTTED",
      memePhrase: "If she's a 10, you're an asset.",
      marketCapLost: "$840B",
      marketCapPreserved: "$4.2T",
      marketCap: "$4.2T",
      correctDecisions: "2",
      wrongRejections: "2",
      spiesCaught: "2",
      dayReached: "3",
      spyName: "Vera Kessling",
      playerRank: "Lobby Intern",
      gameUrl: GAME,
      launchTweetUrl: undefined,
      launchTweetUrlOrGameUrl: GAME,
    });
  });

  it("prefers the launch tweet for launchTweetUrlOrGameUrl", () => {
    const vars = buildShareVars(stats(), rank, null, { gameUrl: GAME, launchTweetUrl: TWEET });
    expect(vars.launchTweetUrlOrGameUrl).toBe(TWEET);
    expect(vars.achievementTitle).toBeUndefined();
  });
});

describe("renderTemplate and eligibility", () => {
  const vars = buildShareVars(stats(), rank, achievement, { gameUrl: GAME });

  it("fills placeholders", () => {
    expect(renderTemplate("{achievementTitle} on Day {dayReached}: {marketCapLost} gone. {gameUrl}", vars)).toBe(
      "HONEYPOTTED on Day 3: $840B gone. https://honeypot.example",
    );
  });

  it("drops templates that need a launch tweet when none is configured", () => {
    const templates = ["Read the thread: {launchTweetUrl}", "Play: {launchTweetUrlOrGameUrl}"];
    expect(eligibleTemplates(templates, vars)).toEqual(["Play: {launchTweetUrlOrGameUrl}"]);
    const withTweet = buildShareVars(stats(), rank, achievement, { gameUrl: GAME, launchTweetUrl: TWEET });
    expect(eligibleTemplates(templates, withTweet)).toEqual(templates);
  });

  it("drops templates that need a spy when no spy ended the run", () => {
    const noSpy = buildShareVars(stats({ fatalSpyName: undefined, outcome: "victory" }), rank, null, { gameUrl: GAME });
    expect(eligibleTemplates(["{spyName} got me", "I won. {gameUrl}"], noSpy)).toEqual(["I won. {gameUrl}"]);
  });

  it("treats unknown placeholders as missing", () => {
    expect(eligibleTemplates(["{notAVariable} {gameUrl}"], vars)).toEqual([]);
  });
});

describe("xLength", () => {
  it("counts each URL as 23 regardless of its length", () => {
    expect(xLength("hi https://example.com")).toBe(3 + 23);
    expect(xLength(`a ${"https://x.com/" + "z".repeat(200)} b`)).toBe(4 + 23);
    expect(xLength("two https://a.io and http://b.io/c?d=e")).toBe("two  and ".length + 46);
  });

  it("excludes trailing punctuation from the URL", () => {
    expect(xLength("see https://a.io.")).toBe("see .".length + 23);
  });

  it("weighs emoji and CJK as 2", () => {
    expect(xLength("ok 🔥")).toBe(3 + 2);
    expect(xLength("日本")).toBe(4);
  });

  it("enforces 280", () => {
    expect(fitsX("a".repeat(280))).toBe(true);
    expect(fitsX("a".repeat(281))).toBe(false);
    expect(fitsX(`${"a".repeat(256)} https://example.com/${"x".repeat(100)}`)).toBe(true);
    expect(fitsX(`${"a".repeat(257)} https://example.com/${"x".repeat(100)}`)).toBe(false);
  });
});

describe("fallback templates", () => {
  const outcomes = Object.keys(FALLBACK_TEMPLATES) as RunOutcome[];

  it("has at least 4 variants for each run outcome", () => {
    for (const outcome of outcomes) expect(FALLBACK_TEMPLATES[outcome].length).toBeGreaterThanOrEqual(4);
  });

  it("fits 280 with worst-case values", () => {
    for (const outcome of outcomes) {
      for (const template of FALLBACK_TEMPLATES[outcome]) {
        const text = renderTemplate(template, worstVars());
        expect(xLength(text), text).toBeLessThanOrEqual(280);
      }
    }
  });

  it("leaves at least 4 usable variants for every outcome even without a spy or tweet", () => {
    const minimal = worstVars({ spyName: undefined, launchTweetUrl: undefined, launchTweetUrlOrGameUrl: GAME });
    for (const outcome of outcomes) {
      expect(shareTextOptions([], minimal, outcome).length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("pickShareText", () => {
  const vars = buildShareVars(stats(), rank, achievement, { gameUrl: GAME, launchTweetUrl: TWEET });
  const templates = [
    "{achievementTitle}. {memePhrase} {launchTweetUrlOrGameUrl}",
    "I let {spyName} in. {marketCapLost} gone. {launchTweetUrlOrGameUrl}",
    "Needs a missing var {nope}",
    `${"too long ".repeat(40)}{gameUrl}`,
  ];

  it("cycles through the eligible, fitting variants", () => {
    const texts = [0, 1, 2, 3].map((i) => pickShareText(templates, vars, i, "honeypotted"));
    expect(texts).toEqual([
      `HONEYPOTTED. If she's a 10, you're an asset. ${TWEET}`,
      `I let Vera Kessling in. $840B gone. ${TWEET}`,
      `HONEYPOTTED. If she's a 10, you're an asset. ${TWEET}`,
      `I let Vera Kessling in. $840B gone. ${TWEET}`,
    ]);
    expect(pickShareText(templates, vars, -1)).toBe(texts[1]);
  });

  it("falls back to the outcome's summary set and never leaves a placeholder", () => {
    for (const outcome of Object.keys(FALLBACK_TEMPLATES) as RunOutcome[]) {
      const seen = new Set<string>();
      for (let i = 0; i < 8; i++) {
        const text = pickShareText(["{nope}"], vars, i, outcome);
        expect(text).not.toMatch(/\{[A-Za-z]+\}/);
        expect(fitsX(text)).toBe(true);
        seen.add(text);
      }
      expect(seen.size).toBeGreaterThanOrEqual(4);
    }
  });

  it("contains the launch tweet when configured and the game URL otherwise", () => {
    const withTweet = pickShareText([], vars, 0, "victory");
    expect(withTweet).toContain(TWEET);
    const without = pickShareText([], buildShareVars(stats(), rank, null, { gameUrl: GAME }), 0, "victory");
    expect(without).toContain(GAME);
    expect(without).not.toContain("x.com");
  });

  it("still returns text when nothing at all is usable", () => {
    const empty = worstVars({ gameUrl: "", launchTweetUrl: undefined, launchTweetUrlOrGameUrl: "" });
    expect(pickShareText([], empty, 0, "victory")).toBe(
      "HONEYPOT, PLEASE. The world's most valuable man. The world's least reliable dating pool.",
    );
  });
});
