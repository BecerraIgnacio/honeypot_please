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
    "FROM: Dolores Vance, Head of Romantic Security",
    "RE: Operation Leather Jacket",
    "",
    "One of Mr. Huang's jackets is unaccounted for. Wardrobe designation J-27, 'Keynote Black'. It was last seen on a backstage rack at SAP Center on Tuesday at 1:40 PM. It has been worn exactly once. Mr. Huang has described this as the worst thing to happen to the company, including 2008.",
    "",
    "Yesterday the Board issued Notice BN-2027-032, which reads in full: 'The Board reaffirms its confidence in the garment's continued strategic optionality and is aligned on a path to re-wear.' Legal has read it four times. Investor Relations has read it nine. Nobody knows what it means. The stock fell 2%.",
    "",
    "Expect today: certificates for jackets that cannot have certificates, invitations to keynotes that are not happening, GPUs signed in colors Mr. Huang does not own, and at least one person who wishes to kneel. Kneeling is not a crime. Check the ink. Check the Ledger. Check the cuff.",
    "",
    "Three new directives are in the database. They supersede your instincts.",
    "",
    "Do not let anyone photograph Mr. Huang touching a jacket. That is how provenance is born.",
    "",
    "D. Vance",
    "P.S. If a jacket asks to speak with you, be polite. We have ruled nothing out.",
  ].join("\n"),
  directives: [
    {
      id: "d4-dir-ledger",
      category: "directive",
      title: "Directive 4-A: Wardrobe Ledger Certificates",
      keywords: ["directive 4-a", "wardrobe ledger", "certificate", "tj-", "memorabilia", "authentication", "office of wardrobe continuity"],
      facts: [
        { id: "g.d4.cert-format", label: "Valid jacket memorabilia certificate", value: "Serial TJ-#### issued by the Office of Wardrobe Continuity, Endeavor Building, and registered in the Wardrobe Ledger. Issued to date: TJ-0001 to TJ-0412." },
        { id: "g.d4.cert-retired", label: "Which jackets can be certified", value: "Retired jackets only. Jackets in active rotation are never certified." },
      ],
      body: "Any 'worn at GTC' item without a TJ serial is a souvenir at best. A certificate for a jacket still in rotation is not a certificate. It is a confession. Look up the serial: the Ledger says which item it belongs to.",
    },
    {
      id: "d4-dir-ink",
      category: "directive",
      title: "Directive 4-B: Signature Ink Protocol",
      keywords: ["directive 4-b", "ink", "signature", "signed gpu", "silver", "signing session"],
      facts: [
        { id: "g.d4.ink", label: "Mr. Huang's signature ink", value: "Silver paint marker. Only silver. Always silver." },
        { id: "g.d4.signing-session", label: "Authorized GTC 2027 signing sessions", value: "One: Tuesday March 16, 2027, Hall B, SAP Center, scheduled 2:00 to 3:30 PM" },
      ],
      body: "Mr. Huang has signed in silver since 2016 and regards other colors as a personal attack. Any 'Jensen-signed' item in gold, black or 'champagne' is not his.",
    },
    {
      id: "d4-dir-inventory",
      category: "directive",
      title: "Directive 4-C: Jacket Status and Board Correspondence",
      keywords: ["directive 4-c", "inventory", "jacket count", "missing jacket", "j-27", "board notice", "board signatory"],
      facts: [
        { id: "g.d4.inventory", label: "Jackets on the Wardrobe Ledger", value: "41 registered, 40 accounted for" },
        { id: "g.d4.missing", label: "Missing jacket", value: "J-27 'Keynote Black (GTC 2027)', in active rotation" },
        { id: "g.d4.last-seen", label: "J-27 last seen", value: "Backstage rack, SAP Center, Tuesday March 16, 2027, 1:40 PM PT" },
        { id: "g.d4.board-signatory", label: "Board notices", value: "Numbered BN-2027-### and signed by Hollis Prenn, Corporate Secretary" },
      ],
      body: "Anyone claiming to have J-27, to know where J-27 is, or to represent J-27 is to be checked against the Ledger before Mr. Huang is told. Mr. Huang is not to be told anything before 10 AM.",
    },
  ],
  cases: [hedda, odile, agnieszka, larissa, ada, rareJacket],
  jensenIdle: [
    "Forty jackets. I have forty jackets. I only want the one.",
    "They asked me if J-27 was insured. You can't insure a feeling.",
    "I wore it once. Some people get a lifetime. I got a keynote.",
    "The Board's statement used the word 'garment' eleven times. It never once said its name.",
    "If anyone offers you a jacket today, it isn't mine. Unless it is. Check the cuff.",
    "I keep reaching for the left pocket. There's nothing there. There was never anything there. Now there's less.",
    "The more you lose, the more you... no. That one doesn't work.",
    "Every signed GPU on resale sites today says 'worn at GTC'. GPUs don't wear things.",
    "Somebody leaked a photo of the empty rack. A rack. They leaked my grief's furniture.",
    "I'm fine. This is my fine voice. CUDA has a fine voice too. It's called a warning.",
    "Don't let anyone photograph me touching a cuff. That's how provenance happens.",
    "Market's down two percent. It's not the market. It's the jacket.",
    "Security, if a jacket walks in here, do not laugh at it. I mean it.",
  ],
};
