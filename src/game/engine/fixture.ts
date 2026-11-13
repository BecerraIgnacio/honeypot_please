import type { CaseDef, DayDef, DayNumber, Truth, Verdict } from "../types";
import { currentCase, reduce, type GameContent, type GameState } from "./index";

export function makeCase(id: string, day: DayNumber, truth: Truth, over: Partial<CaseDef> = {}): CaseDef {
  const name = `Applicant ${id}`;
  return {
    id,
    day,
    slot: "regular",
    applicant: {
      name,
      nationality: "Freedonian",
      occupation: "Kernel engineer",
      statedReason: "Coffee",
      bio: "Bio.",
      portrait: { kind: "special", id: "gpu-wig" },
      greeting: "Hello.",
    },
    claims: [{ id: "name", label: "Name", value: name }],
    documents: [],
    questions: [],
    records: [
      {
        id: `rec-${id}`,
        category: "attendee",
        title: `Attendee file ${id}`,
        keywords: [id],
        facts: [{ id: "rec.name", label: "Name", value: name }],
      },
    ],
    discrepancies: [],
    scan: [{ id: "clean", kind: "clean", title: "Nothing", description: "Nothing.", suspicion: 0 }],
    baseSuspicion: 20,
    jensenIntro: "Hm.",
    truth,
    hiddenTruth: `Truth of ${id}`,
    solution: { clues: ["scan"], redHerrings: ["scan:clean"], explanation: `Explanation ${id}` },
    onAccept: { headline: "Accepted", text: `Accepted ${id}` },
    onReject: { headline: "Rejected", text: `Rejected ${id}` },
    ...over,
  };
}

/** Day 1 tutorial: the one case with real documents, gated questions and discrepancies. */
export function tutorial(over: Partial<CaseDef> = {}): CaseDef {
  return makeCase("d1-r0", 1, "innocent", {
    applicant: { ...makeCase("x", 1, "innocent").applicant, name: "Ada Quill" },
    claims: [
      { id: "name", label: "Name", value: "Ada Quill" },
      { id: "employer", label: "Employer", value: "Tessellate" },
    ],
    documents: [
      { id: "badge", kind: "access-badge", title: "Badge", facts: [{ id: "badge.no", label: "Badge", value: "NV-12345-A" }] },
      { id: "pass", kind: "conference-pass", title: "Pass", facts: [{ id: "pass.date", label: "Issued", value: "2027-03-15" }] },
    ],
    questions: [
      {
        id: "why",
        prompt: "Why are you here?",
        answer: "Allocation.",
        facts: [{ id: "why.claim", label: "Reason", value: "H100 allocation" }],
        suspicion: 5,
      },
      { id: "badge-q", prompt: "Badge?", answer: "Yes.", suspicion: -3, requires: ["doc:badge"] },
      { id: "deep", prompt: "Deep?", answer: "Deep.", suspicion: 10, requires: ["q:why", "doc:pass"] },
      { id: "hobby", prompt: "Hobby?", answer: "CUDA." },
    ],
    records: [
      {
        id: "rec-ada",
        category: "employee",
        title: "Ada Quill employee file",
        keywords: ["ada", "quill"],
        facts: [
          { id: "rec.badge", label: "Badge", value: "NV-12345-A" },
          { id: "rec.name", label: "Name", value: "Ada Quill" },
        ],
      },
    ],
    discrepancies: [
      { id: "badge-match", facts: ["badge.no", "rec.badge"], kind: "match", note: "Badge on file.", suspicion: -10 },
      { id: "name-match", facts: ["name", "rec.name"], kind: "match", note: "Name on file.", suspicion: -5 },
      { id: "date-rule", facts: ["pass.date", "g.d1.cutoff"], kind: "explained", note: "Issued on cutoff.", suspicion: 15 },
      { id: "scan-why", facts: ["scan.fact", "why.claim"], kind: "contradiction", note: "Bag disagrees.", suspicion: 30 },
    ],
    scan: [
      { id: "bag", kind: "bag-contents", title: "Bag", description: "A 5090.", facts: [{ id: "scan.fact", label: "Bag", value: "RTX 5090" }], suspicion: 20 },
      { id: "clean", kind: "clean", title: "Clean", description: "Nothing else.", suspicion: -5 },
    ],
    baseSuspicion: 40,
    eggs: [{ id: "egg-badge", title: "Badge", toast: "Nice badge.", on: "doc:badge" }],
    solution: { clues: ["d:badge-match", "q:why", "doc:badge"], redHerrings: ["scan:bag"], explanation: "Ada is fine." },
    ...over,
  });
}

const REGULAR_TRUTHS: Truth[] = ["innocent", "spy", "innocent", "spy", "innocent", "spy"];

export function makeContent(opts: { tutorial?: Partial<CaseDef> } = {}): GameContent {
  const days: DayDef[] = ([1, 2, 3, 4, 5] as DayNumber[]).map((day) => {
    const regular = REGULAR_TRUTHS.map((t, i) =>
      day === 1 && i === 0 ? tutorial(opts.tutorial) : makeCase(`d${day}-r${i}`, day, t),
    );
    const odd = day % 2 === 1;
    return {
      day,
      title: `Day ${day}`,
      briefing: `Briefing ${day}`,
      directives: [
        {
          id: `dir-${day}`,
          category: "directive",
          title: `Directive ${day}`,
          keywords: [`rule${day}`],
          facts: [{ id: day === 1 ? "g.d1.cutoff" : `g.d${day}.rule`, label: "Rule", value: `Rule of day ${day}` }],
        },
      ],
      cases: [
        ...regular,
        makeCase(`d${day}-rare`, day, odd ? "spy" : "innocent", { slot: "rare" }),
        makeCase(`d${day}-fin`, day, odd ? "spy" : "innocent", { slot: "finale" }),
      ],
      jensenIdle: [],
    };
  });
  return {
    days,
    globalRecords: [
      {
        id: "glob-meridian",
        category: "watchlist",
        title: "Meridian Group",
        keywords: ["meridian", "lumen bridge"],
        facts: [{ id: "g.meridian", label: "Cover", value: "Lumen Bridge Capital" }],
      },
    ],
    globalEggs: [
      { id: "egg-rocm", title: "ROCm", toast: "Security.", on: "search:ROCm" },
      { id: "egg-jacket", title: "Jacket", toast: "The jacket stirs.", on: "ui:jacket" },
    ],
  };
}

export type Strategy = (c: { truth: Truth }) => Verdict;
export const perfect: Strategy = (c) => (c.truth === "spy" ? "reject" : "accept");
export const rejectAll: Strategy = () => "reject";
export const acceptAll: Strategy = () => "accept";

/** Advances and decides with `strategy` until the run ends or `until` holds. */
export function play(state: GameState, content: GameContent, strategy: Strategy, until?: (s: GameState) => boolean): GameState {
  let s = state;
  for (let guard = 0; guard < 1000 && s.phase.kind !== "ended" && !until?.(s); guard++) {
    const c = s.phase.kind === "case" ? currentCase(s, content) : null;
    s = reduce(s, c ? { type: "decide", verdict: strategy(c) } : { type: "advance" }, content);
  }
  return s;
}
