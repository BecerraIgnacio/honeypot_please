import { afterEach, describe, expect, it, vi } from "vitest";
import type { Rank, RunStats } from "../game/types";
import { displayUrl, parseHttpUrl, resolveShareUrls } from "./config";
import { buildShareVars, pickShareText } from "./text";

const TWEET = "https://x.com/someone/status/1234567890";
const GAME = "https://honeypot.example";

const stats = {
  day: 2,
  spiesCaught: 1,
  innocentsRejected: 0,
  marketCap: 5000,
  startingMarketCap: 5000,
  decisions: [],
  outcome: "victory",
} as unknown as RunStats;
const rank: Rank = { id: "r", title: "Badge Whisperer", blurb: "" };

function shareText(): string {
  return pickShareText(["Play it: {launchTweetUrlOrGameUrl}"], buildShareVars(stats, rank, null, resolveShareUrls()), 0);
}

afterEach(() => vi.unstubAllEnvs());

describe("parseHttpUrl", () => {
  it.each([
    ["https://honeypot.example", "https://honeypot.example"],
    ["https://honeypot.example/", "https://honeypot.example"],
    ["  http://localhost:3000/play  ", "http://localhost:3000/play"],
    [TWEET, TWEET],
  ])("accepts %s", (input, expected) => expect(parseHttpUrl(input)).toBe(expected));

  it.each(["", "   ", "not a url", "javascript:alert(1)", "ftp://example.com/file", "x.com/status/1", undefined])(
    "rejects %s",
    (input) => expect(parseHttpUrl(input)).toBeUndefined(),
  );
});

describe("launch tweet fallback", () => {
  it("links the launch tweet when NEXT_PUBLIC_LAUNCH_TWEET_URL is set", () => {
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_TWEET_URL", TWEET);
    vi.stubEnv("NEXT_PUBLIC_GAME_URL", GAME);
    expect(shareText()).toBe(`Play it: ${TWEET}`);
  });

  it("links the game when it is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_TWEET_URL", "");
    vi.stubEnv("NEXT_PUBLIC_GAME_URL", GAME);
    expect(shareText()).toBe(`Play it: ${GAME}`);
  });

  it("treats an invalid value as unset", () => {
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_TWEET_URL", "x.com/oops");
    vi.stubEnv("NEXT_PUBLIC_GAME_URL", GAME);
    expect(resolveShareUrls()).toEqual({ gameUrl: GAME });
    expect(shareText()).toBe(`Play it: ${GAME}`);
  });

  it("infers the game URL from the origin when NEXT_PUBLIC_GAME_URL is unset or invalid", () => {
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_TWEET_URL", "");
    vi.stubEnv("NEXT_PUBLIC_GAME_URL", "nonsense");
    expect(resolveShareUrls({ origin: "https://preview-123.vercel.app" })).toEqual({ gameUrl: "https://preview-123.vercel.app" });
  });

  it("returns an empty game URL when nothing can supply one", () => {
    vi.stubEnv("NEXT_PUBLIC_LAUNCH_TWEET_URL", "");
    vi.stubEnv("NEXT_PUBLIC_GAME_URL", "");
    expect(resolveShareUrls()).toEqual({ gameUrl: "" });
  });
});

describe("displayUrl", () => {
  it("drops the scheme and trailing slash", () => {
    expect(displayUrl("https://honeypot.example/")).toBe("honeypot.example");
    expect(displayUrl("http://localhost:3000/play")).toBe("localhost:3000/play");
  });
});
