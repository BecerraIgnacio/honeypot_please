import { describe, expect, it } from "vitest";
import { createRun, reduce } from "./engine";
import { makeContent } from "./engine/fixture";
import {
  KEYS,
  clearRun,
  loadProfile,
  loadRun,
  loadSettings,
  saveProfile,
  saveRun,
  saveSettings,
  type KeyValueStore,
} from "./persistence";

function memory(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => void (data[k] = v),
    removeItem: (k) => void delete data[k],
  };
}

const EMPTY = { runsPlayed: 0, victories: 0, timesHoneypotted: 0, timesBankrupt: 0, totalSpiesCaught: 0, eggsFound: [], unlocked: {} };
const content = makeContent();

describe("profile", () => {
  it("round-trips", () => {
    const store = memory();
    const profile = { ...EMPTY, runsPlayed: 3, eggsFound: ["egg-a"], unlocked: { a: { at: 5 } } };
    expect(saveProfile(store, profile)).toBe(true);
    expect(loadProfile(store)).toEqual(profile);
  });

  it("falls back to defaults on corrupt or foreign data", () => {
    expect(loadProfile(memory())).toEqual(EMPTY);
    expect(loadProfile(memory({ [KEYS.profile]: "{not json" }))).toEqual(EMPTY);
    expect(loadProfile(memory({ [KEYS.profile]: "[1,2]" }))).toEqual(EMPTY);
    expect(
      loadProfile(memory({ [KEYS.profile]: JSON.stringify({ runsPlayed: "7", victories: 2, eggsFound: [1, "e"], unlocked: { x: 3, y: { at: 4 } } }) })),
    ).toEqual({ ...EMPTY, victories: 2, eggsFound: ["e"], unlocked: { y: { at: 4 } } });
  });

  it("survives a storage that throws", () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadProfile(broken)).toEqual(EMPTY);
    expect(saveProfile(broken, EMPTY)).toBe(false);
    expect(() => clearRun(broken)).not.toThrow();
  });
});

describe("settings", () => {
  it("round-trips and fills missing fields with defaults", () => {
    const store = memory();
    saveSettings(store, { sound: false, reducedMotion: true, crt: false });
    expect(loadSettings(store)).toEqual({ sound: false, reducedMotion: true, crt: false });
    expect(loadSettings(memory({ [KEYS.settings]: '{"sound":"no","crt":false}' }))).toEqual({ sound: true, reducedMotion: false, crt: false });
    expect(loadSettings(memory({ [KEYS.settings]: "null" }))).toEqual({ sound: true, reducedMotion: false, crt: true });
  });
});

describe("run snapshot", () => {
  it("round-trips a live run and clears it", () => {
    const store = memory();
    let state = reduce(createRun(8, content), { type: "advance" }, content);
    state = reduce(state, { type: "openDocument", docId: "badge" }, content);
    saveRun(store, state);
    expect(loadRun(store, content)).toEqual(state);
    clearRun(store);
    expect(loadRun(store, content)).toBe(null);
  });

  it("rejects corrupt snapshots and snapshots whose cases no longer exist", () => {
    const state = createRun(8, content);
    expect(loadRun(memory({ [KEYS.run]: "{oops" }), content)).toBe(null);
    expect(loadRun(memory({ [KEYS.run]: JSON.stringify({ ...state, version: 2 }) }), content)).toBe(null);
    expect(loadRun(memory({ [KEYS.run]: JSON.stringify({ ...state, phase: { kind: "case" } }) }), content)).toBe(null);
    const gone = { ...state, lineup: [["deleted-case"], ...state.lineup.slice(1)] };
    expect(loadRun(memory({ [KEYS.run]: JSON.stringify(gone) }), content)).toBe(null);
    expect(loadRun(memory({ [KEYS.run]: JSON.stringify(state) }), content)).toEqual(state);
  });
});
