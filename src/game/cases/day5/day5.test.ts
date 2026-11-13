import { describe, expect, it } from "vitest";
import { validateDays } from "../../validate";
import { day5 } from "./index";

describe("day 5", () => {
  it("passes structural validation", () => {
    expect(validateDays([day5])).toEqual([]);
  });

  it("has one finale, the tampered-database case", () => {
    expect(day5.cases.filter((c) => c.slot === "finale").map((c) => c.id)).toEqual(["d5-luzia-ferraz"]);
  });

  it("hides the export-waiver egg on the form-number comparison", () => {
    const eggs = day5.cases.flatMap((c) => (c.eggs ?? []).map((e) => [c.id, e.id, e.on]));
    expect(eggs).toEqual([["d5-isadora-quintela", "export-waiver", "d:iq-form-waiver"]]);
  });

  it("keeps database record ids unique across the whole day", () => {
    const ids = [...day5.directives, ...day5.cases.flatMap((c) => c.records)].map((r) => r.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });
});
