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
  briefing: `FRI MAR 19. FROM: D. Vance

Desk,

Last day. I no longer trust the database: read every edit stamp. I no longer trust the espresso machine that appeared in the break nook on Monday. It clicks at night and is warm when off. Ticket filed. Drink water. Suspiciously.

Someone inside is helping them. Do not leave your login saved on anything.`,
  directives: [
    {
      id: "d5-dir-edit-log",
      category: "directive",
      title: "Directive 5-A: Record edit log and 02:00 snapshot",
      keywords: ["edit log", "edit", "editor", "timestamp", "snapshot", "cutoff", "02:00", "rpc7-desk", "eso-night", "eso-day", "dv-01", "10.7.0.10", "desk"],
      facts: [
        { id: "g.d5.edit-cutoff", label: "Edit cutoff", value: "Edits after 02:00 PDT, Fri Mar 19 2027: suspect" },
        { id: "g.d5.desk-hours", label: "RPC7-DESK login", value: "Desk terminal only, 08:00-18:00 PDT. Locked overnight." },
        { id: "g.d5.desk-ip", label: "RPC7-DESK terminal address", value: "10.7.0.10" },
        { id: "g.d5.night-shift", label: "ESO-NIGHT", value: "Endeavor Security night office, on duty 22:00-06:30 PDT" },
      ],
      body: "Every record edit is logged with editor and time. Editors: DV-01 (Vance), RPC7-DESK (this desk), ESO-DAY, ESO-NIGHT. Suspect is not false: check it against older records.",
    },
    {
      id: "d5-dir-lb0417",
      category: "directive",
      title: "Directive 5-B: Badge LB-0417 is void",
      keywords: ["lb-0417", "lb0417", "0417", "badge", "confiscated", "void", "evidence locker", "e-12", "badge format"],
      facts: [
        { id: "g.d5.lb0417", label: "Badge LB-0417", value: "Confiscated Tue Mar 16 2027. Evidence Locker E-12. Void." },
        { id: "g.d5.badge-format", label: "Valid NVIDIA badges", value: "Format NV-#####-X, issued only by Endeavor Security Office" },
      ],
      body: "Anything presenting LB-0417, citing it, or asking for it back is void. Do not let it near your lanyard.",
    },
    {
      id: "d5-dir-forms",
      category: "directive",
      title: "Directive 5-C: Legal form numbers",
      keywords: ["form", "form number", "legal", "rs-110", "rs-240", "xc-42", "marriage", "certificate", "waiver", "export", "export control", "release"],
      facts: [
        { id: "g.d5.form-marriage", label: "Marriage certificate", value: "Form RS-110" },
        { id: "g.d5.form-release", label: "Property release", value: "Form RS-240" },
        { id: "g.d5.form-waiver", label: "Export-control waiver", value: "Form XC-42. Never signed at RPC-7." },
      ],
      body: "A document's title is decoration. Its form number is what it is.",
    },
  ],
  cases: [veraKessling, isadoraQuintela, margitThorne, achiengOtieno, tamsinHollowayReyes, luziaFerraz],
  jensenIdle: [
    "Day five. The badge reader blinked at me. Twice. That's a signal. I just don't know whose.",
    "Everyone in this lobby is a spy until proven a shareholder.",
    "I am worth five trillion dollars and I cannot get one unbiased cup of coffee.",
    "The desk is quiet today. Too quiet. What are you hiding, desk?",
    "If she's a ten, I'm an asset. If she's an eleven, I'm a sovereign wealth fund.",
    "Someone edited the database at 3 a.m. I was asleep. In the jacket. The jacket was not.",
    "The more you buy, the more you save. The more you trust, the more you get honeypotted.",
    "Desk, look at me. Did you log in last night? Blink once for no.",
    "LB-0417. I see it everywhere. My hotel room. My Wi-Fi password. My dreams.",
    "Somebody inside is helping them. I am inside. I am helping me. Is that the same thing?",
    "Dolores doesn't trust the coffee. I don't trust Dolores's trust. I trust the jacket.",
    "Everyone who asks me about the AGI timeline is a hedge fund.",
  ],
};
