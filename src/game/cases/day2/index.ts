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
      { id: "g.d2.badge-format", label: "Employee badge number format", value: "NV-#####-X (five digits, one letter)" },
      { id: "g.d2.badge-issuer", label: "Sole issuer of every Endeavor badge, employee or visitor", value: "Endeavor Security Office" },
    ],
    body: "Effective Tuesday, March 16, 2027. Every badge valid inside Endeavor is printed by the Endeavor Security Office and by nobody else. That now includes visitor badges. 'Endeavor' followed by a pleasant noun is not the Endeavor Security Office. When an employee badge is replaced, the five digits stay and the check letter changes. A replaced badge is a reprint, not a forgery. Look it up.",
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
    body: "A visitor is somebody's guest. Search the host. Hosts are people, and people have badge swipes, managers, and out-of-office replies. Nobody gets into the keynote wings by visitor badge, letter, or charm.",
  },
  {
    id: "dir-d2-allocation",
    category: "directive",
    title: "Directive 2-C: Allocation Is Not Romance",
    keywords: ["directive", "2-c", "allocation", "chip allocation", "allocation desk", "aq-9", "h100", "order", "purchase order", "dowry", "proposal", "building e"],
    facts: [
      { id: "g.d2.allocation-channel", label: "Chip-allocation requests", value: "Never processed at RPC-7, however romantic. Allocation Desk, Building E, form AQ-9 only" },
    ],
    body: "Allocation is a queue, not a feeling. If a proposal has line items, it is a purchase order. If a love letter has a delivery date, it is a purchase order. One person buying one graphics card for herself is a shopping trip, not an allocation, and is also not our problem.",
  },
];

export const day2: DayDef = {
  day: 2,
  title: "Corporate Espionage",
  briefing: [
    "MEMO: ROMANTIC PERIMETER CHECKPOINT 7",
    "FROM: Dolores Vance, Head of Romantic Security",
    "DATE: Tuesday, March 16, 2027",
    "RE: Yesterday",
    "",
    "Yesterday went fine. I have worked in security for twenty-two years, and days do not go fine. A day goes fine when somebody needs you relaxed for the next one.",
    "",
    "Today is the keynote. 10:00 AM, SAP Center. Every fund, founder, scalper and rival startup with a travel budget is within twenty miles of this desk, and all of them have a lanyard.",
    "",
    "The badge rules start today. Directives 2-A to 2-C are in the database; search 'directive'. In short:",
    "- A real badge comes from the Endeavor Security Office. Only from there. That now includes visitor badges.",
    "- A visitor badge names an internal host. Look the host up. Hosts are people. People have badge swipes.",
    "- Chip allocation does not go through romance. It goes to Building E, form AQ-9. If anyone proposes and the proposal has line items, call me.",
    "",
    "Badges get reprinted. Printers misbehave. A strange badge on a real employee is a Facilities problem, not a spy. Check before you decide.",
    "",
    "You still have two scans. Spend them like they cost what the vendor invoices for them.",
    "",
    "Make sure Mr. Huang drinks water before ten.",
    "",
    "D.V.",
  ].join("\n"),
  directives,
  cases: [veraKessling, magdalenaWisniewska, delphineArceneaux, rozAchterberg, imogenThwaite, rareTrenchcoat],
  jensenIdle: [
    "Keynote at ten. I have rehearsed the jacket reveal forty times. The jacket has rehearsed it forty-one.",
    "Yesterday nobody tried to steal anything. That is exactly what a thief would arrange.",
    "Badge numbers have five digits. Five. A hand has five fingers. Hands hold badges. It connects. I don't know how yet.",
    "Every scalper on Earth is in San Jose today. I can hear them refreshing.",
    "Three people this morning said 'long-term'. Long-term what? Position? Relationship? At this valuation it's the same word.",
    "The confidence monitor goes live at ten. If anyone asks where it is, they already know where it is.",
    "Dolores says hydrate. Dolores said Monday was fine. I'm not saying Dolores is compromised. I'm saying she's very hydrated.",
    "They all want the Rubin date. I want the Rubin date. Nobody has told me the Rubin date.",
    "The Jacket is quiet. The Jacket is never quiet on keynote day. The Jacket knows something.",
    "Somebody else has a keynote this week. Nobody is trying to date them. Think about what that means.",
    "Every lanyard is a network. Who controls the lanyards? Facilities. Who controls Facilities? I need to sit down.",
    "I said 'the more you buy, the more you save' into the mirror this morning. The mirror bought nothing. Suspicious.",
  ],
};
