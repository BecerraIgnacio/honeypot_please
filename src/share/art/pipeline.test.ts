import { describe, expect, it, vi } from "vitest";
import { remoteArtProvider, resolveArt, staticArtProvider, type ArtProvider } from "./pipeline";

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;

function fakeFetch(handler: Handler) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init)) as unknown as typeof fetch & {
    mock: { calls: Array<[string, RequestInit | undefined]> };
  };
}

describe("staticArtProvider", () => {
  it("returns the manifest file when it exists", async () => {
    const fetchImpl = fakeFetch((url) =>
      url === "/art/manifest.json" ? Response.json({ jacket: "jacket.png" }) : new Response(null, { status: url === "/art/jacket.png" ? 200 : 404 }),
    );
    const provider = staticArtProvider(fetchImpl);
    expect(await provider.resolve("jacket")).toBe("/art/jacket.png");
    expect(await provider.resolve("doom")).toBeNull();
    expect(fetchImpl.mock.calls.filter(([url]) => url === "/art/manifest.json")).toHaveLength(1);
  });

  it("falls through when the manifest or the file is missing", async () => {
    expect(await staticArtProvider(fakeFetch(() => new Response("nope", { status: 404 }))).resolve("jacket")).toBeNull();
    const missingFile = fakeFetch((url) => (url.endsWith("manifest.json") ? Response.json({ jacket: "jacket.png" }) : new Response(null, { status: 404 })));
    expect(await staticArtProvider(missingFile).resolve("jacket")).toBeNull();
    const broken = fakeFetch(() => {
      throw new TypeError("network down");
    });
    expect(await staticArtProvider(broken).resolve("jacket")).toBeNull();
  });

  it("ignores manifest entries that are not plain file names", async () => {
    const fetchImpl = fakeFetch((url) => (url.endsWith("manifest.json") ? Response.json({ jacket: "../../secret" }) : new Response(null)));
    expect(await staticArtProvider(fetchImpl).resolve("jacket")).toBeNull();
  });
});

describe("remoteArtProvider", () => {
  it("does not POST when the route reports disabled", async () => {
    const fetchImpl = fakeFetch(() => Response.json({ enabled: false }));
    const provider = remoteArtProvider(fetchImpl);
    expect(await provider.isEnabled()).toBe(false);
    expect(await provider.resolve("jacket")).toBeNull();
    expect(fetchImpl.mock.calls.every(([, init]) => (init?.method ?? "GET") === "GET")).toBe(true);
  });

  it("falls through on a non-image answer", async () => {
    const fetchImpl = fakeFetch((_, init) =>
      init?.method === "POST" ? Response.json({ error: { code: "upstream_error" } }, { status: 502 }) : Response.json({ enabled: true }),
    );
    expect(await remoteArtProvider(fetchImpl).resolve("jacket")).toBeNull();
  });
});

describe("resolveArt", () => {
  const provider = (id: ArtProvider["id"], url: string | null): ArtProvider => ({ id, resolve: async () => url });

  it("takes the first provider that answers", async () => {
    expect(await resolveArt("k", [provider("static", null), provider("remote", "blob:x")])).toEqual({ url: "blob:x", provider: "remote" });
    expect(await resolveArt("k", [provider("static", "/art/k.png"), provider("remote", "blob:x")])).toEqual({ url: "/art/k.png", provider: "static" });
  });

  it("returns null for the built-in illustration when nothing answers", async () => {
    expect(await resolveArt("k", [provider("static", null)])).toBeNull();
    expect(await resolveArt("k", [])).toBeNull();
  });
});
