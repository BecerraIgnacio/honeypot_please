import type { Achievement, Rank, RunOutcome, RunStats } from "../game/types";
import type { ShareUrls } from "./config";

export const X_MAX_LENGTH = 280;
export const X_URL_LENGTH = 23;

/** Every `{name}` a share template may reference. */
export interface ShareVars {
  achievementTitle?: string;
  memePhrase?: string;
  marketCapLost: string;
  marketCapPreserved: string;
  marketCap: string;
  correctDecisions: string;
  wrongRejections: string;
  spiesCaught: string;
  dayReached: string;
  spyName?: string;
  playerRank: string;
  gameUrl: string;
  launchTweetUrl?: string;
  launchTweetUrlOrGameUrl: string;
}

export type ShareVarName = keyof ShareVars;

const VAR_NAMES: ReadonlySet<string> = new Set<ShareVarName>([
  "achievementTitle",
  "memePhrase",
  "marketCapLost",
  "marketCapPreserved",
  "marketCap",
  "correctDecisions",
  "wrongRejections",
  "spiesCaught",
  "dayReached",
  "spyName",
  "playerRank",
  "gameUrl",
  "launchTweetUrl",
  "launchTweetUrlOrGameUrl",
]);

const PLACEHOLDER = /\{([A-Za-z]+)\}/g;

export function formatMoney(billions: number): string {
  const sign = billions < 0 ? "-" : "";
  const abs = Math.abs(billions);
  const trim = (n: number) => n.toFixed(1).replace(/\.0$/, "");
  if (abs >= 999.5) return `${sign}$${trim(abs / 1000)}T`;
  if (abs >= 10) return `${sign}$${Math.round(abs)}B`;
  if (abs >= 1) return `${sign}$${trim(abs)}B`;
  if (abs === 0) return "$0B";
  return `${sign}$${Math.max(1, Math.round(abs * 1000))}M`;
}

export function buildShareVars(
  stats: RunStats,
  rank: Rank,
  achievement: Achievement | null,
  urls: ShareUrls,
): ShareVars {
  const lost = Math.max(0, stats.startingMarketCap - stats.marketCap);
  const gameUrl = urls.gameUrl || undefined;
  return {
    achievementTitle: achievement?.title,
    memePhrase: achievement?.memePhrase,
    marketCapLost: formatMoney(lost),
    marketCapPreserved: formatMoney(Math.min(stats.marketCap, stats.startingMarketCap)),
    marketCap: formatMoney(stats.marketCap),
    correctDecisions: String(stats.decisions.filter((d) => d.correct).length),
    wrongRejections: String(stats.innocentsRejected),
    spiesCaught: String(stats.spiesCaught),
    dayReached: String(stats.day),
    spyName: stats.fatalSpyName?.trim() || undefined,
    playerRank: rank.title,
    gameUrl: gameUrl ?? "",
    launchTweetUrl: urls.launchTweetUrl,
    launchTweetUrlOrGameUrl: urls.launchTweetUrl ?? gameUrl ?? "",
  };
}

function valueOf(vars: ShareVars, name: string): string | undefined {
  if (!VAR_NAMES.has(name)) return undefined;
  const value = vars[name as ShareVarName];
  return value && value.trim() ? value : undefined;
}

export function templateVariables(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map((m) => m[1]);
}

/** A template is eligible only when every placeholder it uses has a value. */
export function isEligible(template: string, vars: ShareVars): boolean {
  return templateVariables(template).every((name) => valueOf(vars, name) !== undefined);
}

export function eligibleTemplates(templates: readonly string[], vars: ShareVars): string[] {
  return templates.filter((t) => isEligible(t, vars));
}

/** Missing values render as an empty string; call `isEligible` first to avoid that. */
export function renderTemplate(template: string, vars: ShareVars): string {
  return template
    .replace(PLACEHOLDER, (_, name: string) => valueOf(vars, name) ?? "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const URL_IN_TEXT = /https?:\/\/[^\s]+?(?=[.,!?;:'")\]]*(?:\s|$))/g;

function charWeight(codePoint: number): number {
  if (
    codePoint <= 4351 ||
    (codePoint >= 8192 && codePoint <= 8205) ||
    (codePoint >= 8208 && codePoint <= 8223) ||
    (codePoint >= 8242 && codePoint <= 8247)
  ) {
    return 1;
  }
  return 2;
}

/** Length as X counts it: every URL is 23, CJK and emoji weigh 2. */
export function xLength(text: string): number {
  const normalized = text.normalize("NFC");
  let length = 0;
  let rest = normalized;
  for (const match of normalized.matchAll(URL_IN_TEXT)) {
    length += X_URL_LENGTH;
    rest = rest.replace(match[0], "");
  }
  for (const char of rest) length += charWeight(char.codePointAt(0) ?? 0);
  return length;
}

export function fitsX(text: string): boolean {
  return xLength(text) <= X_MAX_LENGTH;
}

