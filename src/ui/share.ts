import { jensenSvg } from "../art/jensen";
import { portraitSvg } from "../art/portrait";
import { ACHIEVEMENTS } from "../game/content/achievements";
import type { EndOutcome } from "../game/content/headlines";
import { pickRank } from "../game/content/ranks";
import { createRun, type GameState } from "../game/engine";
import type { Achievement, CardStyle, PlayerProfile, Rarity } from "../game/types";
import type { CardData } from "../share/card/types";
import { resolveShareUrls } from "../share/config";
import { buildShareVars, type ShareVars } from "../share/text";
import { CONTENT, fatalCase, money } from "./content";

const STYLE: Record<EndOutcome, CardStyle> = {
  honeypotted: "tabloid",
  "romantically-bankrupt": "classified",
  victory: "propaganda",
};

const RARITY_RANK: Record<Rarity, number> = { legendary: 5, cursed: 4, epic: 3, rare: 2, common: 1 };

const rarest = (list: Achievement[]) => [...list].sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity])[0] ?? null;

/** The achievement this run is best remembered by: the rarest one the ending itself earned, else the rarest overall. */
export function headlineAchievement(run: GameState, unlocked: string[], profile: PlayerProfile): Achievement | null {
  const list = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id));
  const outcome = run.stats.outcome as EndOutcome;
  const byEnding = list.filter((a) => {
    try {
      return a.condition({ event: { type: "runEnded", outcome }, stats: run.stats, profile });
    } catch {
      return false;
    }
  });
  return rarest(byEnding) ?? rarest(list);
}

export function runShare(run: GameState, unlocked: string[], profile: PlayerProfile) {
  const outcome = run.stats.outcome as EndOutcome;
  const rank = pickRank(run.stats);
  const achievement = headlineAchievement(run, unlocked, profile);
  const vars = buildShareVars(run.stats, rank, achievement, resolveShareUrls());
  const spy = fatalCase(run);
  const lost = run.stats.startingMarketCap - run.stats.marketCap;
  const card: CardData = {
    style: STYLE[outcome],
    title: achievement?.title ?? rank.title,
    memePhrase: achievement?.memePhrase ?? (outcome === "honeypotted" ? "HONEYPOTTED" : outcome === "victory" ? "THE PERIMETER HELD" : "ROMANTICALLY BANKRUPT"),
    subtext: rank.blurb,
    stats: [
      { label: "Day reached", value: `${run.stats.day}/5` },
      { label: "Spies caught", value: String(run.stats.spiesCaught) },
      { label: "Innocents rejected", value: String(run.stats.innocentsRejected) },
      { label: lost > 0 ? "Market cap lost" : "Market cap", value: lost > 0 ? money(lost) : money(run.stats.marketCap) },
    ],
    portraitSvg: spy
      ? portraitSvg(spy.applicant.portrait)
      : jensenSvg(outcome === "victory" ? "triumphant" : outcome === "honeypotted" ? "devastated" : "unhinged"),
    gameUrl: vars.gameUrl,
    caseFileNo: `RPC7-${String(run.stats.seed % 100000).padStart(5, "0")}`,
  };
  const templates = achievement?.shareTemplates ?? [];
  return { outcome, rank, achievement, vars, card, templates, artKey: OUTCOME_ART[outcome] };
}

const OUTCOME_ART: Record<EndOutcome, string> = { honeypotted: "honeypotted", "romantically-bankrupt": "bankrupt", victory: "victory" };

/** Achievements with art of their own in public/art; the rest fall back to their card style key. */
const ACHIEVEMENT_ART: Record<string, string> = {
  "leather-jacket-supremacy": "jacket",
  "signed-the-jacket": "jacket",
  "the-jacket-is-sentient": "jacket",
  "the-jacket-trusts-you": "jacket",
  "alone-with-the-jacket": "jacket",
  "thats-a-5090-in-a-wig": "gpu-wig",
  "three-gpus-in-a-trenchcoat": "trenchcoat",
  "till-deprecation": "h100-wedding",
  "it-runs-doom": "doom",
  "doom-in-the-database": "doom",
  "you-got-honeypotted": "honeypotted",
  "the-incel-protocol": "bankrupt",
  "survived-gtc": "victory",
};

export function achievementShare(a: Achievement, profile: PlayerProfile): { card: CardData; vars: ShareVars; artKey: string } {
  const stats = { ...createRun(0, CONTENT).stats, spiesCaught: profile.totalSpiesCaught };
  const rank = pickRank(stats);
  const vars = buildShareVars(stats, rank, a, resolveShareUrls());
  const mood = a.rarity === "cursed" ? "devastated" : a.rarity === "legendary" ? "triumphant" : a.rarity === "epic" ? "unhinged" : "wary";
  return {
    vars,
    artKey: ACHIEVEMENT_ART[a.id] ?? a.cardStyle,
    card: {
      style: a.cardStyle,
      title: a.title,
      memePhrase: a.memePhrase,
      subtext: a.description,
      stats: [
        { label: "Rarity", value: a.rarity.toUpperCase() },
        { label: "Shifts worked", value: String(profile.runsPlayed) },
        { label: "Spies caught", value: String(profile.totalSpiesCaught) },
        { label: "Times honeypotted", value: String(profile.timesHoneypotted) },
      ],
      portraitSvg: jensenSvg(mood),
      gameUrl: vars.gameUrl,
    },
  };
}
