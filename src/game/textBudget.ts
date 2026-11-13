import type { CaseDef, DayDef, DbRecord, Fact } from "./types";

/**
 * Maximum characters per kind of text. The game is read on a phone between
 * stamps: every line has to earn its place, so the budget is enforced by test.
 */
export const TEXT_BUDGET = {
  briefing: 380,
  jensenIdle: 90,
  greeting: 120,
  bio: 150,
  statedReason: 80,
  jensenIntro: 100,
  factLabel: 26,
  factValue: 64,
  docTitle: 44,
  docBody: 200,
  docFooter: 70,
  questionPrompt: 70,
  questionAnswer: 190,
  jensenRemark: 100,
  discrepancyNote: 140,
  scanTitle: 40,
  scanDescription: 150,
  recordTitle: 56,
  recordBody: 180,
  outcomeHeadline: 36,
  outcomeText: 160,
  hiddenTruth: 150,
  explanation: 380,
} as const;

export type TextKind = keyof typeof TEXT_BUDGET;

export interface TextSample {
  kind: TextKind;
  where: string;
  text: string;
}

function factSamples(where: string, facts: Fact[]): TextSample[] {
  return facts.flatMap((f) => [
    { kind: "factLabel" as const, where: `${where} fact ${f.id} label`, text: f.label },
    { kind: "factValue" as const, where: `${where} fact ${f.id} value`, text: f.value },
  ]);
}

function recordSamples(where: string, r: DbRecord): TextSample[] {
  return [
    { kind: "recordTitle", where: `${where} record ${r.id} title`, text: r.title },
    { kind: "recordBody", where: `${where} record ${r.id} body`, text: r.body ?? "" },
    ...factSamples(`${where} record ${r.id}`, r.facts),
  ];
}

function caseSamples(c: CaseDef): TextSample[] {
  const w = `[${c.id}]`;
  return [
    { kind: "greeting", where: `${w} greeting`, text: c.applicant.greeting },
    { kind: "bio", where: `${w} bio`, text: c.applicant.bio },
    { kind: "statedReason", where: `${w} statedReason`, text: c.applicant.statedReason },
    { kind: "jensenIntro", where: `${w} jensenIntro`, text: c.jensenIntro },
    ...factSamples(`${w} claims`, c.claims),
    ...c.documents.flatMap((d): TextSample[] => [
      { kind: "docTitle", where: `${w} doc ${d.id} title`, text: d.title },
      { kind: "docBody", where: `${w} doc ${d.id} body`, text: d.body ?? "" },
      { kind: "docFooter", where: `${w} doc ${d.id} footer`, text: d.footer ?? "" },
      ...factSamples(`${w} doc ${d.id}`, d.facts),
    ]),
    ...c.questions.flatMap((q): TextSample[] => [
      { kind: "questionPrompt", where: `${w} question ${q.id} prompt`, text: q.prompt },
      { kind: "questionAnswer", where: `${w} question ${q.id} answer`, text: q.answer },
      { kind: "jensenRemark", where: `${w} question ${q.id} jensen`, text: q.jensen ?? "" },
      ...factSamples(`${w} question ${q.id}`, q.facts ?? []),
    ]),
    ...c.records.flatMap((r) => recordSamples(w, r)),
    ...c.discrepancies.flatMap((d): TextSample[] => [
      { kind: "discrepancyNote", where: `${w} discrepancy ${d.id} note`, text: d.note },
      { kind: "jensenRemark", where: `${w} discrepancy ${d.id} jensen`, text: d.jensen ?? "" },
    ]),
    ...c.scan.flatMap((s): TextSample[] => [
      { kind: "scanTitle", where: `${w} scan ${s.id} title`, text: s.title },
      { kind: "scanDescription", where: `${w} scan ${s.id} description`, text: s.description },
      ...factSamples(`${w} scan ${s.id}`, s.facts ?? []),
    ]),
    { kind: "outcomeHeadline", where: `${w} onAccept headline`, text: c.onAccept.headline },
    { kind: "outcomeText", where: `${w} onAccept text`, text: c.onAccept.text },
    { kind: "outcomeHeadline", where: `${w} onReject headline`, text: c.onReject.headline },
    { kind: "outcomeText", where: `${w} onReject text`, text: c.onReject.text },
    { kind: "hiddenTruth", where: `${w} hiddenTruth`, text: c.hiddenTruth },
    { kind: "explanation", where: `${w} explanation`, text: c.solution.explanation },
  ];
}

export function textSamples(days: DayDef[]): TextSample[] {
  return days.flatMap((day) => [
    { kind: "briefing" as const, where: `[day ${day.day}] briefing`, text: day.briefing },
    ...day.jensenIdle.map((text, i) => ({ kind: "jensenIdle" as const, where: `[day ${day.day}] jensenIdle ${i}`, text })),
    ...day.directives.flatMap((r) => recordSamples(`[day ${day.day}]`, r)),
    ...day.cases.flatMap(caseSamples),
  ]);
}

export const MAX_QUESTIONS_PER_CASE = 5;
export const MAX_DOCUMENTS_PER_CASE = 4;

export function textBudgetErrors(days: DayDef[]): string[] {
  const tooLong = textSamples(days)
    .filter((s) => s.text.length > TEXT_BUDGET[s.kind])
    .map((s) => `${s.where}: ${s.text.length} chars, budget ${TEXT_BUDGET[s.kind]}`);
  const tooMany = days
    .flatMap((d) => d.cases)
    .flatMap((c) => [
      c.questions.length > MAX_QUESTIONS_PER_CASE ? `[${c.id}] ${c.questions.length} questions, max ${MAX_QUESTIONS_PER_CASE}` : "",
      c.documents.length > MAX_DOCUMENTS_PER_CASE ? `[${c.id}] ${c.documents.length} documents, max ${MAX_DOCUMENTS_PER_CASE}` : "",
    ])
    .filter(Boolean);
  return [...tooLong, ...tooMany];
}
