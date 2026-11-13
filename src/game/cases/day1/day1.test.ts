import { describe, expect, it } from "vitest";
import { validateDays } from "../../validate";
import { day1 } from "./index";

describe("day 1", () => {
  it("passes structural validation", () => {
    expect(validateDays([day1])).toEqual([]);
  });

  it("opens with the tutorial and carries the required rare case and eggs", () => {
    expect(day1.cases[0].id).toBe("d1-chloe-ashworth");
    expect(day1.cases.find((c) => c.slot === "rare")?.id).toBe("rare-5090-wig");
    expect(day1.cases.flatMap((c) => c.eggs ?? []).map((e) => e.id).sort()).toEqual(["gpu-in-a-wig", "keynote-savant"]);
  });
});
