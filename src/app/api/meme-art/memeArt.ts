import { ART_SIZE, buildArtPrompt, isArtKey, type ArtKey } from "../../../share/art/prompts";

export const DEFAULT_BASE_URL = "https://argolink.io/v1";
export const DEFAULT_MODEL = "gpt-image-2";
export const UPSTREAM_TIMEOUT_MS = 280_000;
export const RATE_LIMIT = { max: 4, windowMs: 10 * 60_000 } as const;

export interface MemeArtConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

type Env = Record<string, string | undefined>;

/** Null unless the runtime route is switched on and a key is present. */
export function readMemeArtConfig(env: Env = process.env): MemeArtConfig | null {
  if (env.MEME_ART_RUNTIME?.trim() !== "1") return null;
  const apiKey = env.MEME_ART_API_KEY?.trim();
  if (!apiKey) return null;
  let baseUrl = DEFAULT_BASE_URL;
  const rawBase = env.MEME_ART_BASE_URL?.trim();
  if (rawBase) {
    try {
      const url = new URL(rawBase);
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      baseUrl = url.toString().replace(/\/+$/, "");
    } catch {
      return null;
    }
  }
  return { apiKey, baseUrl, model: env.MEME_ART_MODEL?.trim() || DEFAULT_MODEL };
}

interface ArtImage {
  bytes: Uint8Array<ArrayBuffer>;
  contentType: string;
}

class UpstreamError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const cache = new Map<ArtKey, Promise<ArtImage>>();
const hits = new Map<string, number[]>();

export function resetMemeArtState(): void {
  cache.clear();
  hits.clear();
}

function sniffContentType(bytes: Uint8Array): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return "image/png";
}

async function generate(config: MemeArtConfig, key: ArtKey, fetchImpl: typeof fetch): Promise<ArtImage> {
  let res: Response;
  try {
    res = await fetchImpl(`${config.baseUrl}/images/generations`, {
      method: "POST",
      headers: { authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: config.model, prompt: buildArtPrompt(key), n: 1, size: ART_SIZE, response_format: "b64_json" }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError");
    throw timedOut
      ? new UpstreamError(504, "upstream_timeout", "The image provider took too long.")
      : new UpstreamError(502, "upstream_unreachable", "The image provider could not be reached.");
  }
  const raw = await res.text().catch(() => "");
  if (!res.ok) throw new UpstreamError(502, "upstream_error", `The image provider answered ${res.status}.`);
  let b64: unknown;
  try {
    b64 = (JSON.parse(raw.trim()) as { data?: Array<{ b64_json?: unknown }> }).data?.[0]?.b64_json;
  } catch {
    throw new UpstreamError(502, "upstream_bad_response", "The image provider sent malformed JSON.");
  }
  if (typeof b64 !== "string" || !b64) throw new UpstreamError(502, "upstream_bad_response", "The image provider sent no image.");
  const bytes = new Uint8Array(Buffer.from(b64, "base64"));
  return { bytes, contentType: sniffContentType(bytes) };
}

function jsonError(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allow(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export function handleGet(env?: Env): Response {
  return Response.json({ enabled: readMemeArtConfig(env) !== null }, { headers: { "cache-control": "no-store" } });
}

export async function handlePost(
  request: Request,
  deps: { env?: Env; fetch?: typeof fetch; now?: () => number } = {},
): Promise<Response> {
  const config = readMemeArtConfig(deps.env);
  if (!config) return jsonError(501, "disabled", "Runtime meme art is not enabled on this deployment.");

  let key: unknown;
  try {
    key = ((await request.json()) as { key?: unknown } | null)?.key;
  } catch {
    return jsonError(400, "bad_request", "Send JSON: { \"key\": \"<art key>\" }.");
  }
  if (typeof key !== "string") return jsonError(400, "bad_request", "Send JSON: { \"key\": \"<art key>\" }.");
  if (!isArtKey(key)) return jsonError(404, "unknown_key", `No art prompt is registered for "${key.slice(0, 64)}".`);

  let pending = cache.get(key);
  const cached = pending !== undefined;
  if (!pending) {
    if (!allow(clientIp(request), (deps.now ?? Date.now)())) {
      return jsonError(429, "rate_limited", "Too many art requests from this address. Try again later.");
    }
    pending = generate(config, key, deps.fetch ?? fetch);
    cache.set(key, pending);
    pending.catch(() => cache.delete(key));
  }

  try {
    const image = await pending;
    return new Response(image.bytes, {
      headers: {
        "content-type": image.contentType,
        "cache-control": "private, max-age=86400",
        "x-meme-art-cache": cached ? "hit" : "miss",
      },
    });
  } catch (error) {
    if (error instanceof UpstreamError) return jsonError(error.status, error.code, error.message);
    return jsonError(500, "internal", "Art generation failed.");
  }
}
