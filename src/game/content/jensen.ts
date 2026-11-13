import type { DayNumber } from "../types";

export type JensenSituation =
  | "correctAccept"
  | "correctReject"
  | "wrongReject"
  | "honeypotted"
  | "noConflict"
  | "contradictionFound"
  | "matchFound"
  | "scanClean"
  | "scanDirty"
  | "scanEmpty"
  | "dbNoResults"
  | "idleGeneric";

/** Paranoia tiers: days 1-2, days 3-4, day 5. */
type TieredPool = readonly [calm: string[], twitchy: string[], unhinged: string[]];

export const JENSEN_LINES: Record<JensenSituation, TieredPool> = {
  correctAccept: [
    [
      "A normal coffee with a normal person. I forgot those existed.",
      "She asked about my week and never once mentioned the H100 queue. Wonderful.",
      "Clean. She's exactly who her badge says. Write that down, nobody will believe it.",
      "She left without photographing a single slide. Respect.",
      "Good call. Somewhere a Meridian analyst just lost a bonus.",
      "Verified human, verified intentions. Ship it.",
    ],
    [
      "She was real. I checked twice and my hands are still shaking.",
      "Innocent. Which is exactly what a good spy would want me to think. But no. Innocent.",
      "Approved. I'm logging it before the paranoia catches up.",
      "A real fan who just wanted a signed 4090. I nearly called security on joy.",
      "Nothing hidden. Not even a USB stick. I didn't know they still made people like that.",
    ],
    [
      "She was innocent. The jacket agreed. The jacket never agrees.",
      "Clean. I'm going to sit with that for a while. Maybe a quarter.",
      "Approved, and nobody exfiltrated anything. Put it on a keynote slide.",
      "She was real. Part of me wanted a spy so the week would make sense.",
      "Innocent. Dolores, I need you to say that out loud. Slowly.",
    ],
  ],
  correctReject: [
    [
      "Rejected. Her roadmap knowledge was suspiciously post-tape-out.",
      "Nice try. Forging an Endeavor badge takes more than a laminator and confidence.",
      "Denied. Tell whoever sent you I said hi, and no.",
      "She wanted a coffee and a copy of the Rubin floorplan. Pick one. Actually, neither.",
      "Caught. The moat holds. The moat is me, reading carefully.",
    ],
    [
      "Got her. That timeline had a hole you could roll a DGX through.",
      "Rejected. She brought flowers and a firmware dumper.",
      "Spy confirmed. My trust in humanity drops three basis points.",
      "That's one less roadmap in a dead drop under a Santa Clara bench.",
      "Denied. Somewhere a short seller just refreshed a feed and got nothing.",
    ],
    [
      "ANOTHER ONE. They're sending them in batches now. Like inference.",
      "Rejected. The jacket saw it before I did. The jacket always sees it.",
      "Got her. I'm not even relieved anymore. I'm calibrated.",
      "Caught. Whoever you work for owes you hazard pay and an apology.",
      "Spy. Obviously spy. Everyone is a spy. Some of them are also correct.",
    ],
  ],
  wrongReject: [
    [
      "She was real. She wanted a selfie, and I treated her like a supply chain attack.",
      "Innocent. I rejected a person over a slightly unusual middle name. That's not security, that's a bug.",
      "Wrong call. Romantic Stability is down, and so is my dignity.",
      "She was who she said she was. I'll send a signed GPU. A small one.",
      "False positive. Security is a precision-recall problem and I just tanked recall.",
    ],
    [
      "She was innocent. I'm retraining the classifier. The classifier is me.",
      "I rejected a real researcher. Somewhere a paper is getting written in ROCm out of spite.",
      "Wrong. My paranoia overfit on a typo.",
      "Innocent. The only thing she smuggled in was enthusiasm.",
      "Another false positive. The Board calls this 'trust debt'. I call it a pattern.",
    ],
    [
      "She was innocent. I rejected her for blinking in Morse code. She was not blinking in Morse code.",
      "Wrong again. My heart is running at twelve percent utilization.",
      "False positive. At this rate the spies don't need to show up. I'll ruin things myself.",
      "She was real. Add her to the apology queue. The apology queue is longer than the H100 queue.",
      "Innocent. I'm going to stand very still and think about what I've become.",
    ],
  ],
  honeypotted: [
    [
      "She was a spy. I'm going to need a minute and a new roadmap.",
      "Honeypotted during GTC week. That's not a breach, that's a press release.",
      "She said she loved CUDA. I believed her. CUDA would never.",
      "The Rubin floorplan is on a USB stick in a hotel lobby somewhere. Great.",
      "I trusted the badge. The badge was a JPEG.",
    ],
    [
      "Honeypotted. The roadmap is out. The Board is drafting adjectives.",
      "She took the tape-out schedule and my faith in lanyards.",
      "I accepted a spy. The stock just did the thing it does in my nightmares.",
      "She's gone, the HBM allocation spreadsheet is gone, and the coffee was decaf.",
      "Compromised. For the record, the forgery was very good.",
    ],
    [
      "HONEYPOTTED. On the last day. The jacket warned me. I didn't listen to the jacket.",
      "It's over. Tell the AI factories to stop the line.",
      "She was a spy. Of course she was. They were all spies. Even the ones who weren't.",
      "Five days of vigilance, undone by one stamp.",
      "I wanted to believe. Wanting to believe is a vulnerability. Somebody file a CVE.",
    ],
  ],
  noConflict: [
    [
      "Those line up. Annoyingly.",
      "Consistent. Next pair.",
      "No conflict. Either honest or well-rehearsed.",
      "They fit together like a well-written driver. Keep looking.",
      "Nothing there. Make two other facts fight.",
    ],
    [
      "Nothing. Which means it's somewhere else.",
      "Consistent. I don't trust consistent.",
      "No conflict. My gut disagrees with the terminal.",
      "Those agree. Agreement can be manufactured. Ask anyone who's read a benchmark slide.",
      "Clean pair. The terminal is either right or compromised.",
    ],
    [
      "NOTHING? Compare it again. Compare it harder.",
      "No conflict. The facts are conspiring together.",
      "They match. Too well. Like they were generated in the same batch.",
      "Consistent. Next I'm comparing it with the jacket.",
      "The terminal says fine. Who installed this terminal? Was it Tessellate?",
    ],
  ],
  contradictionFound: [
    [
      "That doesn't line up. Neither does her story.",
      "Contradiction. Somebody's paperwork is doing improv.",
      "There it is. The dates disagree and so do I.",
      "Two documents, one person, zero agreement.",
      "A conflict. The cheapest scan there is is reading.",
    ],
    [
      "Gotcha. Facts don't lie. People with laminators do.",
      "Contradiction. That's not a typo, that's a plan.",
      "They disagree. One of these documents is fan fiction.",
      "That's a hole in the timeline. Hold it up to the light.",
      "Found it. Put it in the report in bold. Then underline it.",
    ],
    [
      "CONTRADICTION. I KNEW IT. I knew it on Monday.",
      "There it is. The lie. Beautiful. Frame it.",
      "They contradict each other like a competitor's benchmark footnotes.",
      "Mismatch. My paranoia is finally performing at spec.",
      "Send it to the Board. Send it to Dolores. Send it to the jacket.",
    ],
  ],
  matchFound: [
    [
      "That checks out. One point for honesty.",
      "Corroborated. The paperwork has a pulse.",
      "They match. Real records leave real fingerprints.",
      "Confirmed. That's what a legitimate history looks like.",
      "Consistent across sources. Rare. Refreshing.",
    ],
    [
      "Corroborated. Fine. I'll allow it.",
      "It checks out, which is either good news or a very expensive forgery.",
      "Two sources agree. Write it down before they change their minds.",
      "Confirmed. Her story just gained a nine of reliability.",
      "Match. I wanted a contradiction. I'll settle for the truth.",
    ],
    [
      "It matches. I'm choosing to believe the database. Don't make me regret it.",
      "Corroborated. The universe is briefly consistent.",
      "Confirmed. Nobody fakes something this boring.",
      "They agree. I'm not emotional, the HVAC is dry.",
      "Match. Good. One less thing trying to kill the roadmap.",
    ],
  ],
  scanClean: [
    [
      "Clean scan. A wallet, a phone, a GTC tote bag. Normal person things.",
      "Nothing hidden. The most dangerous item was a granola bar.",
      "She's carrying exactly what she says she is.",
      "No hidden devices. I respect someone who travels light.",
      "Clean. The scanner seems disappointed. I'm not.",
    ],
    [
      "Clean. Either honest, or they've gotten better at hiding things.",
      "Nothing. I burned a scan to confirm she owns lip balm.",
      "Scan clean. I'm going to keep looking at her suspiciously anyway. No. Stop it.",
      "Zero findings. The scanner says relax. The scanner is not on the Board.",
      "Clean. Not even an easter egg. Unusual for this week.",
    ],
    [
      "CLEAN? Scan the scanner.",
      "Nothing found. That's exactly what they'd want the scanner to say.",
      "Clean scan. I'm going to accept that and also never sleep again.",
      "No devices. Not one. In this economy.",
      "Clean. Fine. I'm still checking her tote bag for a second tote bag.",
    ],
  ],
  scanDirty: [
    [
      "Hidden compartment. Nobody needs a hidden compartment for a coffee date.",
      "The scanner found something. The scanner is finally earning its allocation.",
      "Well. That's not a lipstick. That's a flash drive with a lipstick cap.",
      "Forged metadata. Somebody edited this PDF at three in the morning.",
      "There it is. The bag has opinions about our roadmap.",
    ],
    [
      "Concealed device. Her purse has more I/O than a DGX.",
      "The scan lit up like a keynote stage.",
      "Something's in there. Something with a USB-C port and bad intentions.",
      "Nobody carries a die shot for sentimental reasons.",
      "The scanner found a second, smaller, more honest bag inside the bag.",
    ],
    [
      "OF COURSE there's something. There's always something. There's probably something in me.",
      "Scan positive. Now scan the building. And the parking lot. And the sky.",
      "Hidden note. I'll read it later, once I stop vibrating.",
      "Found a device. I'd like it noted that I suspected the tote bag since Monday.",
      "Log it. Then burn the log. No, keep the log. Laminate the log.",
    ],
  ],
  scanEmpty: [
    [
      "No scan charges left. Use your eyes. They're free.",
      "Out of scans. We do this the old way. Reading.",
      "Scanner's empty. Dolores budgets scans like HBM.",
      "No charges. The scanner is in the allocation queue like everyone else.",
      "Compare the documents. That's the scan now.",
    ],
    [
      "No scans left. I'm going to stare at her really hard. That's basically a scan.",
      "Empty. Who approved two scans a day? Me. I approved that.",
      "No charges. I'd buy more, but you know what they say about buying more.",
      "The scanner is out. My paranoia is not.",
      "Out of scans. We'll have to use reasoning, which is the expensive one.",
    ],
    [
      "NO SCANS? Then get me a flashlight and a magnifying glass.",
      "Empty. The scanner's tired. I'm tired. The jacket is fine.",
      "No charges left. Pressing the button harder won't help. I checked.",
      "Out of scans. I'll scan her with my mind. Running inference now.",
      "The scanner has nothing left to give. Same, honestly.",
    ],
  ],
  dbNoResults: [
    [
      "No records. Either she's new here or she's careful.",
      "Nothing. Try a badge number or a company name.",
      "Zero results. The database is a mirror of my dating life.",
      "No hits. Not every name leaves a trail.",
      "Nothing. Spell it the way someone forging it would.",
    ],
    [
      "No results. A clean record means innocence or a very good delete key.",
      "Nothing found. Search the firm, not the person.",
      "Empty. Someone scrubbed the logs, or nobody ever wrote them.",
      "Zero hits. The database knows more than it says. So does Dolores.",
      "No records. I find that more suspicious than records. That's my problem, not hers.",
    ],
    [
      "NOTHING? Search it again. Search it in a different font.",
      "No results. They've reached the database. They're in the walls.",
      "Empty. Even the database is ghosting me.",
      "Zero hits. Fine. Absence of evidence. Totally fine. Very fine.",
      "No records. I'm going to search my own name just to feel something.",
    ],
  ],
  idleGeneric: [
    [
      "Take your time. The roadmap isn't going anywhere. Hopefully.",
      "Read everything. The fine print is where the spies live.",
      "Pick two facts and make them fight.",
      "Somebody's paperwork is lying. It's usually the confident paperwork.",
      "The database is right there. It's free. Unlike GPUs.",
    ],
    [
      "Are we deciding, or are we going to keep admiring her lamination?",
      "The longer you stare, the more everything looks forged. That's not a method, that's anxiety.",
      "I can hear the stock price ticking. Is that normal? That's not normal.",
      "The jacket is getting warm. Decide something.",
      "Dolores has sent four memos while we've been standing here.",
    ],
    [
      "Every second we wait, Tessellate tapes out another chip with our name on the floorplan.",
      "Say something. Stamp something. The silence is a side channel.",
      "I've stared at this badge so long I can see its kerning.",
      "Is she blinking? Is that encryption? Don't answer.",
      "The answer is in the documents. The jacket told me. The jacket also says it's sentient.",
    ],
  ],
};

export function paranoiaTier(day: DayNumber): 0 | 1 | 2 {
  return day <= 2 ? 0 : day <= 4 ? 1 : 2;
}

/** rng01 is a number in [0, 1). Out-of-range values are clamped. */
export function jensenLine(situation: JensenSituation, day: DayNumber, rng01: number): string {
  const pool = JENSEN_LINES[situation][paranoiaTier(day)];
  const r = Number.isFinite(rng01) ? rng01 : 0;
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(r * pool.length)));
  return pool[index];
}
