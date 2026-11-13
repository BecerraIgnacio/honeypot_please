export type Verdict = "accept" | "reject";
export type Truth = "innocent" | "spy";
export type DayNumber = 1 | 2 | 3 | 4 | 5;

/**
 * A single selectable piece of information. Two facts can be compared by the
 * player to test for a discrepancy. Ids are unique within their owner (one
 * case, or the global scope). Global fact ids start with "g.".
 */
export interface Fact {
  id: string;
  label: string;
  value: string;
}

/**
 * Progress token. Everything the player can discover in a case is one of:
 *   "doc:<documentId>"   opened a document
 *   "q:<questionId>"     asked a question
 *   "d:<discrepancyId>"  triggered a discrepancy entry
 *   "rec:<recordId>"     opened a database record
 *   "scan"               ran the advanced scan
 *   "scan:<findingId>"   a specific scan finding (granted together with "scan")
 * Tokens gate questions, mark clues, and trigger easter eggs.
 */
export type Token = string;

export type DocKind =
  | "id-card"
  | "access-badge"
  | "conference-pass"
  | "personal-note"
  | "invitation-letter"
  | "employee-credential"
  | "security-memo"
  | "shipping-record"
  | "relationship-proof"
  | "board-notice"
  | "romance-artifact"
  | "photo"
  | "tabloid"
  | "certificate"
  | "receipt"
  | "other";

export interface GameDocument {
  id: string;
  kind: DocKind;
  title: string;
  issuer?: string;
  facts: Fact[];
  /** Free prose printed on the document. Not selectable. */
  body?: string;
  /** Short stamp text rendered at an angle, e.g. "VERIFIED" or "VOID". */
  stamp?: string;
  footer?: string;
}

export type DbCategory =
  | "employee"
  | "access-log"
  | "incident"
  | "alias"
  | "watchlist"
  | "chip-allocation"
  | "attendee"
  | "directive";

export interface DbRecord {
  id: string;
  category: DbCategory;
  title: string;
  /** Lowercase search terms beyond the title: names, badge numbers, firms. */
  keywords: string[];
  facts: Fact[];
  body?: string;
}

export interface Question {
  id: string;
  prompt: string;
  answer: string;
  /** Claims made in the answer that become selectable facts. */
  facts?: Fact[];
  /** Suspicion meter change when asked. May be negative. */
  suspicion?: number;
  /** Jensen's remark after the answer. */
  jensen?: string;
  /** All tokens must be discovered before the question is offered. */
  requires?: Token[];
}

export type DiscrepancyKind =
  /** A real conflict. Evidence of a lie or forgery. */
  | "contradiction"
  /** Looks like a conflict; the note (or an unlocked question) explains it innocently. */
  | "explained"
  /** The two facts corroborate each other. Evidence of legitimacy. */
  | "match";

export interface Discrepancy {
  id: string;
  /** Two fact ids, local to the case or global ("g." prefix). Order-insensitive. */
  facts: [string, string];
  kind: DiscrepancyKind;
  /** What the security terminal prints when the pair is compared. */
  note: string;
  suspicion: number;
  jensen?: string;
}

export type ScanFindingKind =
  | "hidden-note"
  | "forged-metadata"
  | "bag-contents"
  | "chip-diagram"
  | "access-device"
  | "ai-artifact"
  | "clean";

export interface ScanFinding {
  id: string;
  kind: ScanFindingKind;
  title: string;
  description: string;
  facts?: Fact[];
  suspicion: number;
}

export interface Outcome {
  headline: string;
  text: string;
}

export interface EasterEgg {
  id: string;
  title: string;
  /** Shown as a toast when found. */
  toast: string;
  /** Case-local token, or a global trigger: "search:<term>" / "ui:<name>". */
  on: Token;
}

export type HairStyle =
  | "bob"
  | "long"
  | "bun"
  | "pixie"
  | "curly"
  | "ponytail"
  | "braids"
  | "afro"
  | "bangs"
  | "shaved"
  | "hijab";

export type Accessory =
  | "glasses"
  | "sunglasses"
  | "earpiece"
  | "earrings"
  | "lanyard"
  | "headset"
  | "beret"
  | "pin"
  | "scarf"
  | "vr-headset";

export type OutfitStyle =
  | "blazer"
  | "hoodie"
  | "dress"
  | "turtleneck"
  | "leather-jacket"
  | "lab-coat"
  | "trench"
  | "tshirt";

export type SpecialPortrait = "gpu-wig" | "trenchcoat-gpus" | "sentient-jacket";

export type PortraitSpec =
  | {
      kind: "human";
      /** 1 (lightest) to 6 (darkest). */
      skin: 1 | 2 | 3 | 4 | 5 | 6;
      hair: { style: HairStyle; color: string };
      eyes?: "neutral" | "narrow" | "wide" | "tired" | "smug" | "wink";
      mouth?: "neutral" | "smile" | "smirk" | "frown" | "open";
      accessories?: Accessory[];
      outfit: { style: OutfitStyle; color: string };
      /** Backdrop hex color. */
      bg?: string;
    }
  | { kind: "special"; id: SpecialPortrait };

