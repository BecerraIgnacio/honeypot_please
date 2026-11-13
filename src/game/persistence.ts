import { caseById, type GameContent, type GameState } from "./engine";
import type { PlayerProfile } from "./types";

export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
  crt: boolean;
}

export const KEYS = {
  profile: "honeypot.profile.v1",
  settings: "honeypot.settings.v1",
  run: "honeypot.run.v1",
} as const;

export const DEFAULT_SETTINGS: Settings = { sound: true, reducedMotion: false, crt: true };

export function emptyProfile(): PlayerProfile {
  return {
    runsPlayed: 0,
    victories: 0,
    timesHoneypotted: 0,
    timesBankrupt: 0,
    totalSpiesCaught: 0,
    eggsFound: [],
    unlocked: {},
  };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const count = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : 0);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

function read(storage: KeyValueStore, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

/** False when storage is unavailable or full. */
function write(storage: KeyValueStore, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function parseProfile(raw: unknown): PlayerProfile {
  if (!isObj(raw)) return emptyProfile();
  const unlocked: PlayerProfile["unlocked"] = {};
  if (isObj(raw.unlocked)) {
    for (const [id, entry] of Object.entries(raw.unlocked)) {
      if (isObj(entry) && typeof entry.at === "number" && Number.isFinite(entry.at)) unlocked[id] = { at: entry.at };
    }
  }
  return {
    runsPlayed: count(raw.runsPlayed),
    victories: count(raw.victories),
    timesHoneypotted: count(raw.timesHoneypotted),
    timesBankrupt: count(raw.timesBankrupt),
    totalSpiesCaught: count(raw.totalSpiesCaught),
    eggsFound: strings(raw.eggsFound),
    unlocked,
  };
}

export function parseSettings(raw: unknown): Settings {
  const o = isObj(raw) ? raw : {};
  return {
    sound: bool(o.sound, DEFAULT_SETTINGS.sound),
    reducedMotion: bool(o.reducedMotion, DEFAULT_SETTINGS.reducedMotion),
    crt: bool(o.crt, DEFAULT_SETTINGS.crt),
  };
}

const LIVE_PHASES = ["briefing", "case", "review", "dayEnd"];

/** A resumable snapshot whose every case still exists in `content`, else null. */
export function parseRun(raw: unknown, content: GameContent): GameState | null {
  if (!isObj(raw) || raw.version !== 1) return null;
  const { lineup, phase, stats, events, scansLeft } = raw;
  if (!Array.isArray(lineup) || lineup.length !== 5) return null;
  if (!lineup.every((day) => Array.isArray(day) && day.every((id) => typeof id === "string" && caseById(content, id)))) {
    return null;
  }
  if (!isObj(phase) || typeof phase.kind !== "string" || !LIVE_PHASES.includes(phase.kind)) return null;
  if (phase.kind === "case" || phase.kind === "review") {
    if (typeof phase.index !== "number" || !Array.isArray(phase.tokens)) return null;
  }
  if (phase.kind === "review" && !isObj(phase.decision)) return null;
  if (!isObj(stats) || stats.outcome === undefined || typeof stats.day !== "number") return null;
  if (!Array.isArray(stats.decisions) || !Array.isArray(stats.eggsFound)) return null;
  if (!Array.isArray(events) || typeof scansLeft !== "number") return null;
  return raw as unknown as GameState;
}

export const loadProfile = (storage: KeyValueStore) => parseProfile(read(storage, KEYS.profile));
export const saveProfile = (storage: KeyValueStore, profile: PlayerProfile) => write(storage, KEYS.profile, profile);
export const loadSettings = (storage: KeyValueStore) => parseSettings(read(storage, KEYS.settings));
export const saveSettings = (storage: KeyValueStore, settings: Settings) => write(storage, KEYS.settings, settings);
export const loadRun = (storage: KeyValueStore, content: GameContent) => parseRun(read(storage, KEYS.run), content);
export const saveRun = (storage: KeyValueStore, state: GameState) => write(storage, KEYS.run, state);

export function clearRun(storage: KeyValueStore): void {
  try {
    storage.removeItem(KEYS.run);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
