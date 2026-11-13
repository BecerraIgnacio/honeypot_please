import { describe, expect, it } from "vitest";
import { textBudgetErrors } from "../textBudget";
import { validateDays } from "../validate";
import { DAYS } from "./index";

const REQUIRED_EGGS = [
  "keynote-savant",
  "gpu-in-a-wig",
  "three-gpus-trenchcoat",
  "cuda-eula",
  "rocm-heresy",
  "doom-doc",
  "h100-wedding",
  "jacket-memo",
  "sentient-jacket",
  "export-waiver",
];

describe("case content", () => {
  it("passes structural validation across all five days", () => {
    expect(validateDays(DAYS)).toEqual([]);
  });

  it("stays inside the text budget", () => {
    expect(textBudgetErrors(DAYS)).toEqual([]);
  });

  it("has at least 20 fully designed applicants", () => {
    expect(DAYS.flatMap((d) => d.cases).length).toBeGreaterThanOrEqual(20);
  });

  it("attaches every promised easter egg to a case", () => {
    const eggIds = DAYS.flatMap((d) => d.cases).flatMap((c) => (c.eggs ?? []).map((e) => e.id));
    for (const id of REQUIRED_EGGS) expect(eggIds).toContain(id);
  });

  it("ends day five with a finale", () => {
    expect(DAYS[4].cases.filter((c) => c.slot === "finale")).toHaveLength(1);
  });

  it("keeps the Vera Kessling callback details exact", () => {
    const vera = DAYS[1].cases.find((c) => c.id === "vera-kessling");
    expect(vera?.truth).toBe("spy");
    expect(JSON.stringify(vera)).toContain("LB-0417");
  });
});
