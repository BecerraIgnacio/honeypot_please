import type { CaseDef } from "../../types";

export const maricelDizon: CaseDef = {
  id: "d3-maricel-dizon",
  day: 3,
  slot: "regular",
  applicant: {
    name: "Maricel Dizon",
    nationality: "Filipino",
    occupation: "ICU night-shift nurse",
    statedReason:
      "Wants Jensen to sign the print of their 2025 selfie, then have one (1) coffee. Decaf. He looks tired.",
    bio: "Twelve years in intensive care, the last four at Santa Teresa Regional in San Jose. Met Jensen for nine seconds in the GTC 2025 selfie line. Has been quietly worried about his sleep schedule ever since.",
    portrait: {
      kind: "human",
      skin: 3,
      hair: { style: "bun", color: "#1c1410" },
      eyes: "tired",
      mouth: "smile",
      accessories: ["lanyard"],
      outfit: { style: "hoodie", color: "#3f8f8a" },
      bg: "#dfe9ea",
    },
    greeting: "Hi. Before anything else: when did he last drink water? Be honest. I can tell.",
  },
  claims: [
    { id: "c-name", label: "Name", value: "Maricel Dizon" },
    { id: "c-employer", label: "Employer", value: "Santa Teresa Regional Medical Center, ICU" },
    { id: "c-met", label: "Prior contact", value: "Met Jensen in the GTC 2025 selfie line" },
    { id: "c-met-date", label: "Date of prior contact", value: "March 18, 2025" },
    { id: "c-request", label: "Request", value: "A signature on the photo, then one decaf coffee" },
  ],
  documents: [
    {
      id: "license",
      kind: "id-card",
      title: "California Driver License",
      issuer: "California DMV",
      facts: [
        { id: "dl-name", label: "Name", value: "Maricel Dizon" },
        { id: "dl-city", label: "Address", value: "San Jose, CA" },
        { id: "dl-dob", label: "Date of birth", value: "July 22, 1990" },
      ],
      footer: "Organ donor. Also, apparently, coffee donor.",
    },
    {
      id: "staff-badge",
      kind: "employee-credential",
      title: "Santa Teresa Regional Staff Badge",
      issuer: "Santa Teresa Regional Medical Center",
      facts: [
        { id: "badge-name", label: "Name", value: "Maricel Dizon, RN" },
        { id: "badge-unit", label: "Unit / shift", value: "ICU, Nights (19:00-07:30)" },
        { id: "badge-id", label: "Staff ID", value: "STR-40917" },
      ],
      body: "A sticker on the back reads: I SURVIVED FLU SEASON 2026 AND ALL I GOT WAS THIS STICKER.",
    },
    {
      id: "photo",
      kind: "photo",
      title: "Selfie with Jensen (4x6 print)",
      facts: [
        { id: "photo-hash", label: "Provenance hash", value: "EPR-250318-2207" },
        { id: "photo-fingers", label: "Fingers on her left hand (in photo)", value: "6" },
        { id: "photo-caption", label: "Caption on back", value: "GTC 2025!! he smelled like a new GPU" },
      ],
      body: "Jensen mid-thumbs-up. Maricel beside him in a teal cardigan, flashing a peace sign. Her skin is luminous. Her left hand has one finger more than the usual allotment.",
    },
    {
      id: "gtc25-pass",
      kind: "conference-pass",
      title: "GTC 2025 Exhibit Hall Pass (expired, kept in a ziplock bag)",
      issuer: "NVIDIA GTC Registration",
      facts: [
        { id: "gtc25-num", label: "Pass number", value: "GTC25-118034" },
        { id: "gtc25-date", label: "Valid", value: "March 18, 2025 only (Exhibit Hall day pass)" },
        { id: "gtc25-name", label: "Name", value: "Maricel Dizon" },
      ],
      stamp: "EXPIRED",
    },
  ],
  questions: [
    {
      id: "q-fingers",
      prompt: "Count the fingers in this photo.",
      answer:
        "Six? Oh no. That's Lumina Glow. I ran it to fix the under-eye situation after a 14-hour shift. It fixed the eyes and gave me a bonus finger. I have five. Look. Five. I count them every shift, it's a nurse thing.",
      facts: [
        { id: "ans-fingers", label: "Her actual left hand (shown at the window)", value: "5 fingers" },
        { id: "ans-filter", label: "Editing she admits to", value: "Lumina Glow beauty filter, applied after the fact" },
      ],
      suspicion: -5,
      jensen: "Five on the hand. Six on the photo. I trust the hand. I think. Security, count again.",
    },
    {
      id: "q-coffee",
      prompt: "Why coffee?",
      answer:
        "You blink eleven times a minute on stage. Normal is fifteen to twenty. You're dry-eyed and running on espresso and shareholder value. I want to sit you down for twenty minutes and watch you drink something without a ticker on the wall.",
      jensen: "She tracked my blink rate. Romance or a medical chart. I cannot tell the difference anymore.",
    },
    {
      id: "q-gtc25",
      prompt: "Why were you at GTC 2025?",
      answer:
        "A coworker won a day pass in a raffle and got scheduled for nights. I went to the exhibit hall, ate a nineteen-dollar sandwich, and waited two hours in your selfie line. Worth it. You, not the sandwich.",
      facts: [{ id: "ans-gtc-day", label: "GTC 2025 attendance", value: "One day, Exhibit Hall only" }],
      suspicion: -3,
    },
    {
      id: "q-gpu",
      prompt: "What's your favorite GPU?",
      answer:
        "The one inside our MRI reconstruction box. I don't know the name. It made scans come back in four minutes instead of forty. A kid with a head injury got a surgeon an hour sooner. That one's my favorite.",
      jensen: "She does not know the model number. She knows what it did. Nobody has said anything more romantic to me this week.",
    },
    {
      id: "q-keynote",
      prompt: "Did you watch yesterday's keynote?",
      answer:
        "I was asleep. Night shift. I saw the clip where you held the wafer. You held it like a newborn that costs thirty thousand dollars.",
      facts: [{ id: "ans-asleep", label: "During the keynote", value: "Asleep after a night shift" }],
      suspicion: -3,
    },
    {
      id: "q-original",
      prompt: "The registry has the checksum of the original capture. Do you have the unedited file?",
      answer:
        "On my phone. Unfiltered. I look like a person who just did a fourteen-hour shift, which I was. Here. Five fingers. Same peace sign. Same jacket on him, obviously, I don't think the jacket changes.",
      facts: [{ id: "ans-original", label: "Checksum of the phone original", value: "7F3A-09C2" }],
      suspicion: -8,
      requires: ["rec:maricel-registry"],
      jensen: "The jacket does not change. The jacket is the one constant. Thank you for noticing.",
    },
  ],
  records: [
    {
      id: "maricel-registry",
      category: "access-log",
      title: "Endeavor Photo Registry: EPR-250318-2207",
      keywords: ["epr-250318-2207", "250318", "2207", "photo registry", "registry", "maricel", "dizon", "maricel dizon"],
      facts: [
        { id: "reg-capture", label: "Capture", value: "March 18, 2025, 15:02 PT" },
        { id: "reg-location", label: "Location", value: "San Jose McEnery Convention Center, GTC 2025 selfie line" },
        { id: "reg-subject", label: "Subject tagged", value: "Attendee, pass GTC25-118034" },
        { id: "reg-checksum", label: "Original capture checksum", value: "7F3A-09C2" },
      ],
      body: "Registered by the GTC 2025 event photography team. Selfie line throughput that hour: 240 attendees. Note appended this morning: copies of this photo submitted to RPC-7 must match the original checksum or be explained.",
    },
    {
      id: "maricel-attendee25",
      category: "attendee",
      title: "GTC 2025 Attendee: GTC25-118034",
      keywords: ["gtc25-118034", "118034", "maricel", "dizon", "maricel dizon", "santa teresa"],
      facts: [
        { id: "att-name", label: "Registered name", value: "Maricel Dizon" },
        { id: "att-affil", label: "Affiliation", value: "Santa Teresa Regional Medical Center" },
        { id: "att-type", label: "Pass type", value: "Exhibit Hall day pass, March 18, 2025 (raffle transfer)" },
      ],
    },
  ],
  discrepancies: [
    {
      id: "d-fingers",
      facts: ["photo-fingers", "ans-fingers"],
      kind: "explained",
      note: "Six fingers in the print, five on the hand at the window. She says a beauty filter added one. Filters do that. Hands do not.",
      suspicion: -3,
      jensen: "The filter gave her a finger. Generative AI is very generous with fingers.",
    },
    {
      id: "d-checksum",
      facts: ["reg-checksum", "scan-print-checksum"],
      kind: "explained",
      note: "The print was edited after capture, so its checksum differs from the original. Directive 3-A: the hash certifies the capture event, not the pixels.",
      suspicion: 0,
    },
    {
      id: "d-original",
      facts: ["reg-checksum", "ans-original"],
      kind: "match",
      note: "The original on her phone matches the registry checksum exactly. The capture is authentic.",
      suspicion: -12,
      jensen: "An authentic photo. Of me. This week. I want to frame it. I want to frame the checksum.",
    },
    {
      id: "d-print-vs-phone",
      facts: ["scan-print-checksum", "ans-original"],
      kind: "explained",
      note: "Two different checksums: the printed copy is the filtered edit, the phone file is the untouched original. Only the original has to match the registry, and it does.",
      suspicion: -2,
    },
    {
      id: "d-hash-capture",
      facts: ["photo-hash", "reg-capture"],
      kind: "match",
      note: "Hash date 25-03-18 matches the registry capture date, March 18, 2025.",
      suspicion: -3,
    },
    {
      id: "d-location",
      facts: ["c-met", "reg-location"],
      kind: "match",
      note: "She says selfie line. The registry says selfie line.",
      suspicion: -3,
    },
    {
      id: "d-hash-format",
      facts: ["photo-hash", "g.d3.epr-format"],
      kind: "match",
      note: "Valid EPR format: capture date 2025-03-18, serial 2207.",
      suspicion: -1,
    },
    {
      id: "d-subject",
      facts: ["reg-subject", "gtc25-num"],
      kind: "match",
      note: "The registry tagged pass GTC25-118034 as the subject. That is her pass.",
      suspicion: -8,
    },
    {
      id: "d-date",
      facts: ["c-met-date", "gtc25-date"],
      kind: "match",
      note: "She claims March 18, 2025. Her day pass was valid only on March 18, 2025.",
      suspicion: -4,
    },
    {
      id: "d-hash-date",
      facts: ["photo-hash", "g.d3.epr-start"],
      kind: "match",
      note: "Hash date 2025-03-18 is after the registry went into service. Format and date are valid.",
      suspicion: -3,
    },
    {
      id: "d-hash-rule",
      facts: ["photo-hash", "g.d3.epr-rule"],
      kind: "match",
      note: "The hash is present and listed in the Endeavor Photo Registry. Directive 3-A satisfied.",
      suspicion: -5,
    },
    {
      id: "d-asleep",
      facts: ["ans-asleep", "badge-unit"],
      kind: "match",
      note: "Night-shift ICU nurse, asleep during a 10:00 AM keynote. Consistent.",
      suspicion: -2,
    },
    {
      id: "d-employer",
      facts: ["c-employer", "att-affil"],
      kind: "match",
      note: "Employer matches her 2025 registration.",
      suspicion: -2,
    },
  ],
  scan: [
    {
      id: "sixth-finger",
      kind: "ai-artifact",
      title: "Generative edit detected on the print",
      description:
        "Skin retouching and a sixth finger on the subject's left hand, both from the Lumina Glow v8.2 'Radiance' preset. Jensen's face and jacket are untouched. The background crowd is untouched. Whoever edited this cared only about her under-eyes.",
      facts: [{ id: "scan-print-checksum", label: "Print checksum", value: "0B44-E1D7 (does not match original)" }],
      suspicion: 15,
    },
  ],
  baseSuspicion: 30,
  jensenIntro: "She is looking at me like a chart. Not a stock chart. A medical chart.",
  truth: "innocent",
  hiddenTruth:
    "Exactly who she says she is. Maricel met Jensen for nine seconds in 2025, the event photographer registered the shot, and two years later she ran the photo through a beauty app before printing it. The app smoothed her skin and gave her a sixth finger. She did not notice because she was post-shift and the finger is very well blended.",
  solution: {
    clues: ["rec:maricel-registry", "d:d-original", "d:d-subject", "d:d-date", "d:d-hash-rule"],
    redHerrings: ["scan:sixth-finger", "d:d-fingers", "d:d-checksum"],
    explanation:
      "The print is edited, and the scan proves it, but Directive 3-A says the hash certifies the capture, not the pixels. Search the hash: the registry entry exists, is tagged to pass GTC25-118034 (her pass), and is dated March 18, 2025, the only day that pass was valid. Ask for the original and its checksum matches the registry exactly. The sixth finger is a beauty filter, not a forgery: a fake would need a registry entry, and hers has one.",
  },
  onAccept: {
    headline: "DECAF ACHIEVED",
    text: "Maricel gets her signature and takes Jensen's blood pressure on the way to the coffee cart: 141 over 92. She schedules a follow-up for Friday and circles the sixth finger in Sharpie with the note 'not real, unlike your hypertension'.",
  },
  onReject: {
    headline: "PATIENT REFUSED TREATMENT",
    text: "Maricel leaves a sticky note on the window: 'Drink water. Sleep. You are not a datacenter.' Jensen keeps the note in his jacket. The jacket seems to approve.",
  },
};
