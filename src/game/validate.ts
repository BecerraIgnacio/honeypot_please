import type { CaseDef, DayDef, Fact } from "./types";

export function caseFacts(c: CaseDef): Fact[] {
  return [
    ...c.claims,
    ...c.documents.flatMap((d) => d.facts),
    ...c.questions.flatMap((q) => q.facts ?? []),
    ...c.records.flatMap((r) => r.facts),
    ...c.scan.flatMap((s) => s.facts ?? []),
  ];
}

export function caseTokens(c: CaseDef): Set<string> {
  return new Set([
    ...c.documents.map((d) => `doc:${d.id}`),
    ...c.questions.map((q) => `q:${q.id}`),
    ...c.discrepancies.map((d) => `d:${d.id}`),
    ...c.records.map((r) => `rec:${r.id}`),
    "scan",
    ...c.scan.map((s) => `scan:${s.id}`),
  ]);
}

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) (seen.has(id) ? dup : seen).add(id);
  return [...dup];
}

/** Returns human-readable problems. Empty means the case is structurally sound. */
export function validateCase(c: CaseDef, globalFactIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(`[${c.id}] ${msg}`);

  const facts = caseFacts(c);
  const factIds = new Set(facts.map((f) => f.id));
  const tokens = caseTokens(c);

  for (const id of duplicates(facts.map((f) => f.id))) err(`duplicate fact id "${id}"`);
  for (const f of facts) {
    if (f.id.startsWith("g.")) err(`case fact "${f.id}" must not use the global "g." prefix`);
    if (!f.label.trim() || !f.value.trim()) err(`fact "${f.id}" has an empty label or value`);
  }
  for (const [what, ids] of [
    ["document", c.documents.map((d) => d.id)],
    ["question", c.questions.map((q) => q.id)],
    ["record", c.records.map((r) => r.id)],
    ["discrepancy", c.discrepancies.map((d) => d.id)],
    ["scan finding", c.scan.map((s) => s.id)],
  ] as const) {
    for (const id of duplicates(ids)) err(`duplicate ${what} id "${id}"`);
  }

  const minDocs = c.slot === "rare" ? 2 : 3;
  if (c.documents.length < minDocs) err(`needs at least ${minDocs} documents`);
  if (c.questions.length < 4) err("needs at least 4 questions");
  if (c.records.length < 1) err("needs at least 1 database record");
  if (c.scan.length < 1) err("needs at least 1 scan finding (use kind \"clean\" if nothing is hidden)");
  if (c.discrepancies.length < 4) err("needs at least 4 discrepancy entries");
  if (c.claims.length < 4) err("needs at least 4 claims");
  if (c.baseSuspicion < 0 || c.baseSuspicion > 100) err("baseSuspicion must be within 0-100");

  const pairs = new Set<string>();
  for (const d of c.discrepancies) {
    const [a, b] = d.facts;
    if (a === b) err(`discrepancy "${d.id}" compares a fact with itself`);
    for (const id of d.facts) {
      if (!factIds.has(id) && !globalFactIds.has(id)) err(`discrepancy "${d.id}" references unknown fact "${id}"`);
    }
    const key = [a, b].sort().join("|");
    if (pairs.has(key)) err(`discrepancy "${d.id}" duplicates another pair`);
    pairs.add(key);
  }

  for (const q of c.questions) {
    for (const t of q.requires ?? []) {
      if (!tokens.has(t)) err(`question "${q.id}" requires unknown token "${t}"`);
      if (t === `q:${q.id}`) err(`question "${q.id}" requires itself`);
    }
  }
  for (const e of c.eggs ?? []) {
    if (!tokens.has(e.on)) err(`egg "${e.id}" triggers on unknown token "${e.on}"`);
  }

  if (c.solution.clues.length < 3) err("solution needs at least 3 clues");
  if (c.solution.redHerrings.length < 1) err("solution needs at least 1 red herring");
  for (const t of [...c.solution.clues, ...c.solution.redHerrings]) {
    if (!tokens.has(t)) err(`solution references unknown token "${t}"`);
  }
  for (const t of c.solution.clues) {
    if (c.solution.redHerrings.includes(t)) err(`token "${t}" is both a clue and a red herring`);
  }

  const kindOf = new Map(c.discrepancies.map((d) => [`d:${d.id}`, d.kind]));
  const clueKinds = c.solution.clues.map((t) => kindOf.get(t));
  if (c.truth === "spy" && !clueKinds.includes("contradiction")) {
    err("a spy needs at least one contradiction among the clues");
  }
  if (c.truth === "innocent" && clueKinds.includes("contradiction")) {
    err("an innocent must not have an unexplained contradiction as a clue (use \"explained\" or \"match\")");
  }

  return errors;
}

export function validateDays(days: DayDef[]): string[] {
  const errors: string[] = [];
  const globalFactIds = new Set<string>();
  const caseIds: string[] = [];

  for (const day of [...days].sort((a, b) => a.day - b.day)) {
    for (const rec of day.directives) {
      for (const f of rec.facts) {
        if (!f.id.startsWith(`g.d${day.day}.`)) errors.push(`[day ${day.day}] directive fact "${f.id}" must start with "g.d${day.day}."`);
        globalFactIds.add(f.id);
      }
    }
    const regular = day.cases.filter((c) => c.slot === "regular");
    if (regular.length < 5) errors.push(`[day ${day.day}] needs at least 5 regular cases`);
    const spies = regular.filter((c) => c.truth === "spy").length;
    if (spies < 2 || spies > 3) errors.push(`[day ${day.day}] regular cases need 2-3 spies, found ${spies}`);
    if (day.jensenIdle.length < 8) errors.push(`[day ${day.day}] needs at least 8 jensenIdle lines`);
    for (const c of day.cases) {
      if (c.day !== day.day) errors.push(`[${c.id}] day field does not match its DayDef`);
      caseIds.push(c.id);
      errors.push(...validateCase(c, globalFactIds));
    }
  }
  for (const id of duplicates(caseIds)) errors.push(`duplicate case id "${id}"`);
  const recordIds = days.flatMap((d) => [...d.directives, ...d.cases.flatMap((c) => c.records)]).map((r) => r.id);
  for (const id of duplicates(recordIds)) errors.push(`duplicate database record id "${id}" (records are looked up by id across the whole day)`);
  return errors;
}
