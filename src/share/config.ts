export interface ShareUrls {
  /** Empty only when neither the env nor `window.location` can supply it (server render). */
  gameUrl: string;
  launchTweetUrl?: string;
}

export interface ShareUrlInputs {
  launchTweetUrl?: string;
  gameUrl?: string;
  origin?: string;
}

/** Returns a normalized http(s) URL, or undefined for anything else. */
export function parseHttpUrl(value: string | undefined | null): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  if (!url.hostname) return undefined;
  const text = url.toString();
  return url.pathname === "/" && !url.search && !url.hash ? text.replace(/\/$/, "") : text;
}

function browserOrigin(): string | undefined {
  return typeof window === "undefined" ? undefined : window.location.origin;
}

/**
 * Reads `NEXT_PUBLIC_*` with literal property access so Next inlines them into the client bundle.
 * Inputs override the env, for tests and callers that already know the values.
 */
export function resolveShareUrls(inputs: ShareUrlInputs = {}): ShareUrls {
  const launchTweetUrl = parseHttpUrl(
    "launchTweetUrl" in inputs ? inputs.launchTweetUrl : process.env.NEXT_PUBLIC_LAUNCH_TWEET_URL,
  );
  const gameUrl =
    parseHttpUrl("gameUrl" in inputs ? inputs.gameUrl : process.env.NEXT_PUBLIC_GAME_URL) ??
    parseHttpUrl(inputs.origin ?? browserOrigin()) ??
    "";
  return launchTweetUrl ? { gameUrl, launchTweetUrl } : { gameUrl };
}

/** `https://honeypot.example/play` → `honeypot.example/play`, for printing on cards. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
