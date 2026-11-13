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
      { id: "g.d1.id-name", label: "Name on ID", value: "Must match the stated name exactly, unless a legal name-change document is presented" },
    ],
    body: "Every applicant presents one government or manufacturer-issued ID. If the name she gives you is not the name on the ID, she needs a document from a court explaining why. 'It's my brand name' is not a court.",
  },
  {
    id: "dir-d1-gtc",
    category: "directive",
    title: "Directive 1-B: GTC 2027 Passes",
    keywords: ["directive", "1-b", "gtc", "gtc27", "pass", "conference", "registration", "attendee", "speaker"],
    facts: [
      { id: "g.d1.gtc-format", label: "GTC 2027 pass number format", value: "GTC27- followed by exactly six digits (GTC27-######)" },
      { id: "g.d1.gtc-issuer", label: "GTC pass issuer", value: "NVIDIA GTC Registration" },
      { id: "g.d1.gtc-dates", label: "GTC 2027 dates", value: "March 15-19, 2027, San Jose. Keynote Tuesday, March 16, 10:00 AM PT, SAP Center" },
    ],
    body: "A valid pass proves someone paid for a conference. It does not prove she is who she says she is. Check the name on it.",
  },
  {
    id: "dir-d1-badge",
    category: "directive",
    title: "Directive 1-C: NVIDIA Employee Badges",
    keywords: ["directive", "1-c", "badge", "employee", "nv", "endeavor", "endeavor security office", "security office", "staff"],
    facts: [
      { id: "g.d1.badge-format", label: "Employee badge number format", value: "NV-#####-X (five digits, one letter)" },
      { id: "g.d1.badge-issuer", label: "Badge issuer", value: "Endeavor Security Office" },
    ],
    body: "Employee badges are issued by Endeavor Security Office and by no one else. A badge number can be checked against the employee database. Do it. Employees are the easiest thing to pretend to be, because nobody knows all forty thousand of them.",
  },
];

export const day1: DayDef = {
  day: 1,
  title: "A Simple Date",
  briefing: [
    "MEMO: ROMANTIC PERIMETER CHECKPOINT 7",
    "FROM: Dolores Vance, Head of Romantic Security",
    "DATE: Monday, March 15, 2027",
    "RE: Your first day",
    "",
    "Welcome to RPC-7. It is GTC week. Every scalper, rival startup, hedge fund and micro-state on Earth wants five minutes with the CEO, and they have all worked out that the fastest way onto his calendar is to ask him out.",
    "",
    "Your job is to decide who gets the date. Read her documents. Compare any two facts and the terminal will tell you whether they conflict. Ask her questions. Search the database by name, badge number, employer, anything. You have two advanced scans per day. Spend them like they cost money, because they do.",
    "",
    "Accept one spy and it is over. Not a setback. Over. The Board has the press release drafted and it is very long.",
    "",
    "Reject too many genuine applicants and Romantic Stability collapses. When Romantic Stability collapses, he starts talking to the Jacket about his feelings, and the Jacket does not have the bandwidth.",
    "",
    "Some notes from experience. Weird is not a crime. Nervous is not a crime. Being from somewhere is not a crime. Knowing a lot about GPUs is, in this building, the baseline. A crime is two facts that cannot both be true.",
    "",
    "Today's directives are in the database. Search 'directive'.",
    "",
    "Coffee is in the break room. Do not accept coffee from applicants.",
    "",
    "D.V.",
  ].join("\n"),
  directives,
  cases: [chloeAshworth, maeveDonnelly, luciaFerrante, harperVale, adaezeOkonkwo, rare5090Wig],
  jensenIdle: [
    "Five trillion dollars, and I wait in my own lobby.",
    "The Jacket is fine. The Jacket is always fine. Stop asking about the Jacket.",
    "If she's a ten, I'm an asset. I'm told that's a compliment. Legal says it isn't.",
    "Dolores says one spy and it's over. I said 'over' is a strong word. She said it's the word in the memo.",
    "Every date is a supply chain. The more you vet, the more you save.",
    "Someone in the lobby is humming the keynote music. Oh. It's me.",
    "I'm not paranoid. I'm vertically integrated.",
    "My personality is CUDA. Twenty years of backward compatibility. Name one other man who offers that.",
    "The Board wants my love life to show predictable quarterly growth.",
    "Tomorrow I keynote. Today I am emotionally available. Within reason. Within allocation.",
    "Everyone looks at the Jacket first. I've made my peace with it. Mostly.",
    "Security asked if I wanted coffee. I asked who made it. That's a normal question. That's a normal Monday question.",
  ],
};