export interface CaseDef {
  id: string;
  day: DayNumber;
  /** regular: drawn into the daily lineup. rare: occasionally replaces a regular. finale: always last on its day. */
  slot: "regular" | "rare" | "finale";
  applicant: {
    name: string;
    nationality: string;
    occupation: string;
    statedReason: string;
    bio: string;
    portrait: PortraitSpec;
    /** First line spoken at the window. */
    greeting: string;
  };
  /** What she states at the window, as selectable facts (name, occupation, dates, employer...). */
  claims: Fact[];
  documents: GameDocument[];
  questions: Question[];
  /** Database records belonging to this case. Found through search. */
  records: DbRecord[];
  discrepancies: Discrepancy[];
  scan: ScanFinding[];
  /** Starting suspicion meter value, 0-100. Deliberately not a reliable signal. */
  baseSuspicion: number;
  /** Jensen's remark when she steps up. */
  jensenIntro: string;
  eggs?: EasterEgg[];
  truth: Truth;
  /** Who she really is. Revealed in the post-case review. */
  hiddenTruth: string;
  solution: {
    /** Tokens that are genuine evidence toward the right verdict. At least 3. */
    clues: Token[];
    /** Tokens that look damning (or exonerating) but mislead. At least 1. */
    redHerrings: Token[];
    /** Post-case review: how the case could be reasoned out. */
    explanation: string;
  };
  onAccept: Outcome;
  onReject: Outcome;
}

export interface DayDef {
  day: DayNumber;
  title: string;
  /** Morning briefing memo from Dolores Vance, Head of Romantic Security. */
  briefing: string;
  /** New rules of the day as searchable records. Fact ids start with "g.d<day>.". Stay in force on later days. */
  directives: DbRecord[];
  cases: CaseDef[];
  /** Jensen's idle mutterings for this day. Paranoia rises with the day number. */
  jensenIdle: string[];
}

export type RunOutcome = "in-progress" | "honeypotted" | "romantically-bankrupt" | "victory";

export interface DecisionRecord {
  caseId: string;
  applicantName: string;
  day: DayNumber;
  verdict: Verdict;
  truth: Truth;
  correct: boolean;
  /** Market cap change in billions of dollars. */
  marketCapDelta: number;
  stabilityDelta: number;
}

/** Counters the engine maintains. Achievements, the summary screen and share cards read only this. */
export interface RunStats {
  seed: number;
  day: DayNumber;
  casesSeen: number;
  spiesCaught: number;
  spiesAccepted: number;
  innocentsAccepted: number;
  innocentsRejected: number;
  questionsAsked: number;
  discrepanciesFound: number;
  scansUsed: number;
  recordsViewed: number;
  eggsFound: string[];
  /** Billions of dollars. */
  marketCap: number;
  startingMarketCap: number;
  /** 0-100. Zero ends the run as romantically-bankrupt. */
  romanticStability: number;
  decisions: DecisionRecord[];
  outcome: RunOutcome;
  /** Name of the spy who ended the run, if any. */
  fatalSpyName?: string;
}

export type GameEvent =
  | { type: "caseStarted"; caseId: string }
  | { type: "docOpened"; caseId: string; docId: string }
  | { type: "questionAsked"; caseId: string; questionId: string }
  | { type: "discrepancyFound"; caseId: string; discrepancyId: string; kind: DiscrepancyKind }
  | { type: "noConflict"; caseId: string }
  | { type: "dbSearched"; query: string; hits: number }
  | { type: "recordViewed"; recordId: string }
  | { type: "scanUsed"; caseId: string; findings: number }
  | { type: "eggFound"; eggId: string }
  | { type: "decided"; decision: DecisionRecord; investigated: number }
  | { type: "dayCompleted"; day: DayNumber }
  | { type: "runEnded"; outcome: RunOutcome };

export type Rarity = "common" | "rare" | "epic" | "legendary" | "cursed";

export type CardStyle = "security-report" | "tabloid" | "classified" | "board-memo" | "propaganda";

/** Persisted across runs in localStorage. */
export interface PlayerProfile {
  runsPlayed: number;
  victories: number;
  timesHoneypotted: number;
  timesBankrupt: number;
  totalSpiesCaught: number;
  eggsFound: string[];
  unlocked: Record<string, { at: number }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  /** One-line flavor shown in the collection. */
  flavor: string;
  /** The loud line on the share card. */
  memePhrase: string;
  /** Post templates using {variables}. See src/share/text.ts for the variable list. */
  shareTemplates: string[];
  cardStyle: CardStyle;
  /** Hidden in the collection until unlocked. */
  secret?: boolean;
  /** Evaluated after every event. `profile` is the state before this run is recorded. */
  condition: (ctx: { event: GameEvent; stats: RunStats; profile: PlayerProfile }) => boolean;
}

export interface Rank {
  id: string;
  title: string;
  blurb: string;
}
