import type { Achievement, PlayerProfile, RunStats } from "../types";

export type AchievementContext = Parameters<Achievement["condition"]>[0];

/**
 * Ids satisfied by `ctx` that are not yet in `ctx.profile.unlocked` nor in `skip`
 * (pass the ids already unlocked earlier in this run). A throwing condition counts as false.
 */
export function evaluateAchievements(
  achievements: readonly Achievement[],
  ctx: AchievementContext,
  skip: readonly string[] = [],
): string[] {
  return achievements
    .filter((a) => !(a.id in ctx.profile.unlocked) && !skip.includes(a.id))
    .filter((a) => {
      try {
        return a.condition(ctx) === true;
      } catch {
        return false;
      }
    })
    .map((a) => a.id);
}

export function applyRunToProfile(
  profile: PlayerProfile,
  stats: RunStats,
  unlockedIds: readonly string[],
  now: number,
): PlayerProfile {
  const unlocked = { ...profile.unlocked };
  for (const id of unlockedIds) unlocked[id] ??= { at: now };
  return {
    runsPlayed: profile.runsPlayed + 1,
    victories: profile.victories + (stats.outcome === "victory" ? 1 : 0),
    timesHoneypotted: profile.timesHoneypotted + (stats.outcome === "honeypotted" ? 1 : 0),
    timesBankrupt: profile.timesBankrupt + (stats.outcome === "romantically-bankrupt" ? 1 : 0),
    totalSpiesCaught: profile.totalSpiesCaught + stats.spiesCaught,
    eggsFound: [...new Set([...profile.eggsFound, ...stats.eggsFound])],
    unlocked,
  };
}
