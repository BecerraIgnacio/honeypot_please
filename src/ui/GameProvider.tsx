"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
} from "react";
import { clearRun, loadProfile, loadRun, loadSettings, saveProfile, saveRun, saveSettings } from "../game/persistence";
import type { GameEvent } from "../game/types";
import { CONTENT } from "./content";
import { setSoundEnabled, sfx, unlockAudio, type Sfx } from "./sound";
import { INITIAL, uiReducer, type UiAction, type UiState } from "./state";

const RUN_UNLOCKS_KEY = "honeypot.ui.run-unlocks.v1";

const Ctx = createContext<{ s: UiState; dispatch: Dispatch<UiAction> } | null>(null);

export function useGame() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useGame outside GameProvider");
  return value;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

const mediaSubscribers = new Map<string, (cb: () => void) => () => void>();

function subscribeMedia(query: string) {
  let sub = mediaSubscribers.get(query);
  if (!sub) {
    sub = (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    };
    mediaSubscribers.set(query, sub);
  }
  return sub;
}

export function useMedia(query: string, serverValue = false): boolean {
  return useSyncExternalStore(subscribeMedia(query), () => window.matchMedia(query).matches, () => serverValue);
}

export function useReducedMotion(): boolean {
  const { s } = useGame();
  const system = useMedia("(prefers-reduced-motion: reduce)");
  return system || s.settings.reducedMotion;
}

const EVENT_SOUND: Partial<Record<GameEvent["type"], (e: GameEvent) => Sfx | null>> = {
  discrepancyFound: (e) => (e.type === "discrepancyFound" && e.kind === "contradiction" ? "bad" : "good"),
  noConflict: () => "blip",
  docOpened: () => "paper",
  scanUsed: () => "scan",
  eggFound: () => "chime",
  questionAsked: () => "blip",
  runEnded: (e) => (e.type === "runEnded" && e.outcome === "honeypotted" ? "alarm" : e.type === "runEnded" && e.outcome === "victory" ? "chime" : "bad"),
};

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(uiReducer, INITIAL);
  const sounded = useRef(0);

  useEffect(() => {
    const store = storage();
    if (!store) return dispatch({ type: "hydrate", profile: INITIAL.profile, settings: INITIAL.settings, run: null, unlockedThisRun: [] });
    let unlockedThisRun: string[] = [];
    try {
      const raw: unknown = JSON.parse(store.getItem(RUN_UNLOCKS_KEY) ?? "[]");
      if (Array.isArray(raw)) unlockedThisRun = raw.filter((x): x is string => typeof x === "string");
    } catch {
      unlockedThisRun = [];
    }
    const run = loadRun(store, CONTENT);
    sounded.current = run?.events.length ?? 0;
    dispatch({ type: "hydrate", profile: loadProfile(store), settings: loadSettings(store), run, unlockedThisRun });
  }, []);

  useEffect(() => {
    const store = storage();
    if (!s.hydrated || !store) return;
    if (s.run && s.run.stats.outcome === "in-progress") saveRun(store, s.run);
    else clearRun(store);
  }, [s.hydrated, s.run]);

  useEffect(() => {
    const store = storage();
    if (s.hydrated && store) saveProfile(store, s.profile);
  }, [s.hydrated, s.profile]);

  useEffect(() => {
    const store = storage();
    if (!s.hydrated || !store) return;
    try {
      store.setItem(RUN_UNLOCKS_KEY, JSON.stringify(s.unlockedThisRun));
    } catch {
      // Storage full or blocked: the end screen just shows fewer unlocks.
    }
  }, [s.hydrated, s.unlockedThisRun]);

  useEffect(() => {
    const store = storage();
    if (s.hydrated && store) saveSettings(store, s.settings);
    setSoundEnabled(s.settings.sound);
    document.documentElement.dataset.reduceMotion = s.settings.reducedMotion ? "true" : "false";
    document.documentElement.dataset.crt = s.settings.crt ? "on" : "off";
  }, [s.hydrated, s.settings]);

  useEffect(() => {
    const events = s.run?.events ?? [];
    if (events.length < sounded.current) sounded.current = 0;
    for (const e of events.slice(sounded.current)) {
      const name = EVENT_SOUND[e.type]?.(e);
      if (name) sfx(name);
    }
    sounded.current = events.length;
  }, [s.run]);

  useEffect(() => {
    if (s.toasts.length === 0) return;
    const oldest = s.toasts[0];
    const t = setTimeout(() => dispatch({ type: "dismissToast", id: oldest.id }), 6000);
    return () => clearTimeout(t);
  }, [s.toasts]);

  const readoutN = s.readout?.n;
  useEffect(() => {
    if (readoutN === undefined) return;
    const t = setTimeout(() => dispatch({ type: "dismissReadout" }), 6000);
    return () => clearTimeout(t);
  }, [readoutN]);

  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      unlockAudio();
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        dispatch({ type: "uiEgg", name: "konami" });
      }
    };
    const onPointer = () => unlockAudio();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const inCase = s.screen === "game" && s.run?.phase.kind === "case";
  const caseKey = s.run && s.run.phase.kind === "case" ? `${s.run.stats.day}-${s.run.phase.index}` : "";

  useEffect(() => {
    if (!inCase) return;
    let idle: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(idle);
      idle = setTimeout(() => dispatch({ type: "uiEgg", name: "idle" }), 60_000);
    };
    const events = ["pointerdown", "keydown", "pointermove", "wheel"] as const;
    events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
    arm();
    return () => {
      clearTimeout(idle);
      events.forEach((ev) => window.removeEventListener(ev, arm));
    };
  }, [inCase, caseKey]);

  useEffect(() => {
    if (!inCase) return;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        dispatch({ type: "mutter", r: Math.random() });
        next();
      }, 45_000 + Math.random() * 25_000);
    };
    next();
    return () => clearTimeout(t);
  }, [inCase, caseKey]);

  return <Ctx.Provider value={{ s, dispatch }}>{children}</Ctx.Provider>;
}
