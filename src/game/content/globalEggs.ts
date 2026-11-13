import type { EasterEgg } from "../types";

/** Egg ids that case writers attach to their cases. Each one has an achievement. */
export const CASE_EGG_IDS = [
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
] as const;

export const GLOBAL_EGGS: EasterEgg[] = [
  {
    id: "search-doom",
    title: "It Runs Doom",
    toast: "The security database now runs Doom. Dolores has been notified. Dolores is on E1M3.",
    on: "search:doom",
  },
  {
    id: "search-amd",
    title: "Said With Affection",
    toast: "Query logged: AMD. Tone of query: affectionate. The CEO has been informed and is pacing.",
    on: "search:amd",
  },
  {
    id: "search-rocm",
    title: "Heresy Detected",
    toast: "ROCm query detected. Your CUDA entitlement has been placed under review.",
    on: "search:rocm",
  },
  {
    id: "search-more-you-buy",
    title: "The More You Search",
    toast: "The more you search, the more you save. That is not how databases work. It is now.",
    on: "search:the more you buy",
  },
  {
    id: "search-jensen",
    title: "Know Thyself",
    toast: "You searched the CEO. The CEO's file searched you back.",
    on: "search:jensen",
  },
  {
    id: "search-dolores",
    title: "She Already Knows",
    toast: "Dolores Vance has seen your search. She is not upset. She is drafting a memo about it.",
    on: "search:dolores",
  },
  {
    id: "search-sudo",
    title: "Not In The Sudoers File",
    toast: "jensen is not in the sudoers file. This incident will be reported to The Jacket.",
    on: "search:sudo",
  },
  {
    id: "search-agi",
    title: "AGI Achieved Internally",
    toast: "AGI has been achieved internally. ETA for externally: next quarter, rolling.",
    on: "search:agi",
  },
  {
    id: "ui-jacket-clicks",
    title: "Do Not Touch The Jacket",
    toast: "You have touched The Jacket ten times. The Jacket remembers every one.",
    on: "ui:jacket-clicks",
  },
  {
    id: "ui-konami",
    title: "Up Up Down Down Due Diligence",
    toast: "Cheat code accepted. There are no cheats in romantic security. +0 lives.",
    on: "ui:konami",
  },
  {
    id: "ui-idle",
    title: "Staring Contest",
    toast: "Sixty seconds of silence. The applicant has started inspecting your documents instead.",
    on: "ui:idle",
  },
  {
    id: "ui-scan-empty",
    title: "Pressing Harder Does Not Help",
    toast: "Scanner empty. Scanner still empty. Scanner has filed a complaint with HR.",
    on: "ui:scan-empty",
  },
  {
    id: "ui-stamp-spam",
    title: "Stamp Enjoyer",
    toast: "You stamped the title screen into a fine paste. REJECTED: the concept of waiting.",
    on: "ui:stamp-spam",
  },
];
