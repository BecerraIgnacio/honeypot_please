export const ART_BASE = "/art/";
export const MANIFEST_URL = `${ART_BASE}manifest.json`;
export const MEME_ART_ENDPOINT = "/api/meme-art";

export type ArtProviderId = "static" | "remote";

export interface ArtResult {
  url: string;
  provider: ArtProviderId;
}

/** Resolves an art URL for a key, or null to fall through to the next provider. Never throws. */
export interface ArtProvider {
  id: ArtProviderId;
  resolve(key: string, signal?: AbortSignal): Promise<string | null>;
}

type Fetch = typeof fetch;

function parseManifest(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, file] of Object.entries(value)) {
    if (typeof file === "string" && /^[\w.-]+$/.test(file)) out[key] = file;
  }
  return out;
}

/** Pre-generated files listed in `/art/manifest.json`. */
export function staticArtProvider(fetchImpl: Fetch = (...args) => fetch(...args)): ArtProvider {
  let manifest: Promise<Record<string, string>> | null = null;
  const load = () =>
    (manifest ??= fetchImpl(MANIFEST_URL, { cache: "no-cache" })
      .then((res) => (res.ok ? res.json() : {}))
      .then(parseManifest)
      .catch((): Record<string, string> => ({})));
  return {
    id: "static",
    async resolve(key, signal) {
      const file = (await load())[key];
      if (!file) return null;
      const url = `${ART_BASE}${file}`;
      try {
        const res = await fetchImpl(url, { method: "HEAD", signal });
        return res.ok ? url : null;
      } catch {
        return null;
      }
    },
  };
}

/** `/api/meme-art`, which generates art on demand when the deployment enables it. */
export function remoteArtProvider(fetchImpl: Fetch = (...args) => fetch(...args)) {
  let enabled: Promise<boolean> | null = null;
  const isEnabled = () =>
    (enabled ??= fetchImpl(MEME_ART_ENDPOINT, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .then((body: unknown) => typeof body === "object" && body !== null && (body as { enabled?: unknown }).enabled === true)
      .catch(() => false));
  const provider: ArtProvider & { isEnabled: () => Promise<boolean> } = {
    id: "remote",
    isEnabled,
    async resolve(key, signal) {
      if (!(await isEnabled())) return null;
      try {
        const res = await fetchImpl(MEME_ART_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key }),
          signal,
        });
        if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) return null;
        return URL.createObjectURL(await res.blob());
      } catch {
        return null;
      }
    },
  };
  return provider;
}

/**
 * Tries each provider in order. Null means the built-in provider: the card draws its own
 * procedural illustration, which always works.
 */
export async function resolveArt(
  key: string,
  providers: readonly ArtProvider[],
  signal?: AbortSignal,
): Promise<ArtResult | null> {
  for (const provider of providers) {
    if (signal?.aborted) return null;
    const url = await provider.resolve(key, signal);
    if (url) return { url, provider: provider.id };
  }
  return null;
}
