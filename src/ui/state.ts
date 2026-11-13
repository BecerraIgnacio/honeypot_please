import { applyRunToProfile, evaluateAchievements } from "../game/achievements/engine";
import { ACHIEVEMENTS } from "../game/content/achievements";
import { jensenLine, type JensenSituation } from "../game/content/jensen";
import {
  canScan,
  createRun,
  currentCase,
  currentDay,
  discovered,
  reduce,
  type Action,
  type FactRef,
  type GameState,
} from "../game/engine";
import { emptyProfile, DEFAULT_SETTINGS, type Settings } from "../game/persistence";
import type { DiscrepancyKind, GameEvent, PlayerProfile } from "../game/types";
import { CONTENT, rng01, sameRef } from "./content";

export type Screen = "title" | "game" | "achievements" | "howto" | "settings";
export type DeskTab = "applicant" | "desk" | "terminal";
export type TermTab = "database" | "interrogate";

export interface OpenDoc {
  id: string;
  x: number;
  y: number;
  z: number;
  rot: number;
}

type NewToast = { kind: "achievement"; achievementId: string } | { kind: "egg"; eggId: string };
export type Toast = NewToast & { id: number };

export interface Readout {
  kind: DiscrepancyKind | "none" | "repeat" | "empty";
  text: string;
  n: number;
}

export interface Line {
  text: string;
  n: number;
}

export interface UiState {
  hydrated: boolean;
  screen: Screen;
  /** Where "back" goes from achievements, how-to and settings. */
  back: Screen;
  run: GameState | null;
  /** Index into `run.events` up to which events have been absorbed. */
  seen: number;
  profile: PlayerProfile;
  settings: Settings;
  unlockedThisRun: string[];
  /** Unlocked since the current case started, for the review screen. */
  caseUnlocks: string[];
  selection: FactRef[];
  openDocs: OpenDoc[];
  tab: DeskTab;
  termTab: TermTab;
  query: string;
  record: string | null;
  readout: Readout | null;
  jensen: Line | null;
  scanView: boolean;
  scanEmptyPresses: number;
  toasts: Toast[];
  nextId: number;
  detail: string | null;
}

export type UiAction =
  | { type: "hydrate"; profile: PlayerProfile; settings: Settings; run: GameState | null; unlockedThisRun: string[] }
  | { type: "navigate"; screen: Screen }
  | { type: "newRun"; seed: number }
  | { type: "engine"; action: Action }
  | { type: "uiEgg"; name: string }
  | { type: "select"; ref: FactRef }
  | { type: "compare" }
  | { type: "openDoc"; id: string; x: number; y: number; rot: number }
  | { type: "focusDoc"; id: string }
  | { type: "moveDoc"; id: string; x: number; y: number }
  | { type: "closeDoc"; id?: string }
  | { type: "tab"; tab: DeskTab }
  | { type: "termTab"; tab: TermTab }
  | { type: "search"; query: string }
  | { type: "openRecord"; id: string | null }
  | { type: "scanPress" }
  | { type: "scanView"; open: boolean }
  | { type: "mutter"; r: number }
  | { type: "dismissReadout" }
  | { type: "dismissToast"; id: number }
  | { type: "detail"; id: string | null }
  | { type: "settings"; settings: Settings }
  | { type: "resetProgress" };

const CASE_UI = {
  caseUnlocks: [],
  selection: [],
  openDocs: [],
  record: null,
  readout: null,
  scanView: false,
  scanEmptyPresses: 0,
} satisfies Partial<UiState>;

export const INITIAL: UiState = {
  hydrated: false,
  screen: "title",
  back: "title",
  run: null,
  seen: 0,
  profile: emptyProfile(),
  settings: DEFAULT_SETTINGS,
  unlockedThisRun: [],
  ...CASE_UI,
  tab: "applicant",
  termTab: "database",
  query: "",
  jensen: null,
  toasts: [],
  nextId: 1,
  detail: null,
};

function say(s: UiState, text: string | undefined): UiState {
  return text ? { ...s, jensen: { text, n: s.nextId }, nextId: s.nextId + 1 } : s;
}

function pool(s: UiState, situation: JensenSituation): UiState {
  if (!s.run) return s;
  return say(s, jensenLine(situation, s.run.stats.day, rng01(s.run.stats.seed, s.run.events.length, situation)));
}

function toast(s: UiState, t: NewToast): UiState {
  return { ...s, toasts: [...s.toasts.slice(-3), { ...t, id: s.nextId }], nextId: s.nextId + 1 };
}

function readout(s: UiState, kind: Readout["kind"], text: string): UiState {
  return { ...s, readout: { kind, text, n: s.nextId }, nextId: s.nextId + 1 };
}

