import type { DayDef } from "../../types";
import { ada } from "./ada";
import { agnieszka } from "./agnieszka";
import { hedda } from "./hedda";
import { larissa } from "./larissa";
import { odile } from "./odile";
import { rareJacket } from "./rare-jacket";

export const day4: DayDef = {
  day: 4,
  title: "Operation Leather Jacket",
  briefing: [
    "MEMO: RPC-7 MORNING BRIEFING",
    "Thursday, March 18, 2027",
    "FROM: Dolores Vance",
    "",
    "Jacket J-27, 'Keynote Black', is missing. Last seen backstage at SAP Center, Tuesday 1:40 PM. Worn once. Mr. Huang calls it the worst thing to happen to the company, including 2008.",
    "",
    "Three new directives are in the database. They supersede your instincts.",
    "",
    "D. Vance",
  ].join("\n"),
  directives: [
    {
      id: "d4-dir-ledger",
      category: "directive",
      title: "Directive 4-A: Wardrobe Ledger Certificates",
      keywords: ["directive 4-a", "wardrobe ledger", "certificate", "tj-", "memorabilia", "authentication", "office of wardrobe continuity"],
      facts: [
        { id: "g.d4.cert-format", label: "Valid certificate", value: "TJ-####, Office of Wardrobe Continuity. Issued: TJ-0001 to 0412" },
        { id: "g.d4.cert-retired", label: "Certifiable jackets", value: "Retired jackets only. Never jackets in active rotation." },
      ],
      body: "No TJ serial, no certificate. A certificate for a jacket in rotation is a confession. Search the serial: the Ledger says which item it belongs to.",
    },
    {
      id: "d4-dir-ink",
      category: "directive",
      title: "Directive 4-B: Signature Ink Protocol",
      keywords: ["directive 4-b", "ink", "signature", "signed gpu", "silver", "signing session"],
      facts: [
        { id: "g.d4.ink", label: "Mr. Huang's signature ink", value: "Silver paint marker. Only silver. Always silver." },
        { id: "g.d4.signing-session", label: "Only GTC signing session", value: "Tuesday March 16, 2027, Hall B, SAP Center, 2:00 to 3:30 PM" },
      ],
      body: "Mr. Huang has signed in silver since 2016 and regards other colors as a personal attack. Any 'Jensen-signed' item in gold, black or 'champagne' is not his.",
    },
    {
      id: "d4-dir-inventory",
      category: "directive",
      title: "Directive 4-C: Jacket Status and Board Correspondence",
      keywords: ["directive 4-c", "inventory", "jacket count", "missing jacket", "j-27", "board notice", "board signatory"],
      facts: [
        { id: "g.d4.inventory", label: "Jackets on the Ledger", value: "41 registered, 40 accounted for" },
        { id: "g.d4.missing", label: "Missing jacket", value: "J-27 'Keynote Black (GTC 2027)', in active rotation" },
        { id: "g.d4.last-seen", label: "J-27 last seen", value: "Backstage rack, SAP Center, Tuesday March 16, 2027, 1:40 PM PT" },
        { id: "g.d4.board-signatory", label: "Board notices", value: "BN-2027-###, signed by Hollis Prenn, Corporate Secretary" },
      ],
      body: "Anyone claiming to have J-27, know where it is, or represent it is checked against the Ledger before Mr. Huang is told. He is not told anything before 10 AM.",
    },
  ],
  cases: [hedda, odile, agnieszka, larissa, ada, rareJacket],
  jensenIdle: [
    "Forty jackets. I have forty jackets. I only want the one.",
    "They asked me if J-27 was insured. You can't insure a feeling.",
    "I wore it once. Some people get a lifetime. I got a keynote.",
    "The Board's statement used the word 'garment' eleven times. It never once said its name.",
    "If anyone offers you a jacket today, it isn't mine. Unless it is. Check the cuff.",
    "I keep reaching for the left pocket. There was never anything there. Now there's less.",
    "The more you lose, the more you... no. That one doesn't work.",
    "Every signed GPU on resale sites today says 'worn at GTC'. GPUs don't wear things.",
    "Somebody leaked a photo of the empty rack. A rack. They leaked my grief's furniture.",
    "I'm fine. This is my fine voice. CUDA has a fine voice too. It's called a warning.",
    "Don't let anyone photograph me touching a cuff. That's how provenance happens.",
    "Market's down two percent. It's not the market. It's the jacket.",
    "Security, if a jacket walks in here, do not laugh at it. I mean it.",
  ],
};
