import { describe, expect, it } from "vitest";
import { validateDays } from "../../validate";
import { day3 } from "./index";

describe("day 3", () => {
  it("passes structural validation", () => {
    expect(validateDays([day3])).toEqual([]);
  });

  it("defines the three day-3 easter eggs", () => {
    const eggs = day3.cases.flatMap((c) => (c.eggs ?? []).map((e) => e.id)).sort();
    expect(eggs).toEqual(["doom-doc", "h100-wedding", "rocm-heresy"]);
  });
});
