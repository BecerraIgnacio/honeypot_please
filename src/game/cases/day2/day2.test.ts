import { describe, expect, it } from "vitest";
import { textBudgetErrors } from "../../textBudget";
import { validateDays } from "../../validate";
import { day2 } from "./index";

describe("day 2", () => {
  it("passes structural validation", () => {
    expect(validateDays([day2])).toEqual([]);
  });

  it("fits the text budget", () => {
    expect(textBudgetErrors([day2])).toEqual([]);
  });

  it("carries the rare case and the promised eggs", () => {
    expect(day2.cases.find((c) => c.slot === "rare")?.id).toBe("rare-trenchcoat");
    expect(day2.cases.flatMap((c) => c.eggs ?? []).map((e) => e.id).sort()).toEqual(["cuda-eula", "three-gpus-trenchcoat"]);
  });

  it("keeps the Vera Kessling details Day 5 calls back to", () => {
    const vera = day2.cases.find((c) => c.id === "vera-kessling");
    expect(vera?.truth).toBe("spy");
    expect(vera?.applicant.occupation).toBe("Investor relations associate, Lumen Bridge Capital");
    expect(vera?.applicant.bio).toContain("magnolia lapel pin");
    expect(vera?.applicant.portrait).toMatchObject({ accessories: ["pin", "lanyard"] });
    expect(vera?.documents.flatMap((d) => d.facts).find((f) => f.id === "vk-badge-no")?.value).toBe("LB-0417");
  });
});
