import type { CaseDef } from "../../types";

export const valentinaRuizOcampo: CaseDef = {
  id: "d3-valentina-ruiz-ocampo",
  day: 3,
  slot: "regular",
  applicant: {
    name: "Valentina Ruiz Ocampo",
    nationality: "Argentine",
    occupation: "Firmware engineer, Pampa Microcontroladores",
    statedReason:
      "Wants to show Jensen that her GTC pass now runs Doom, then take him to a parrilla 'with real fire, not ray-traced fire'.",
    bio: "Writes firmware for soil-moisture sensors in Córdoba. Got bored in the keynote overflow line and ported Doom to the e-ink display on her GTC smart pass. Reported the hole at 07:58 this morning. Extremely proud of the frame rate: 2 fps.",
    portrait: {
      kind: "human",
      skin: 3,
      hair: { style: "curly", color: "#3b2314" },
      eyes: "wink",
      mouth: "smirk",
      accessories: ["glasses", "lanyard"],
      outfit: { style: "hoodie", color: "#2d6a4f" },
      bg: "#e8eedf",
    },
    greeting: "Hola. Okay, don't panic, but look at my badge. Look at it. Two frames per second. That's playable.",
  },
  claims: [
    { id: "c-name", label: "Name", value: "Valentina Ruiz Ocampo" },
    { id: "c-employer", label: "Employer", value: "Pampa Microcontroladores, Córdoba" },
    { id: "c-reported", label: "Disclosure", value: "Reported the pass vulnerability to GTC Security at 07:58 PT today" },
    { id: "c-request", label: "Request", value: "Dinner at a parrilla. She pays. He brings the jacket." },
  ],
  documents: [
    {
      id: "smart-pass",
      kind: "conference-pass",
      title: "GTC 2027 Smart Pass (e-ink, currently running Doom)",
      issuer: "NVIDIA GTC Registration",
      facts: [
        { id: "pass-front", label: "E-ink front", value: "Pass number covered by Doom HUD ('HEALTH 100%  AMMO 50')" },
        { id: "pass-back", label: "Printed on back", value: "GTC27-552190" },
        { id: "pass-name", label: "Name (back)", value: "Valentina Ruiz Ocampo" },
        { id: "pass-firmware", label: "Firmware", value: "v2.1-doomguy (factory: v2.1)" },
      ],
      body: "The front panel refreshes every half second with a satisfying crunch. An imp is visible where her photo used to be. She has taped a tiny D-pad made of tactile switches to the lanyard clip.",
      stamp: "MODIFIED",
    },
    {
      id: "passport",
      kind: "id-card",
      title: "Passport",
      issuer: "República Argentina",
      facts: [
        { id: "pp-name", label: "Name", value: "Valentina Ruiz Ocampo" },
        { id: "pp-num", label: "Passport number", value: "AAF482113" },
        { id: "pp-dob", label: "Date of birth", value: "November 2, 1994" },
      ],
    },
    {
      id: "staff-id",
      kind: "employee-credential",
      title: "Pampa Microcontroladores Staff ID",
      issuer: "Pampa Microcontroladores S.A.",
      facts: [
        { id: "emp-name", label: "Name", value: "Valentina Ruiz Ocampo" },
        { id: "emp-role", label: "Role", value: "Senior Firmware Engineer, soil-moisture sensors" },
      ],
      footer: "Our sensors have 256 KB of RAM and we are proud of every byte.",
    },
    {
      id: "disclosure",
      kind: "personal-note",
      title: "Printed email: 'Responsible disclosure: your badges run Doom'",
      facts: [
        { id: "note-ticket", label: "Ticket number in reply", value: "GTCSEC-0317-004" },
        { id: "note-time", label: "Sent", value: "March 17, 2027, 07:58 PT" },
      ],
      body: "'Hi! Your smart pass debug pads are labeled in the public FCC photos and the password is gtc2027. I changed only the display. I did NOT touch NFC (bold, two languages: NO TOQUÉ EL NFC). Attached: video at 2 fps. Please do not arrest me, I have a dinner to plan.'",
    },
  ],
  questions: [
    {
      id: "q-doom",
      prompt: "Why is your pass running Doom?",
      answer:
        "Because it could. It has a 48 MHz microcontroller and an e-ink panel that refreshes if you ask nicely. I spent three hours in the overflow line yesterday. A person has to do something with her hands.",
      suspicion: 5,
      jensen: "It runs Doom. On a badge. At two frames per second. I have built AI factories and I have never been this jealous.",
    },
    {
      id: "q-access",
      prompt: "Can it open doors now?",
      answer:
        "No. I changed the display only. The NFC chip is a separate part and I didn't go near it. I wrote that in the report in bold, in two languages, in case one of them was busy.",
      facts: [{ id: "ans-scope", label: "What she modified (her account)", value: "Display only. NFC access chip untouched." }],
      suspicion: -5,
    },
    {
      id: "q-debug",
      prompt: "How did you get into the firmware?",
      answer:
        "The debug pads are labeled in the FCC filing photos. Public. The password was 'gtc2027'. I would like to speak to whoever chose that, romantically or otherwise.",
      facts: [{ id: "ans-password", label: "Debug password she used", value: "gtc2027, found via the public FCC filing" }],
      suspicion: 12,
      jensen: "The password was gtc2027. Security, find out who did this. Then promote her.",
    },
    {
      id: "q-gpu",
      prompt: "Do you use NVIDIA hardware?",
      answer:
        "At work? Our chips have 256 kilobytes of RAM. We dream of VRAM. At home, a 3060. It's fine. It's family. It's the cousin who always shows up.",
      suspicion: -3,
      jensen: "A 3060. Humble. Honest. Reliable. A golden retriever with tensor cores.",
    },
    {
      id: "q-why",
      prompt: "Why Jensen?",
      answer:
        "Because he'll understand that two frames per second on an e-ink badge is a miracle. My mother thinks it's a broken calculator. My ex thought it was a cry for help. It's a cry for dinner.",
      suspicion: -2,
    },
    {
      id: "q-bounty",
      prompt: "Security says your bounty is a t-shirt.",
      answer: "Size M! They got my size right. That's more than most companies. I'll wear it to dinner.",
      suspicion: -5,
      requires: ["rec:valentina-incident"],
      jensen: "We paid her in one t-shirt. The Board will call this capital efficiency.",
    },
  ],
  records: [
    {
      id: "valentina-attendee",
      category: "attendee",
      title: "GTC 2027 Attendee: GTC27-552190",
      keywords: ["gtc27-552190", "552190", "valentina", "ruiz", "ruiz ocampo", "valentina ruiz ocampo", "pampa", "pampa microcontroladores"],
      facts: [
        { id: "att-num", label: "Pass number", value: "GTC27-552190" },
        { id: "att-name", label: "Registered name", value: "Valentina Ruiz Ocampo" },
        { id: "att-employer", label: "Employer", value: "Pampa Microcontroladores" },
      ],
    },
    {
      id: "valentina-incident",
      category: "incident",
      title: "GTCSEC-0317-004: Responsible disclosure, smart pass firmware",
      keywords: ["gtcsec-0317-004", "0317-004", "doom", "smart pass", "e-ink", "disclosure", "ruiz", "ruiz ocampo", "gtc2027"],
      facts: [
        { id: "inc-ticket", label: "Ticket", value: "GTCSEC-0317-004" },
        { id: "inc-time", label: "Received", value: "March 17, 2027, 07:58 PT" },
        { id: "inc-scope", label: "Verified scope", value: "Display firmware only. NFC access credentials untouched." },
        { id: "inc-root", label: "Root cause", value: "Debug password 'gtc2027' legible in public FCC filing photos" },
        { id: "inc-status", label: "Status", value: "Confirmed harmless. Bounty: one (1) t-shirt, size M." },
      ],
      body: "Reporter: V. Ruiz Ocampo. Fix scheduled: new password. Proposed new password: 'gtc2027!'. Status of that proposal: under review by someone who is not happy about it.",
    },
  ],
  discrepancies: [
    {
      id: "d-pass-number",
      facts: ["pass-back", "att-num"],
      kind: "match",
      note: "The printed pass number matches her registration.",
      suspicion: -4,
    },
    {
      id: "d-pass-front",
      facts: ["pass-front", "att-num"],
      kind: "explained",
      note: "The e-ink front no longer shows a pass number because a Doom HUD is drawn over it. The printed number on the back is intact and registered.",
      suspicion: -2,
    },
    {
      id: "d-firmware",
      facts: ["pass-firmware", "inc-scope"],
      kind: "explained",
      note: "Modified firmware on a security document, but GTC Security verified the change is display-only. Access credentials are untouched.",
      suspicion: -8,
      jensen: "She hacked a security document and then told security. Spies do not file tickets.",
    },
    {
      id: "d-reported",
      facts: ["c-reported", "inc-time"],
      kind: "match",
      note: "Her disclosure arrived at 07:58 PT, as she says.",
      suspicion: -5,
    },
    {
      id: "d-email-time",
      facts: ["note-time", "inc-time"],
      kind: "match",
      note: "Email sent at 07:58 PT, received by GTC Security at 07:58 PT.",
      suspicion: -3,
    },
    {
      id: "d-identity",
      facts: ["pp-name", "att-name"],
      kind: "match",
      note: "Passport name matches the registration.",
      suspicion: -2,
    },
    {
      id: "d-ticket",
      facts: ["note-ticket", "inc-ticket"],
      kind: "match",
      note: "The ticket number on her printed email matches the open incident.",
      suspicion: -5,
    },
    {
      id: "d-scope",
      facts: ["ans-scope", "inc-scope"],
      kind: "match",
      note: "Her account of what she changed matches what GTC Security verified.",
      suspicion: -6,
    },
    {
      id: "d-password",
      facts: ["ans-password", "inc-root"],
      kind: "explained",
      note: "She knows a security password, but the incident report confirms it was legible in public FCC photos. Embarrassing for GTC. Not secret.",
      suspicion: -4,
    },
    {
      id: "d-employer",
      facts: ["c-employer", "att-employer"],
      kind: "match",
      note: "Employer matches her registration.",
      suspicion: -2,
    },
  ],
  scan: [
    {
      id: "wad",
      kind: "clean",
      title: "Scan complete: one (1) Doom WAD",
      description:
        "The pass contains the Doom shareware episode (2.1 MB) and nothing else. No transmitters, no hidden storage, no exfiltration. The scanner operator reached E1M3 before anyone noticed. Recommend not spending the scan budget like that again.",
      suspicion: -5,
    },
  ],
  baseSuspicion: 45,
  jensenIntro: "Her badge is moving. Badges should not move. Why is there a demon on her badge?",
  eggs: [
    {
      id: "doom-doc",
      title: "Can It Run Doom? (Credential Edition)",
      toast: "A GTC smart pass is running Doom at 2 fps. Security has been asked not to play it during shift.",
      on: "q:q-doom",
    },
  ],
  truth: "innocent",
  hiddenTruth:
    "A bored firmware engineer with a soldering habit and excellent manners. She found the debug password in public FCC photos, swapped the display firmware for Doom, left the access chip alone, and reported it all before breakfast. Her bounty was one t-shirt. She considers this a fair price.",
  solution: {
    clues: ["rec:valentina-incident", "d:d-ticket", "d:d-scope", "d:d-firmware", "d:d-pass-number"],
    redHerrings: ["doc:smart-pass", "q:q-debug", "scan:wad"],
    explanation:
      "A tampered security document and an applicant who knows an internal password look terrible. Then the records take over: the printed number on her pass matches her registration, and her disclosure email carries ticket GTCSEC-0317-004, which GTC Security logged at 07:58 and verified as display-only with the NFC access chip untouched. The password was legible in public FCC photos. The scan finds Doom and only Doom: a spent scan.",
  },
  onAccept: {
    headline: "E1M1: DINNER",
    text: "Valentina and Jensen eat at a parrilla in Santa Clara. He asks how she got 2 fps. She asks how he got $5 trillion. Both answers involve memory bandwidth.",
  },
  onReject: {
    headline: "GAME OVER (ROMANCE)",
    text: "Valentina leaves still playing. By noon her pass reaches E1M4, and GTC Security changes the password to 'gtc2027!'. She reports that one too.",
  },
};