function unlock(s: UiState, event: GameEvent, stats: GameState["stats"]): UiState {
  const ids = evaluateAchievements(ACHIEVEMENTS, { event, stats, profile: s.profile }, s.unlockedThisRun);
  if (ids.length === 0) return s;
  const at = Date.now();
  const unlocked = { ...s.profile.unlocked };
  for (const id of ids) unlocked[id] ??= { at };
  let next: UiState = {
    ...s,
    profile: { ...s.profile, unlocked },
    unlockedThisRun: [...s.unlockedThisRun, ...ids],
    caseUnlocks: [...s.caseUnlocks, ...ids],
  };
  for (const achievementId of ids) next = toast(next, { kind: "achievement", achievementId });
  return next;
}

function absorbEvent(s: UiState, event: GameEvent): UiState {
  const run = s.run!;
  const c = currentCase(run, CONTENT);
  switch (event.type) {
    case "caseStarted":
      return say({ ...s, ...CASE_UI }, c?.jensenIntro);
    case "questionAsked":
      return say(s, c?.questions.find((q) => q.id === event.questionId)?.jensen);
    case "discrepancyFound": {
      const d = c?.discrepancies.find((x) => x.id === event.discrepancyId);
      const next = readout({ ...s, selection: [] }, event.kind, d?.note ?? "Discrepancy logged.");
      if (d?.jensen) return say(next, d.jensen);
      if (event.kind === "contradiction") return pool(next, "contradictionFound");
      if (event.kind === "match") return pool(next, "matchFound");
      return next;
    }
    case "noConflict":
      return pool(
        readout({ ...s, selection: [] }, "none", "NO CONFLICT ON FILE. The two facts neither agree nor disagree in any way the terminal cares about."),
        "noConflict",
      );
    case "dbSearched":
      return event.hits === 0 && event.query.trim() !== "" ? pool(s, "dbNoResults") : s;
    case "scanUsed": {
      const dirty = (c?.scan ?? []).some((f) => f.kind !== "clean");
      return pool({ ...s, scanView: true }, dirty ? "scanDirty" : "scanClean");
    }
    case "eggFound":
      return toast(s, { kind: "egg", eggId: event.eggId });
    case "decided": {
      const d = event.decision;
      const situation: JensenSituation =
        d.truth === "spy" ? (d.verdict === "accept" ? "honeypotted" : "correctReject") : d.verdict === "accept" ? "correctAccept" : "wrongReject";
      return pool({ ...s, openDocs: [], selection: [] }, situation);
    }
    case "runEnded":
      return { ...s, profile: applyRunToProfile(s.profile, run.stats, s.unlockedThisRun, Date.now()) };
    default:
      return s;
  }
}

/** Reacts to every engine event not yet seen: achievements first, so `runEnded` evaluates against the pre-run profile. */
function absorb(s: UiState): UiState {
  const run = s.run;
  if (!run) return s;
  let next = s;
  for (const event of run.events.slice(s.seen)) {
    next = unlock(next, event, run.stats);
    next = absorbEvent(next, event);
  }
  return { ...next, seen: run.events.length };
}

function step(s: UiState, action: Action): UiState {
  if (!s.run) return s;
  const run = reduce(s.run, action, CONTENT);
  return run === s.run ? s : absorb({ ...s, run });
}

/** UI-only eggs fired with no live run (the title screen) go straight into the profile through the same achievement path. */
function profileEgg(s: UiState, name: string): UiState {
  const egg = CONTENT.globalEggs.find((e) => e.on === `ui:${name}`);
  if (!egg || s.profile.eggsFound.includes(egg.id)) return s;
  const stats = { ...createRun(0, CONTENT).stats, eggsFound: [egg.id] };
  const withEgg = toast({ ...s, profile: { ...s.profile, eggsFound: [...s.profile.eggsFound, egg.id] } }, { kind: "egg", eggId: egg.id });
  const before = withEgg.unlockedThisRun;
  const after = unlock({ ...withEgg, unlockedThisRun: [] }, { type: "eggFound", eggId: egg.id }, stats);
  return { ...after, unlockedThisRun: before };
}

function pairDiscrepancy(s: UiState) {
  const run = s.run;
  const c = run && currentCase(run, CONTENT);
  if (!c || s.selection.length !== 2) return undefined;
  const [a, b] = s.selection;
  const owns = (ref: FactRef, id: string) => ref.id === id && ref.owner === (id.startsWith("g.") ? "global" : c.id);
  return c.discrepancies.find(({ facts: [x, y] }) => (owns(a, x) && owns(b, y)) || (owns(a, y) && owns(b, x)));
}

