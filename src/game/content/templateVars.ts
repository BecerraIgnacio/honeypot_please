/** Every {variable} a share template or end-of-run headline may use. Filled by src/share/text.ts. */
export const TEMPLATE_VARIABLES = [
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
] as const;

export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

export function templateVariablesIn(template: string): string[] {
  return [...template.matchAll(/\{([A-Za-z]+)\}/g)].map((m) => m[1]);
}

/** Joins lines into one post. The link always goes last, on its own line. */
export function post(...lines: string[]): string {
  return [...lines, "{launchTweetUrlOrGameUrl}"].join("\n");
}