export const FALLBACK_TEMPLATES: Readonly<Record<RunOutcome, readonly string[]>> = {
  victory: [
    "Survived GTC week at Romantic Perimeter Checkpoint 7. {spiesCaught} spies caught, {correctDecisions} correct calls, market cap intact at {marketCap}. Rank: {playerRank}. The Jacket is satisfied. {launchTweetUrlOrGameUrl}",
    "Five days guarding the world's most valuable man from the world's least reliable dating pool. Zero honeypots got through. The Board called it \"adequate.\" {launchTweetUrlOrGameUrl}",
    "Caught {spiesCaught} spies and only broke {wrongRejections} innocent hearts. NVIDIA closes the week at {marketCap}. The more you screen, the more you save. {launchTweetUrlOrGameUrl}",
    "Security clearance: {playerRank}. {correctDecisions} correct decisions, not one forged GTC pass past my desk. Can you keep him single and solvent? {launchTweetUrlOrGameUrl}",
    "Friday, 5:00 PM. The roadmap is safe, the jacket is unclaimed, and {marketCapPreserved} of shareholder value thanks me personally. {launchTweetUrlOrGameUrl}",
  ],
  honeypotted: [
    "I let {spyName} through the Romantic Perimeter. NVIDIA lost {marketCapLost} before lunch. HONEYPOTTED on Day {dayReached}. {launchTweetUrlOrGameUrl}",
    "She said she loved him for his personality. His personality is CUDA. I approved her anyway. {marketCapLost} in shareholder value, gone. {launchTweetUrlOrGameUrl}",
    "HONEYPOTTED. Day {dayReached}, {marketCapLost} erased, one leather jacket placed in protective custody. Rank: {playerRank}. {launchTweetUrlOrGameUrl}",
    "If she's a 10, you're an asset. I learned this {marketCapLost} too late. {launchTweetUrlOrGameUrl}",
    "{spyName} walked out with the Rubin roadmap and a signed GPU. I stamped the visitor pass myself. Rank: {playerRank}. {launchTweetUrlOrGameUrl}",
    "Approved one (1) dinner reservation. It was a roadmap heist. Shareholders are down {marketCapLost} and the Jacket has entered witness protection. {launchTweetUrlOrGameUrl}",
  ],
  "romantically-bankrupt": [
    "I rejected {wrongRejections} perfectly innocent applicants. Romantic Stability: 0%. The Board has declared him romantically bankrupt. {launchTweetUrlOrGameUrl}",
    "Zero spies got through. Zero dates did either. Romantically bankrupt on Day {dayReached} after {wrongRejections} wrongful rejections. {launchTweetUrlOrGameUrl}",
    "Turned away {wrongRejections} innocents for being \"suspiciously good at CUDA.\" He now dates only the Jacket. Rank: {playerRank}. {launchTweetUrlOrGameUrl}",
    "Security was airtight. So was his calendar. ROMANTICALLY BANKRUPT on Day {dayReached}. {launchTweetUrlOrGameUrl}",
    "My perimeter caught {spiesCaught} spies and {wrongRejections} people who just wanted coffee. The Board calls it \"overcorrection.\" {launchTweetUrlOrGameUrl}",
  ],
  "in-progress": [
    "Day {dayReached} at Romantic Perimeter Checkpoint 7. {spiesCaught} spies caught so far. NVIDIA holding at {marketCap}. Nobody touches the jacket. {launchTweetUrlOrGameUrl}",
    "Currently screening the world's least reliable dating pool for the world's most valuable man. Rank: {playerRank}. Send help and HBM. {launchTweetUrlOrGameUrl}",
    "{correctDecisions} correct calls at the Romantic Perimeter and counting. Every applicant has a GTC pass. Not every pass is real. {launchTweetUrlOrGameUrl}",
    "Day {dayReached} of GTC week. Market cap {marketCap}. Paranoia: rising. Applicants: still arriving with signed GPUs. {launchTweetUrlOrGameUrl}",
  ],
};

const LAST_RESORT = "HONEYPOT, PLEASE. The world's most valuable man. The world's least reliable dating pool.";

function candidates(templates: readonly string[], vars: ShareVars): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const template of eligibleTemplates(templates, vars)) {
    const text = renderTemplate(template, vars);
    if (!text || !fitsX(text) || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

/** Every distinct, eligible, X-sized text for these templates, falling back to the run summary set. */
export function shareTextOptions(
  templates: readonly string[],
  vars: ShareVars,
  outcome: RunOutcome = "in-progress",
): string[] {
  const own = candidates(templates, vars);
  if (own.length) return own;
  const fallback = candidates(FALLBACK_TEMPLATES[outcome], vars);
  if (fallback.length) return fallback;
  const url = vars.launchTweetUrlOrGameUrl || vars.gameUrl;
  return [url ? `${LAST_RESORT} ${url}` : LAST_RESORT];
}

/** Cycles through the options so a shuffle button can step `variantIndex`. */
export function pickShareText(
  templates: readonly string[],
  vars: ShareVars,
  variantIndex: number,
  outcome?: RunOutcome,
): string {
  const options = shareTextOptions(templates, vars, outcome);
  const i = ((Math.trunc(variantIndex) % options.length) + options.length) % options.length;
  return options[i];
}
