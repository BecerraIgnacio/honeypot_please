import type { CaseDef } from "../../types";

export const adaezeNwosu: CaseDef = {
  id: "d3-adaeze-nwosu",
  day: 3,
  slot: "regular",
  applicant: {
    name: "Dr. Adaeze Nwosu",
    nationality: "Nigerian",
    occupation: "HPC researcher, Lekki Institute of Computation",
    statedReason: "A date, structured as a 90-minute workshop on why NVIDIA should adopt ROCm. Followed by jollof.",
    bio: "Ports climate models for a living. Has opinions about open source that she delivers at the volume of a datacenter fan. Speaking at GTC on Thursday. Brought 41 slides to a romantic proposal.",
    portrait: {
      kind: "human",
      skin: 5,
      hair: { style: "braids", color: "#1b1b1b" },
      eyes: "wide",
      mouth: "open",
      accessories: ["glasses", "pin"],
      outfit: { style: "tshirt", color: "#c0392b" },
      bg: "#f3e3d3",
    },
    greeting: "Jensen. Hello. I have 41 slides and I am going to need you to keep an open mind. And an open stack.",
  },
  claims: [
    { id: "c-name", label: "Name", value: "Dr. Adaeze Nwosu" },
    { id: "c-employer", label: "Employer", value: "Lekki Institute of Computation, Lagos" },
    { id: "c-talk", label: "GTC role", value: "Speaker, Thursday, March 18, 2027" },
    { id: "c-request", label: "Request", value: "A 90-minute date-workshop on migrating NVIDIA to ROCm" },
  ],
  documents: [
    {
      id: "speaker-pass",
      kind: "conference-pass",
      title: "GTC 2027 Speaker Pass",
      issuer: "NVIDIA GTC Registration",
      facts: [
        { id: "pass-num", label: "Pass number", value: "GTC27-209551" },
        { id: "pass-type", label: "Pass type", value: "Speaker" },
        { id: "pass-name", label: "Name", value: "Dr. Adaeze Nwosu" },
      ],
      body: "Someone has added a small sticker over the NVIDIA logo that says 'for now'.",
    },
    {
      id: "invitation",
      kind: "invitation-letter",
      title: "GTC 2027 Speaker Confirmation",
      issuer: "NVIDIA GTC Program Committee",
      facts: [
        { id: "inv-session", label: "Session", value: "S72114: 'Porting a 1998 Climate Model to Anything That Runs'" },
        { id: "inv-time", label: "Slot", value: "Thursday, March 18, 2027, 14:00 PT, Room 210C" },
      ],
      body: "Dear Dr. Nwosu, we are delighted to confirm your session. Reviewer comment: 'Strong talk. Please do not end on a slide that says OPEN THE STACK in 200-point font again.'",
    },
    {
      id: "proposal",
      kind: "romance-artifact",
      title: "Proposal for a Date, Rev. 3",
      issuer: "Office of Dr. A. Nwosu",
      facts: [
        { id: "prop-lines", label: "Line items", value: "1 dinner (jollof), 1 honest talk about vendor lock-in, 1 phased CUDA-to-ROCm migration plan (18 months)" },
        { id: "prop-rubin", label: "Appendix B, cited spec", value: "Rubin Ultra: 48 GB VRAM" },
      ],
      body: "Formatted as a purchase order. Payment terms: net 30 minutes of eye contact. Appendix B argues that 'at only 48 GB, Rubin Ultra proves the moat is software, not memory.' Slide 31 is a picture of a wall with a hammer emoji.",
      footer: "Rev. 1 and Rev. 2 were rejected by her own lab for being 'too nice to AMD'.",
    },
  ],
  questions: [
    {
      id: "q-rocm",
      prompt: "What exactly do you want from him?",
      answer:
        "I want you to switch to ROCm. Not for AMD. For humanity. CUDA is a beautiful walled garden and I would like to knock down one (1) wall. You can keep the garden. You can keep the jacket. I would never touch the jacket.",
      suspicion: 12,
      jensen: "She asked me to switch to ROCm. To my face. In my lobby. Security, this is either love or a war crime.",
    },
    {
      id: "q-cuda",
      prompt: "Do you actually use CUDA?",
      answer:
        "Every day. Our cluster is 64 H100s. I write CUDA kernels at 3 AM and angry blog posts about them at 4 AM. It's a relationship. It's complicated. It's on my profile.",
      facts: [{ id: "ans-cluster", label: "Her lab's hardware", value: "64 x H100, used daily" }],
      suspicion: -5,
      jensen: "She uses CUDA every day and resents it. That is not espionage. That is a customer.",
    },
    {
      id: "q-vram",
      prompt: "Rubin Ultra has 48 GB of VRAM?",
      answer:
        "Is that wrong? I got it from a forum. A forum with very confident people. ...It's a terabyte? Per package? That changes slide 31. That changes everything. Give me a minute, I need to rewrite Appendix B on my phone.",
      facts: [{ id: "ans-vram", label: "Source of her Rubin Ultra figure", value: "An internet forum" }],
      suspicion: -6,
      requires: ["doc:proposal"],
      jensen: "She is off by 976 gigabytes. She is not a spy. A spy would have done the homework.",
    },
    {
      id: "q-feynman",
      prompt: "What do you know about Feynman?",
      answer:
        "The name. You said it yesterday and then walked off like a man who left the stove on. I assume it's a GPU. It could be a dog. If it's a dog, I support it.",
      facts: [{ id: "ans-feynman", label: "What she knows about Feynman", value: "The name only" }],
      suspicion: -5,
    },
    {
      id: "q-amd",
      prompt: "Does AMD pay you?",
      answer:
        "No. My salary comes from a climate research grant. AMD once sent me a hoodie. I wear it to the gym so it suffers too.",
      facts: [{ id: "ans-salary", label: "Her funding", value: "Climate research grant. No chip vendor." }],
      suspicion: 5,
      jensen: "Security. She said AMD with affection. And then with contempt. I am confused.",
    },
    {
      id: "q-incident",
      prompt: "You were flagged at GTC 2025 for shouting during the keynote.",
      answer:
        "I shouted 'OPEN THE STACK.' Once. Politely. In a supportive register. You said 'we'll take that under advisement' and I have been waiting for the advisement for two years. That is why there's a Rev. 3.",
      suspicion: -3,
      requires: ["rec:adaeze-incident"],
      jensen: "I did say that. I advised nothing. She has been waiting. That is the most patient anyone has been with me.",
    },
  ],
  records: [
    {
      id: "adaeze-attendee",
      category: "attendee",
      title: "GTC 2027 Attendee: GTC27-209551",
      keywords: ["gtc27-209551", "209551", "adaeze", "nwosu", "adaeze nwosu", "lekki", "s72114"],
      facts: [
        { id: "att-type", label: "Pass type", value: "Speaker" },
        { id: "att-affil", label: "Affiliation", value: "Lekki Institute of Computation" },
        { id: "att-session", label: "Session", value: "S72114, Thursday 14:00 PT" },
      ],
    },
    {
      id: "adaeze-allocation",
      category: "chip-allocation",
      title: "Allocation: Lekki Institute of Computation",
      keywords: ["lekki", "lekki institute", "lekki institute of computation", "nwosu", "adaeze nwosu", "h100"],
      facts: [
        { id: "alloc-units", label: "Allocation", value: "64 x H100, delivered August 2024, paid in full" },
        { id: "alloc-contact", label: "Technical contact", value: "Dr. A. Nwosu" },
      ],
      body: "Account in good standing. Support tickets filed: 347. Tone of support tickets: 'passionate'. Ticket #188 is titled 'I love this and I hate that I love this'.",
    },
    {
      id: "adaeze-incident",
      category: "incident",
      title: "Incident IR-2025-1182: Keynote Q&A disruption",
      keywords: ["ir-2025-1182", "open the stack", "rocm", "nwosu", "adaeze nwosu", "adaeze"],
      facts: [
        { id: "inc-event", label: "Event", value: "Attendee shouted 'OPEN THE STACK' during GTC 2025 keynote Q&A" },
        { id: "inc-outcome", label: "Assessment", value: "No threat. Enthusiasm only. Applauded by about 40% of the room." },
      ],
    },
  ],
  discrepancies: [
    {
      id: "d-vram",
      facts: ["prop-rubin", "g.d3.rubin-ultra-mem"],
      kind: "explained",
      note: "Off by 976 GB. Directive 3-C: knowing less than the keynote is normal. Being wrong about VRAM is embarrassing, not suspicious.",
      suspicion: -6,
      jensen: "48 gigabytes. She thinks I make gaming cards for data centers. Adorable.",
    },
    {
      id: "d-vram-announced",
      facts: ["prop-rubin", "g.d3.announced"],
      kind: "explained",
      note: "Rubin Ultra was announced. The 48 GB figure is just wrong. Wrong is not secret.",
      suspicion: -3,
    },
    {
      id: "d-feynman",
      facts: ["ans-feynman", "g.d3.feynman-secret"],
      kind: "match",
      note: "She knows exactly what was announced about Feynman: the name. Nothing more.",
      suspicion: -6,
    },
    {
      id: "d-cluster",
      facts: ["ans-cluster", "alloc-units"],
      kind: "match",
      note: "64 H100s, as recorded in the allocation database. She is a paying customer in good standing.",
      suspicion: -8,
      jensen: "She paid for 64 H100s and wants me to switch to ROCm. That is the most loyal complaint I have ever received.",
    },
    {
      id: "d-rocm-customer",
      facts: ["c-request", "alloc-units"],
      kind: "explained",
      note: "She lobbies for ROCm while running 64 H100s. Complaining about the product you use every day is customer behavior, not espionage.",
      suspicion: -4,
    },
    {
      id: "d-contact",
      facts: ["c-name", "alloc-contact"],
      kind: "match",
      note: "She is the named technical contact on her lab's H100 allocation.",
      suspicion: -4,
    },
    {
      id: "d-radeon",
      facts: ["ans-salary", "scan-radeon"],
      kind: "explained",
      note: "Owning a Radeon is not being paid by AMD. The card carries an 'emotional support GPU' sticker and no storage or radios.",
      suspicion: -3,
    },
    {
      id: "d-session",
      facts: ["inv-session", "att-session"],
      kind: "match",
      note: "Session S72114 is on the speaker record.",
      suspicion: -5,
    },
    {
      id: "d-talk",
      facts: ["c-talk", "inv-time"],
      kind: "match",
      note: "Claimed Thursday talk matches the confirmation letter.",
      suspicion: -3,
    },
    {
      id: "d-employer",
      facts: ["c-employer", "att-affil"],
      kind: "match",
      note: "Employer matches her registration.",
      suspicion: -3,
    },
  ],
  scan: [
    {
      id: "bag",
      kind: "bag-contents",
      title: "Competitor hardware in bag",
      description:
        "One Radeon card wrapped in an NVIDIA CUDA t-shirt, like a cat in a dog costume. Also: 41 printed slides (double-sided), an AMD hoodie, and a tupperware of jollof. No storage, no transmitters. The card has a sticker reading 'emotional support GPU'.",
      facts: [{ id: "scan-radeon", label: "Bag contents", value: "One Radeon card wrapped in a CUDA t-shirt" }],
      suspicion: 15,
    },
  ],
  baseSuspicion: 55,
  jensenIntro: "She is wearing red. Very red. AMD red. I am trying not to read into it. I am reading into it.",
  eggs: [
    {
      id: "rocm-heresy",
      title: "Heresy at the Checkpoint",
      toast: "An applicant asked Jensen, sincerely, to switch to ROCm. The jacket has requested a moment alone.",
      on: "q:q-rocm",
    },
  ],
  truth: "innocent",
  hiddenTruth:
    "Exactly who she says she is: a climate HPC researcher whose lab owns 64 H100s, who writes CUDA every night, and who believes with her whole chest that the world would be better on ROCm. She is a paying customer with 347 support tickets. Her only secret is that she got the Rubin Ultra VRAM figure from a forum.",
  solution: {
    clues: ["rec:adaeze-allocation", "d:d-cluster", "d:d-feynman", "d:d-vram", "d:d-session"],
    redHerrings: ["q:q-rocm", "scan:bag", "rec:adaeze-incident", "q:q-amd"],
    explanation:
      "Everything about her reads hot: AMD red, a Radeon in her bag, a prior incident, and an earnest request to abandon CUDA. None of it is evidence. The allocation database shows her lab bought 64 H100s and she is the technical contact. Her speaker session is on record. On technical knowledge she errs low, not high: she knows Feynman only by name and is wrong by 976 GB about Rubin Ultra. Directive 3-C flags people who know too much. She knows too little, loudly.",
  },
  onAccept: {
    headline: "OPEN STACK, OPEN HEART",
    text: "Adaeze delivers 41 slides over jollof. Jensen rejects the migration plan 41 times and books a second date to reject Rev. 4. One forum is quietly corrected about Rubin Ultra VRAM.",
  },
  onReject: {
    headline: "WALLED GARDEN HOLDS",
    text: "Adaeze leaves Rev. 3 on the counter with a sticky note: 'Under advisement, I assume.' She gives her Thursday talk anyway and gets a standing ovation from a room full of people who also use CUDA angrily.",
  },
};
