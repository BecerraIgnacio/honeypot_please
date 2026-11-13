import type { DayNumber, RunOutcome, RunStats } from "../types";

export type EndOutcome = Exclude<RunOutcome, "in-progress">;

export interface Headline {
  headline: string;
  subhead: string;
}

/** Text still carries {variables}; the share layer fills them like share templates. */
export interface PickedHeadline extends Headline {
  boardStatement: string;
}

export const HEADLINES: Record<EndOutcome, Headline[]> = {
  honeypotted: [
    {
      headline: "NVIDIA CEO HONEYPOTTED AT GTC",
      subhead: "{marketCapLost} in shareholder value evaporates after what witnesses describe as 'a very normal coffee'.",
    },
    {
      headline: "SHE SAID SHE LOVED CUDA",
      subhead: "Sources confirm she did not, in fact, love CUDA. Market cap falls to {marketCap}.",
    },
    {
      headline: "{spyName} WALKS OUT WITH THE MOAT",
      subhead: "Security desk 'stamped it with total confidence', says a Board spokesperson, visibly sweating.",
    },
    {
      headline: "IF SHE'S A 10, YOU'RE AN ASSET",
      subhead: "Analysts downgrade NVDA from Strong Buy to Emotionally Available.",
    },
    {
      headline: "ROADMAP LEAKS, HEART BREAKS",
      subhead: "Rubin floorplan surfaces on a scalper forum hours after 'a lovely chat in the lobby'.",
    },
    {
      headline: "DAY {dayReached}: THE STAMP THAT SHOOK SANTA CLARA",
      subhead: "One ACCEPT. {marketCapLost} gone. The rubber stamp has been placed on administrative leave.",
    },
    {
      headline: "BOARD 'DEEPLY DISAPPOINTED, MOSTLY IN THE JACKET'",
      subhead: "The Jacket has declined to comment and is reportedly reviewing its options.",
    },
    {
      headline: "QUORUM SHORT FUND POPS CHAMPAGNE",
      subhead: "A hedge fund nobody admits to knowing books its best quarter since the last rumor.",
    },
    {
      headline: "SECURITY DESK FAILS ITS OWN VIBE CHECK",
      subhead: "{spiesCaught} spies caught before one got a visitor badge, a latte and the tape-out schedule.",
    },
    {
      headline: "EXCLUSIVE: {spyName} SPEAKS",
      subhead: "'He showed me the HBM allocation spreadsheet before I asked,' she says. 'I barely had to try.'",
    },
  ],
  "romantically-bankrupt": [
    {
      headline: "CEO REJECTS ENTIRE DATING POOL",
      subhead: "{wrongRejections} innocent applicants turned away. Romantic Stability: 0%.",
    },
    {
      headline: "ROMANTICALLY BANKRUPT",
      subhead: "The Endeavor building files for emotional Chapter 11 on Day {dayReached}.",
    },
    {
      headline: "TRUST ISSUES HIT ALL-TIME HIGH",
      subhead: "Unlike the stock, which closes at {marketCap}.",
    },
    {
      headline: "HE THOUGHT EVERYONE WAS A SPY. MOST WERE NOT.",
      subhead: "{wrongRejections} false positives. Security calls it 'thorough'. HR calls it 'a pattern'.",
    },
    {
      headline: "LOCAL BILLIONAIRE ENTERS LONG-TERM RELATIONSHIP WITH JACKET",
      subhead: "'It's the only one who never asked about allocation,' says a source close to the jacket.",
    },
    {
      headline: "ZERO-TRUST ARCHITECTURE APPLIED TO ROMANCE",
      subhead: "Engineers confirm it works. Far too well.",
    },
    {
      headline: "FALSE POSITIVE RATE: YES",
      subhead: "RPC-7 rejected {wrongRejections} real people and {spiesCaught} spies. The ratio has been forwarded to the Board.",
    },
    {
      headline: "GTC ATTENDEES ADVISED TO STOP SMILING NEAR LOBBY",
      subhead: "Romantic Perimeter Checkpoint 7 closes after stability hits zero on Day {dayReached}.",
    },
    {
      headline: "THE MOAT IS SAFE. THE MAN IS ALONE.",
      subhead: "Shareholders relieved. Dolores Vance 'concerned, in a professional capacity'.",
    },
  ],
  victory: [
    {
      headline: "THE UNHONEYPOTABLE",
      subhead: "CEO survives GTC week. {spiesCaught} spies denied at the lobby desk.",
    },
    {
      headline: "MOAT PRESERVED",
      subhead: "{marketCapPreserved} of shareholder value defended with a rubber stamp and reading comprehension.",
    },
    {
      headline: "SPIES 0, LEATHER JACKET 1",
      subhead: "Meridian Group analysts reportedly 'reconsidering careers in honest scalping'.",
    },
    {
      headline: "FIVE DAYS, ZERO LEAKS",
      subhead: "The roadmap remains exactly where it belongs: in a PDF nobody is allowed to open.",
    },
    {
      headline: "MARKET CAP HOLDS AT {marketCap}",
      subhead: "The Board issues a statement using the word 'unprecedented' eleven times.",
    },
    {
      headline: "ROMANTIC PERIMETER HOLDS",
      subhead: "{correctDecisions} correct decisions. Dolores Vance smiled once, briefly, on Friday.",
    },
    {
      headline: "QUORUM SHORT FUND SEEN WEEPING INTO A TERMINAL",
      subhead: "No scandal arrives. NVDA closes GTC week at {marketCap}.",
    },
    {
      headline: "CEO CLEARED FOR KEYNOTE SMALL TALK",
      subhead: "Security desk catches {spiesCaught} spies. Only {wrongRejections} innocent hearts were harmed.",
    },
    {
      headline: "THE MORE YOU SCAN, THE MORE YOU SAVE",
      subhead: "Analysts credit 'process' and 'a frankly unhealthy relationship with discrepancies'.",
    },
  ],
};

