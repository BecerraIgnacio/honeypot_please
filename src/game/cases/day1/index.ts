import type { DayDef, DbRecord } from "../../types";
import { adaezeOkonkwo } from "./adaeze-okonkwo";
import { chloeAshworth } from "./chloe-ashworth";
import { harperVale } from "./harper-vale";
import { luciaFerrante } from "./lucia-ferrante";
import { maeveDonnelly } from "./maeve-donnelly";
import { rare5090Wig } from "./rare-5090-wig";

const directives: DbRecord[] = [
  {
    id: "dir-d1-identity",
    category: "directive",
    title: "Directive 1-A: Identity Documents",
    keywords: ["directive", "1-a", "id", "identity", "expiry", "expired", "expiration", "name", "name change", "license", "licence", "passport"],
    facts: [
      { id: "g.d1.today", label: "Today's date", value: "Monday, March 15, 2027" },
      { id: "g.d1.id-expiry", label: "ID validity", value: "ID must be unexpired as of March 15, 2027" },
      { id: "g.d1.id-name", label: "Name on ID", value: "Must match stated name, unless a legal name change is shown" },
    ],
    body: "Every applicant presents one government- or manufacturer-issued ID. If her stated name differs, she needs a court document. 'It's my brand name' is not a court.",
  },
  {
    id: "dir-d1-gtc",
    category: "directive",
    title: "Directive 1-B: GTC 2027 Passes",
    keywords: ["directive", "1-b", "gtc", "gtc27", "pass", "conference", "registration", "attendee", "speaker"],
    facts: [
      { id: "g.d1.gtc-format", label: "GTC 2027 pass format", value: "GTC27-###### (exactly six digits)" },
      { id: "g.d1.gtc-issuer", label: "GTC pass issuer", value: "NVIDIA GTC Registration" },
      { id: "g.d1.gtc-dates", label: "GTC 2027 dates", value: "March 15-19, 2027, San Jose" },
    ],
    body: "A valid pass proves someone paid for a conference, not that she is who she says. Check the name on it. Keynote: Tuesday, March 16, 10:00 AM PT, SAP Center.",
  },
  {
    id: "dir-d1-badge",
    category: "directive",
    title: "Directive 1-C: NVIDIA Employee Badges",
    keywords: ["directive", "1-c", "badge", "employee", "nv", "endeavor", "endeavor security office", "security office", "staff"],
    facts: [
      { id: "g.d1.badge-format", label: "Employee badge format", value: "NV-#####-X (five digits, one letter)" },
      { id: "g.d1.badge-issuer", label: "Badge issuer", value: "Endeavor Security Office" },
    ],
    body: "Badges come from Endeavor Security Office and no one else. Check the number in the employee database. Employees are the easiest thing to fake. Nobody knows all forty thousand.",
  },
];

export const day1: DayDef = {
  day: 1,
  title: "A Simple Date",
  briefing: [
    "FROM: Dolores Vance, Head of Romantic Security",
    "RE: Your first day",
    "",
    "It is GTC week. Everyone who wants five minutes with the CEO has worked out that the fastest way onto his calendar is to ask him out.",
    "",
    "Weird is not a crime. Nervous is not a crime. A crime is two facts that cannot both be true.",
    "",
    "Today's rules: search 'directive'.",
    "",
    "D.V.",
  ].join("\n"),
  directives,
  cases: [chloeAshworth, maeveDonnelly, luciaFerrante, harperVale, adaezeOkonkwo, rare5090Wig],
  jensenIdle: [
    "Five trillion dollars, and I wait in my own lobby.",
    "The Jacket is fine. The Jacket is always fine. Stop asking about the Jacket.",
    "If she's a ten, I'm an asset. I'm told that's a compliment. Legal says it isn't.",
    "Dolores says one spy and it's over. I said that's strong. She said it's a technical term.",
    "Every date is a supply chain. The more you vet, the more you save.",
    "Someone in the lobby is humming the keynote music. Oh. It's me.",
    "I'm not paranoid. I'm vertically integrated.",
    "My personality is CUDA. Twenty years of backward compatibility. Who else offers that?",
    "The Board wants my love life to show predictable quarterly growth.",
    "Tomorrow I keynote. Today I am emotionally available. Within reason. Within allocation.",
    "Everyone looks at the Jacket first. I've made my peace with it. Mostly.",
    "Security offered me coffee. I asked who made it. That's a normal Monday question.",
  ],
};
