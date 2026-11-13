import { describe, expect, it } from "vitest";
import { validateDays } from "../../validate";
import { day4 } from "./index";

describe("day 4: Operation Leather Jacket", () => {
  it("passes structural validation", () => {
    expect(validateDays([day4])).toEqual([]);
  });

  it("ships the required eggs and the rare jacket", () => {
    const eggIds = day4.cases.flatMap((c) => (c.eggs ?? []).map((e) => e.id)).sort();
    expect(eggIds).toEqual(["jacket-memo", "sentient-jacket"]);

    const rare = day4.cases.find((c) => c.id === "rare-jacket");
    expect(rare?.slot).toBe("rare");
    expect(rare?.applicant.portrait).toEqual({ kind: "special", id: "sentient-jacket" });
  });
});
