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

As of 03:14 this morning, a photograph is no longer evidence. It is a suggestion.

Overnight the lobby printer produced 212 images of Jensen with women he has never met, in cities he has never visited, including one on the Moon, at what appears to be a Costco. Fourteen of them carried provenance hashes. Some of those hashes were even real.

Effective immediately: any photo with Jensen in it must carry an Endeavor Photo Registry hash, and the hash must be in the registry. A registered photo proves an event happened. It does not prove that anything written on the back of it did. Read the back anyway. Then check it.

Second: yesterday's keynote ran from 10:00 to 12:07 at SAP Center, and Jensen was on stage for all of it. I have the footage. I have watched the footage. I have watched it more times than any human should watch a man hold a wafer.

Third: the attached list is everything we announced. If an applicant knows more than the list, I want to know why. If she knows less, or gets the VRAM wrong, that is called being a person.

The scanner is good at spotting generated images today. You still get two scans. Do not spend one on a badge just because it is doing something weird.

I have not slept. I have had four coffees and one experience with the vending machine that I will not be putting in writing.

D. Vance`,
  directives: [
    {
      id: "d3-dir-provenance",
      category: "directive",
      title: "Directive 3-A: Photographic Provenance",
      keywords: ["directive 3-a", "provenance", "photo", "photos", "registry", "photo registry", "epr", "hash"],
      facts: [
        { id: "g.d3.epr-rule", label: "Photo rule", value: "Any photo showing Jensen must carry an EPR hash listed in the Endeavor Photo Registry" },
        { id: "g.d3.epr-format", label: "EPR hash format", value: "EPR-YYMMDD-NNNN (capture date, then serial)" },
        { id: "g.d3.epr-start", label: "Registry in service since", value: "January 2, 2024. No valid hash predates it." },
      ],
      body: "The hash certifies the capture event, not the pixels. Filters, crops and stickers applied later do not void a registered photo. The registry does not accept imagination: an event that never happened cannot be registered.",
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
      body: "Any claim of meeting Jensen anywhere between 10:00 and 12:07 PT on March 16 is false. He was on stage. Footage: 2 hours 7 minutes, including 11 minutes of holding a wafer at various angles.",
    },
    {
      id: "d3-dir-announced",
      category: "directive",
      title: "Directive 3-C: What Was Actually Announced",
      keywords: ["directive 3-c", "announced", "announcement", "rubin", "rubin ultra", "feynman", "vera", "dgx spark", "vram", "roadmap"],
      facts: [
        { id: "g.d3.announced", label: "Announced at the keynote", value: "Rubin Ultra NVL576, Vera CPU, DGX Spark 2, and the name 'Feynman'" },
        { id: "g.d3.rubin-ultra-mem", label: "Rubin Ultra memory (public)", value: "1 TB HBM4E per package" },
        { id: "g.d3.feynman-secret", label: "Feynman details", value: "Name only. No part numbers, memory specs or tape-out dates are public." },
      ],
      body: "Knowing more than the keynote said is a flag. Knowing less is normal. Being wrong about VRAM is embarrassing but is not a security event.",
    },
  ],
  cases: [maricelDizon, ingridSolvang, adaezeNwosu, celesteArbour, valentinaRuizOcampo],
  jensenIdle: [
    "I watched my keynote back. Twice. On the second viewing I had six fingers. Was it always six?",
    "The mirror in my office might be a monitor. I asked IT. They said it was always a mirror. That is exactly what a monitor would say.",
    "Every photo of me is fake now. Including, I suspect, me.",
    "If someone deepfakes me on stage, does the stock go up? Asking for the Board.",
    "I counted the lapels on the jacket. Two. I counted again. Two. I do not trust the second count.",
    "Someone rendered me holding a wafer we have not taped out yet. It looked good. I want that wafer.",
    "Dolores has not slept. I have not slept. The jacket sleeps. The jacket always sleeps.",
    "A woman showed me a photo of us in Paris. I knew it was fake because the jacket was smiling. The jacket hates Paris.",
    "Somewhere a GPU I made is generating a picture of me proposing to it. That is not irony. That is utilization.",
    "Frame 81,204 of the keynote footage. I blink wrong. Who blinks like that? Not me. Maybe me.",
    "Show me a photo and I will show you a hash. Show me a hash and I will show you Dolores crying.",
    "The more you generate, the less you can believe.",
  ],
};
