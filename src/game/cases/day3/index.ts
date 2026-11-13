import type { DayDef } from "../../types";
import { adaezeNwosu } from "./adaeze-nwosu";
import { celesteArbour } from "./celeste-arbour";
import { ingridSolvang } from "./ingrid-solvang";
import { maricelDizon } from "./maricel-dizon";
import { valentinaRuizOcampo } from "./valentina-ruiz-ocampo";

export const day3: DayDef = {
  day: 3,
  title: "The AI Arms Race",
  briefing: `MEMO, RPC-7
FROM: Dolores Vance, Head of Romantic Security
DATE: Wednesday, March 17, 2027
RE: Photographs are over

Overnight the lobby printer produced 212 photos of Jensen with women he has never met, including one on the Moon, at a Costco. A photo is now a suggestion, not evidence. Today's directives say what turns it back into one.

I have not slept.
D. Vance`,
  directives: [
    {
      id: "d3-dir-provenance",
      category: "directive",
      title: "Directive 3-A: Photographic Provenance",
      keywords: ["directive 3-a", "provenance", "photo", "photos", "registry", "photo registry", "epr", "hash"],
      facts: [
        { id: "g.d3.epr-rule", label: "Photo rule", value: "Photos of Jensen need an EPR hash listed in the registry" },
        { id: "g.d3.epr-format", label: "EPR hash format", value: "EPR-YYMMDD-NNNN (capture date, then serial)" },
        { id: "g.d3.epr-start", label: "Registry in service since", value: "January 2, 2024. No valid hash predates it." },
      ],
      body: "The hash certifies the capture, not the pixels and not the caption. Filters applied later do not void it. An event that never happened cannot be registered.",
    },
    {
      id: "d3-dir-keynote",
      category: "directive",
      title: "Directive 3-B: Keynote Window",
      keywords: ["directive 3-b", "keynote", "sap center", "march 16", "backstage", "press q&a", "media room"],
      facts: [
        { id: "g.d3.keynote-window", label: "Keynote, March 16, 2027", value: "10:00-12:07 PT. Jensen on stage the entire time, no breaks." },
        { id: "g.d3.keynote-venue", label: "Keynote venue", value: "SAP Center, San Jose" },
        { id: "g.d3.press-qa", label: "Post-keynote press Q&A", value: "12:30-13:20 PT, SAP Center Media Room B" },
      ],
      body: "Any claim of meeting Jensen between 10:00 and 12:07 PT on March 16 is false. He was on stage. The footage includes 11 minutes of him holding a wafer.",
    },
    {
      id: "d3-dir-announced",
      category: "directive",
      title: "Directive 3-C: What Was Actually Announced",
      keywords: ["directive 3-c", "announced", "announcement", "rubin", "rubin ultra", "feynman", "vera", "dgx spark", "vram", "roadmap"],
      facts: [
        { id: "g.d3.announced", label: "Announced at the keynote", value: "Rubin Ultra NVL576, Vera CPU, DGX Spark 2, the name 'Feynman'" },
        { id: "g.d3.rubin-ultra-mem", label: "Rubin Ultra memory", value: "1 TB HBM4E per package" },
        { id: "g.d3.feynman-secret", label: "Feynman details", value: "Name only. No part numbers, specs or tape-out dates public." },
      ],
      body: "Knowing more than the keynote said is a flag. Knowing less is normal. Being wrong about VRAM is embarrassing but is not a security event.",
    },
  ],
  cases: [maricelDizon, ingridSolvang, adaezeNwosu, celesteArbour, valentinaRuizOcampo],
  jensenIdle: [
    "I watched my keynote back. On the second viewing I had six fingers. Was it always six?",
    "My office mirror might be a monitor. IT says it is a mirror. A monitor would say that.",
    "Every photo of me is fake now. Including, I suspect, me.",
    "If someone deepfakes me on stage, does the stock go up? Asking for the Board.",
    "I counted the lapels on the jacket. Two. Again. Two. I do not trust the second count.",
    "Someone rendered me holding a wafer we have not taped out. I want that wafer.",
    "Dolores has not slept. I have not slept. The jacket sleeps. The jacket always sleeps.",
    "A woman showed me a photo of us in Paris. The jacket was smiling. The jacket hates Paris.",
    "A GPU I made is rendering me proposing to it. That is not irony. That is utilization.",
    "Frame 81,204 of the keynote footage. I blink wrong. Who blinks like that? Maybe me.",
    "Show me a photo, I show you a hash. Show me a hash, I show you Dolores crying.",
    "The more you generate, the less you can believe.",
  ],
};
