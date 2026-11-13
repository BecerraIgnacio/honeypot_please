import type { DayDef } from "../../types";
import { achiengOtieno } from "./achieng-otieno";
import { isadoraQuintela } from "./isadora-quintela";
import { luziaFerraz } from "./luzia-ferraz";
import { margitThorne } from "./margit-thorne";
import { tamsinHollowayReyes } from "./tamsin-holloway-reyes";
import { veraKessling } from "./vera-kessling";

export const day5: DayDef = {
  day: 5,
  title: "The Final Honeypot",
  briefing: `MEMO. RPC-7. FRIDAY, MARCH 19, 2027.
FROM: Dolores Vance, Head of Romantic Security
RE: The last day

Desk,

Last day of GTC week. I would like to tell you we are almost done. We are not almost done. We are almost Friday afternoon, which is different.

I no longer trust the database. At 02:00 I had Endeavor Security take a snapshot of it. Every edit made this week is logged with an editor id and a timestamp, and anything edited after 02:00 is suspect until somebody with a pulse reviews it. Suspect does not mean false. It means you check who made the edit, from where, and whether anything written before 02:00 agrees. Read the edit stamps. All of them.

I no longer trust the badges. Badge LB-0417, which you will remember from Tuesday whether or not you were here for it, is sealed in Evidence Locker E-12. If it walks up to your window, it did not walk there legally.

I no longer trust the coffee. The espresso machine that appeared in the break nook on Monday clicks at night and is warm when it is off. I have filed a ticket. Until it is serviced, drink water. Drink it suspiciously.

Paperwork must carry the right form number. If a document says it is one thing and its form number says it is another, believe the form number.

Last: somebody inside may be helping them. I don't know who. I have checked the night shift. I have checked myself, twice. Mr. Huang has started checking the desk. Do not take it personally. Do not leave your login saved on anything.

D. Vance

P.S. The Board would like you to know that shareholder value is "counting on you, emotionally."`,
  directives: [
    {
      id: "d5-dir-edit-log",
      category: "directive",
      title: "Directive 5-A: Record edit log and 02:00 snapshot",
      keywords: ["edit log", "edit", "editor", "timestamp", "snapshot", "cutoff", "02:00", "rpc7-desk", "eso-night", "eso-day", "dv-01", "10.7.0.10", "desk"],
      facts: [
        { id: "g.d5.edit-cutoff", label: "Edit cutoff", value: "Records edited after 02:00 PDT, Fri Mar 19 2027 are suspect pending review" },
        { id: "g.d5.desk-hours", label: "RPC7-DESK login", value: "Usable only at the desk terminal, 08:00-18:00 PDT. Locked overnight." },
        { id: "g.d5.desk-ip", label: "RPC7-DESK terminal address", value: "10.7.0.10" },
        { id: "g.d5.night-shift", label: "ESO-NIGHT", value: "Endeavor Security night office, on duty 22:00-06:30 PDT" },
      ],
      body: "Every edit to a checkpoint database record this week is logged with the editor id and a timestamp. A snapshot was taken at 02:00 today. Editors include DV-01 (Dolores Vance), RPC7-DESK (this checkpoint), ESO-DAY and ESO-NIGHT (Endeavor Security Office), and conference systems. Suspect is not false. Corroborate with records from before the cutoff.",
    },
    {
      id: "d5-dir-lb0417",
      category: "directive",
      title: "Directive 5-B: Badge LB-0417 is void",
      keywords: ["lb-0417", "lb0417", "0417", "badge", "confiscated", "void", "evidence locker", "e-12", "badge format"],
      facts: [
        { id: "g.d5.lb0417", label: "Badge LB-0417", value: "Confiscated at RPC-7, Tue Mar 16 2027. Sealed in Evidence Locker E-12. Void." },
        { id: "g.d5.badge-format", label: "Valid NVIDIA badges", value: "Format NV-#####-X, issued only by Endeavor Security Office" },
      ],
      body: "Anything presenting LB-0417, citing it, or asking for it back is to be treated as void. Do not hold it up to the light. Do not let it near your lanyard.",
    },
    {
      id: "d5-dir-forms",
      category: "directive",
      title: "Directive 5-C: Legal form numbers",
      keywords: ["form", "form number", "legal", "rs-110", "rs-240", "xc-42", "marriage", "certificate", "waiver", "export", "export control", "release"],
      facts: [
        { id: "g.d5.form-marriage", label: "Marriage certificate", value: "Form RS-110" },
        { id: "g.d5.form-release", label: "Release of confiscated property", value: "Form RS-240" },
        { id: "g.d5.form-waiver", label: "Export-control waiver", value: "Form XC-42. Never signed at RPC-7." },
      ],
      body: "Legal documents presented at the checkpoint must be filed under the correct form number. A document's title is decoration. Its form number is what it is.",
    },
  ],
  cases: [veraKessling, isadoraQuintela, margitThorne, achiengOtieno, tamsinHollowayReyes, luziaFerraz],
  jensenIdle: [
    "Day five. The badge reader blinked at me. Twice. That's a signal. I just don't know whose.",
    "Everyone in this lobby is a spy until proven a shareholder.",
    "I am worth five trillion dollars and I cannot get one unbiased cup of coffee.",
    "The desk is quiet today. Too quiet. What are you hiding, desk?",
    "If she's a ten, I'm an asset. If she's an eleven, I'm a sovereign wealth fund.",
    "I keynoted for two hours and ten minutes on Tuesday. I could do two more. Right here. For the desk.",
    "Someone edited the database at three in the morning. Not me. I was asleep. In the jacket. The jacket was not asleep.",
    "The more you buy, the more you save. The more you trust, the more you get honeypotted.",
    "Nobody understands the jacket. Today I'm not sure I understand the jacket.",
    "Desk, look at me. Did you log in last night? Blink once for no.",
    "I build AI factories. I can build a smaller, more loyal checkpoint desk. Don't make me.",
    "LB-0417. I see it everywhere. My hotel room. My Wi-Fi password. My dreams.",
    "I could buy Volta. I could buy Lumen Bridge. I could buy this desk and fire it.",
    "Somebody inside is helping them. I am inside. I am helping me. Is that the same thing?",
    "Dolores doesn't trust the coffee. I don't trust Dolores's trust. I trust the jacket, mostly.",
    "Don't ask me about the AGI timeline. Everyone who asks me about the AGI timeline is a hedge fund.",
  ],
};
