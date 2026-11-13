import type { Truth, Verdict } from "./types";

export interface VerdictEffect {
  stability: number;
  /** Billions of dollars on Day 1. */
  marketCap: number;
  /** Added to `marketCap` once for every day after Day 1. */
  marketCapPerDay: number;
  /** Ends the run as honeypotted. */
  fatal?: boolean;
}

export interface GameConfig {
  startingMarketCap: number;
  startingStability: number;
  maxStability: number;
  /** Regular slots per day, before the finale. */
  lineupSize: number;
  minSpies: number;
  minInnocents: number;
  rareChance: number;
  scansPerDay: number;
  verdicts: Record<Verdict, Record<Truth, VerdictEffect>>;
}

// A wrongful rejection costs 35 of 100 stability: two honest mistakes leave 30, while
// reject-everyone loses at least 70 a day against at most +9 and is bankrupt by Day 2.
export const CONFIG: GameConfig = {
  startingMarketCap: 5000,
  startingStability: 100,
  maxStability: 100,
  lineupSize: 4,
  minSpies: 1,
  minInnocents: 2,
  rareChance: 0.35,
  scansPerDay: 2,
  verdicts: {
    accept: {
      innocent: { stability: 8, marketCap: 40, marketCapPerDay: 10 },
      spy: { stability: 0, marketCap: -1200, marketCapPerDay: -300, fatal: true },
    },
    reject: {
      innocent: { stability: -35, marketCap: -90, marketCapPerDay: -20 },
      spy: { stability: 3, marketCap: 60, marketCapPerDay: 15 },
    },
  },
};