export function uiReducer(s: UiState, a: UiAction): UiState {
  switch (a.type) {
    case "hydrate":
      return {
        ...s,
        hydrated: true,
        profile: a.profile,
        settings: a.settings,
        run: a.run,
        seen: a.run?.events.length ?? 0,
        unlockedThisRun: a.run ? a.unlockedThisRun : [],
      };
    case "navigate":
      if (a.screen === "game" && !s.run) return s;
      return { ...s, screen: a.screen, back: s.screen === a.screen ? s.back : s.screen, detail: null };
    case "newRun":
      return {
        ...s,
        ...CASE_UI,
        run: createRun(a.seed, CONTENT),
        seen: 0,
        unlockedThisRun: [],
        screen: "game",
        tab: "applicant",
        termTab: "database",
        query: "",
        jensen: null,
      };
    case "engine":
      return step(s, a.action);
    case "uiEgg":
      return s.run && s.run.stats.outcome === "in-progress" ? step(s, { type: "uiTrigger", name: a.name }) : profileEgg(s, a.name);
    case "select": {
      const has = s.selection.some((r) => sameRef(r, a.ref));
      if (has) return { ...s, selection: s.selection.filter((r) => !sameRef(r, a.ref)) };
      return { ...s, selection: [...s.selection, a.ref].slice(-2) };
    }
    case "compare": {
      if (s.selection.length !== 2 || !s.run) return s;
      const hit = pairDiscrepancy(s);
      if (hit && discovered(s.run).includes(`d:${hit.id}`)) {
        return readout({ ...s, selection: [] }, "repeat", `ALREADY IN NOTEBOOK. ${hit.note}`);
      }
      return step(s, { type: "compare", a: s.selection[0], b: s.selection[1] });
    }
    case "openDoc": {
      const z = Math.max(0, ...s.openDocs.map((d) => d.z)) + 1;
      const existing = s.openDocs.find((d) => d.id === a.id);
      const openDocs = existing
        ? s.openDocs.map((d) => (d.id === a.id ? { ...d, z } : d))
        : [...s.openDocs, { id: a.id, x: a.x, y: a.y, rot: a.rot, z }];
      return step({ ...s, openDocs }, { type: "openDocument", docId: a.id });
    }
    case "focusDoc": {
      const z = Math.max(0, ...s.openDocs.map((d) => d.z)) + 1;
      return { ...s, openDocs: s.openDocs.map((d) => (d.id === a.id ? { ...d, z } : d)) };
    }
    case "moveDoc":
      return { ...s, openDocs: s.openDocs.map((d) => (d.id === a.id ? { ...d, x: a.x, y: a.y } : d)) };
    case "closeDoc": {
      if (s.openDocs.length === 0) return s;
      const id = a.id ?? [...s.openDocs].sort((x, y) => y.z - x.z)[0].id;
      return { ...s, openDocs: s.openDocs.filter((d) => d.id !== id) };
    }
    case "tab":
      return { ...s, tab: a.tab };
    case "termTab":
      return { ...s, termTab: a.tab };
    case "search":
      return step({ ...s, query: a.query, record: null }, { type: "search", query: a.query });
    case "openRecord":
      return a.id === null ? { ...s, record: null } : step({ ...s, record: a.id }, { type: "viewRecord", recordId: a.id });
    case "scanPress": {
      const run = s.run;
      if (!run || run.phase.kind !== "case") return s;
      if (canScan(run)) return step(s, { type: "scan" });
      if (run.phase.tokens.includes("scan")) return { ...s, scanView: true };
      const presses = s.scanEmptyPresses + 1;
      const next = readout({ ...s, scanEmptyPresses: presses }, "empty", "SCANNER EMPTY. Charges refill at the start of each shift.");
      const lined = pool(next, "scanEmpty");
      return presses === 3 ? step(lined, { type: "uiTrigger", name: "scan-empty" }) : lined;
    }
    case "scanView":
      return { ...s, scanView: a.open };
    case "mutter": {
      const day = s.run && currentDay(s.run, CONTENT);
      if (!day || s.run?.phase.kind !== "case") return s;
      if (a.r < 0.3) return pool(s, "idleGeneric");
      return say(s, day.jensenIdle[Math.floor(a.r * day.jensenIdle.length) % day.jensenIdle.length]);
    }
    case "dismissReadout":
      return { ...s, readout: null };
    case "dismissToast":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "detail":
      return { ...s, detail: a.id };
    case "settings":
      return { ...s, settings: a.settings };
    case "resetProgress":
      return { ...s, ...CASE_UI, profile: emptyProfile(), run: null, seen: 0, unlockedThisRun: [], screen: "title", back: "title" };
  }
}
