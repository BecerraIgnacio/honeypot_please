import type { Rank, RunStats } from "../types";

export const RANKS: Rank[] = [
  {
    id: "rank-trillion-dollar-simp",
    title: "Trillion Dollar Simp",
    blurb: "Accepted everyone. Everyone included a spy. The Board has commissioned a statue as a warning.",
  },
  {
    id: "rank-chief-vulnerability-officer",
    title: "Chief Vulnerability Officer",
    blurb: "Compromised so early the spies had to wait for the coffee machine to warm up.",
  },
  {
    id: "rank-board-level-disaster",
    title: "Board-Level Disaster",
    blurb: "Lost over a trillion dollars of shareholder value. The Board now meets hourly.",
  },
  {
    id: "rank-mildly-compromised",
    title: "Mildly Compromised",
    blurb: "Held the line most of the week. The roadmap only leaked a little. Like a nice tea.",
  },
  {
    id: "rank-asset-in-training",
    title: "Asset In Training",
    blurb: "If she's a 10, you're an asset. She was a 10.",
  },
  {
    id: "rank-the-unhoneypotable",
    title: "The Unhoneypotable",
    blurb: "No spy in. No innocent turned away. Dolores Vance has requested your blood type for cloning purposes.",
  },
  {
    id: "rank-paranoid-but-profitable",
    title: "Paranoid But Profitable",
    blurb: "The moat survived. A few innocent bystanders fell into it.",
  },
  {
    id: "rank-romantically-secure",
    title: "Romantically Secure",
    blurb: "Survived GTC week with the roadmap intact and only light emotional damage.",
  },
  {
    id: "rank-romantic-firewall-misconfigured",
    title: "Romantic Firewall, Misconfigured",
    blurb: "Default policy: DENY ALL. Nobody got in. Nobody was ever going to.",
  },
  {
    id: "rank-emotionally-insolvent",
    title: "Emotionally Insolvent",
    blurb: "Rejected so many real people that Romantic Stability filed for Chapter 11.",
  },
  {
    id: "rank-under-review",
    title: "Under Review",
    blurb: "Shift in progress. Dolores has not finished her report.",
  },
];

const allVerdicts = (s: RunStats, verdict: "accept" | "reject") =>
  s.decisions.length > 0 && s.decisions.every((d) => d.verdict === verdict);

const lostAtLeast = (s: RunStats, billions: number) => s.startingMarketCap - s.marketCap >= billions;

/** First match wins. The last row matches everything, so pickRank is total. */
const RANK_TABLE: [string, (s: RunStats) => boolean][] = [
  ["rank-trillion-dollar-simp", (s) => s.outcome === "honeypotted" && s.decisions.length >= 3 && allVerdicts(s, "accept")],
  ["rank-chief-vulnerability-officer", (s) => s.outcome === "honeypotted" && (s.day === 1 || s.decisions.length <= 2)],
  ["rank-board-level-disaster", (s) => s.outcome === "honeypotted" && lostAtLeast(s, 1000)],
  ["rank-mildly-compromised", (s) => s.outcome === "honeypotted" && s.day >= 4],
  ["rank-asset-in-training", (s) => s.outcome === "honeypotted"],
  ["rank-the-unhoneypotable", (s) => s.outcome === "victory" && s.innocentsRejected === 0],
  ["rank-paranoid-but-profitable", (s) => s.outcome === "victory" && s.innocentsRejected >= 4],
  ["rank-romantically-secure", (s) => s.outcome === "victory"],
  ["rank-romantic-firewall-misconfigured", (s) => s.outcome === "romantically-bankrupt" && allVerdicts(s, "reject")],
  ["rank-emotionally-insolvent", (s) => s.outcome === "romantically-bankrupt"],
  ["rank-under-review", () => true],
];

const RANK_BY_ID = new Map(RANKS.map((r) => [r.id, r]));

export function pickRank(stats: RunStats): Rank {
  const [id] = RANK_TABLE.find(([, matches]) => matches(stats))!;
  return RANK_BY_ID.get(id)!;
}

const POPULATIONS = [
  "NVIDIA executives",
  "GTC 2027 attendees",
  "members of the Board",
  "leather jackets in Santa Clara County",
  "people who have read a CUDA license agreement to the end",
  "lanyards currently in circulation",
  "Endeavor building houseplants",
];

const SOURCES = [
  "Figure invented by the Board. Not a real statistic.",
  "Source: a survey Dolores made up at 2 AM.",
  "Fictional percentile. Do not cite it in an earnings call.",
];

function vulnerabilityScore(stats: RunStats): number {
  const outcomeWeight = { honeypotted: 30, "romantically-bankrupt": -15, victory: -25, "in-progress": 0 }[stats.outcome];
  const simpBonus = allVerdicts(stats, "accept") ? 10 : 0;
  const raw =
    50 +
    outcomeWeight +
    simpBonus +
    8 * stats.spiesAccepted -
    3 * stats.spiesCaught -
    Math.floor(stats.discrepanciesFound / 2) -
    stats.scansUsed;
  return Math.max(1, Math.min(99, raw));
}

export function vulnerabilityLine(stats: RunStats): string {
  const pick = Math.abs(Math.trunc(stats.seed));
  const population = POPULATIONS[pick % POPULATIONS.length];
  const source = SOURCES[pick % SOURCES.length];
  return `You are more vulnerable to espionage than ${vulnerabilityScore(stats)}% of ${population}. (${source})`;
}