export const BOARD_STATEMENTS: string[] = [
  "The Board wishes to reassure shareholders that the romantic perimeter remains a core competency.",
  "The Board has convened an emergency session and, in an abundance of caution, an emergency session about that session.",
  "The Board reminds all parties that the CEO's heart is a material asset and will be disclosed as such in the next 10-Q.",
  "The Board does not comment on rumors, tabloids, or the jacket. The jacket comments on the Board.",
  "The Board considers this week a defining moment in the history of accelerated computing and accelerated feelings.",
  "Effective immediately, all applicants will be evaluated against the Board's new framework: Trust, Verify, Laminate.",
  "The Board thanks Dolores Vance, who has not slept since Monday and has asked that this not be mentioned.",
  "The Board would like to clarify that 'the more you buy, the more you save' does not apply to visitor badges.",
  "The Board has reviewed the events of the week and found them to be, in a word, unprecedented. In two words, very unprecedented.",
  "The Board is confident that the fundamentals remain strong. The Board has not been asked which fundamentals.",
];

export const dayEndLines: Record<DayNumber, string[]> = {
  1: [
    "Monday complete. Dolores files her report in triplicate and leaves without saying goodnight.",
    "End of Day 1. The badge printer is warm. The CEO is warmer. Nobody knows why.",
    "Shift over. Tomorrow is keynote day. Every spy in the Bay Area has ironed a blazer.",
  ],
  2: [
    "Keynote day survived. The crowd at SAP Center cheered for tokens per second. The lobby cheered for nothing.",
    "End of Day 2. Somewhere in a hotel bar, someone is still wearing a magnolia pin.",
    "Tuesday closed. The jacket received a standing ovation. The security desk received a sandwich.",
  ],
  3: [
    "Wednesday done. Dolores has started underlining things in her own memos.",
    "End of Day 3. The CEO has asked whether the potted fern has a badge.",
    "Shift over. The scanner needs a rest. So does everyone who has stood near the CEO.",
  ],
  4: [
    "Thursday complete. The lobby smells like burnt coffee and HBM.",
    "End of Day 4. One more day. The jacket is sitting up very straight.",
    "Shift over. The CEO is rehearsing tomorrow's rejections in the mirror.",
  ],
  5: [
    "Friday closed. GTC week is over. Every lanyard in Santa Clara breathes out.",
    "End of Day 5. Dolores Vance turns off the lobby lights and, for the first time all week, sits down.",
    "The week is done. The jacket goes back on its hanger. It does not sleep. It never sleeps.",
  ],
};

export const DISCLAIMER =
  "HONEYPOT, PLEASE is a work of parody and satire. Every applicant, spy, outfit, document, record and event in this game is fictional, and any resemblance to real people is coincidental. The CEO depicted here is a cartoon character in an absurd alternate universe, not a portrayal of any real person's life, conduct or relationships. This game is not affiliated with, sponsored by or endorsed by NVIDIA Corporation, any company mentioned, or any real person. Product names are trademarks of their owners and appear here only as jokes.";

/** rng01 in [0, 1) picks deterministically among the headlines the run's stats can fill. */
export function pickHeadline(outcome: EndOutcome, stats: RunStats, rng01: number): PickedHeadline {
  const usable = HEADLINES[outcome].filter(
    (h) => stats.fatalSpyName !== undefined || !`${h.headline} ${h.subhead}`.includes("{spyName}"),
  );
  const r = Number.isFinite(rng01) ? Math.min(Math.max(rng01, 0), 0.999999) : 0;
  const headline = usable[Math.floor(r * usable.length)];
  const boardStatement = BOARD_STATEMENTS[Math.floor(((r * 7919) % 1) * BOARD_STATEMENTS.length)];
  return { ...headline, boardStatement };
}
