import type { DayDef, DbRecord } from "../../types";
import { delphineArceneaux } from "./delphine-arceneaux";
import { imogenThwaite } from "./imogen-thwaite";
import { magdalenaWisniewska } from "./magdalena-wisniewska";
import { rareTrenchcoat } from "./rare-trenchcoat";
import { rozAchterberg } from "./roz-achterberg";
import { veraKessling } from "./vera-kessling";

const directives: DbRecord[] = [
  {
    id: "dir-d2-badges",
    category: "directive",
    title: "Directive 2-A: Badge Standard, Visitors Included",
    keywords: ["directive", "2-a", "badge", "badges", "nv", "format", "issuer", "endeavor security office", "security office", "forged", "reissue", "reprint", "check letter"],
    facts: [
      { id: "g.d2.badge-format", label: "Employee badge format", value: "NV-#####-X (five digits, one letter)" },
      { id: "g.d2.badge-issuer", label: "Sole badge issuer", value: "Endeavor Security Office" },
    ],
    body: "The Endeavor Security Office prints every badge, visitors included. 'Endeavor' plus a pleasant noun is not it. A reprint keeps the five digits and changes the letter.",
  },
  {
    id: "dir-d2-visitors",
    category: "directive",
    title: "Directive 2-B: Visitors on Keynote Day",
    keywords: ["directive", "2-b", "visitor", "visitors", "visitor badge", "host", "internal host", "keynote", "sap center", "escort"],
    facts: [
      { id: "g.d2.visitor-host", label: "Visitor badge host", value: "Must name an internal host holding an active NV badge" },
      { id: "g.d2.visitor-day", label: "Visitor badge validity", value: "Printed on the day of the visit. Valid that day only" },
      { id: "g.d2.keynote", label: "GTC 2027 keynote", value: "Tuesday March 16, 10:00 AM PT, SAP Center, San Jose" },
    ],
    body: "A visitor is somebody's guest. Search the host. Hosts have badge swipes and out-of-office replies. Nobody gets into the keynote wings by letter or charm.",
  },
  {
    id: "dir-d2-allocation",
    category: "directive",
    title: "Directive 2-C: Allocation Is Not Romance",
    keywords: ["directive", "2-c", "allocation", "chip allocation", "allocation desk", "aq-9", "h100", "order", "purchase order", "dowry", "proposal", "building e"],
    facts: [
      { id: "g.d2.allocation-channel", label: "Chip-allocation requests", value: "Allocation Desk, Building E, form AQ-9. Never at RPC-7" },
    ],
    body: "Allocation is a queue, not a feeling. A love letter with a delivery date is a purchase order. One person buying one card for herself is a shopping trip.",
  },
];

export const day2: DayDef = {
  day: 2,
  title: "Corporate Espionage",
  briefing: [
    "FROM: Dolores Vance, Head of Romantic Security",
    "",
    "Yesterday went fine. In twenty-two years, a day has gone fine only when somebody needed me relaxed for the next one.",
    "",
    "Today is the keynote. New badge rules start now, visitor badges included. Search 'directive'.",
    "",
    "Make sure Mr. Huang drinks water before ten.",
    "",
    "D.V.",
  ].join("\n"),
  directives,
  cases: [veraKessling, magdalenaWisniewska, delphineArceneaux, rozAchterberg, imogenThwaite, rareTrenchcoat],
  jensenIdle: [
    "Keynote at ten. I rehearsed the jacket reveal forty times. The jacket did forty-one.",
    "Yesterday nobody tried to steal anything. That is exactly what a thief would arrange.",
    "Five digits. Five fingers. Hands hold badges. It connects. I don't know how yet.",
    "Every scalper on Earth is in San Jose today. I can hear them refreshing.",
    "Three people said 'long-term' today. Position? Relationship? At this valuation, same word.",
    "The confidence monitor goes live at ten. Anyone who asks where it is already knows.",
    "Dolores said Monday was fine. Not saying she's compromised. Saying she's very hydrated.",
    "They all want the Rubin date. I want the Rubin date. Nobody has told me the Rubin date.",
    "The Jacket is quiet. The Jacket is never quiet on keynote day. The Jacket knows something.",
    "Somebody else has a keynote this week. Nobody is trying to date them. Think about that.",
    "Who controls the lanyards? Facilities. Who controls Facilities? I need to sit down.",
    "I said 'the more you buy, the more you save' to the mirror. It bought nothing. Suspicious.",
  ],
};
