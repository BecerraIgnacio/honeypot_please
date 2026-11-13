import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ connection: async () => {} }));

import { buildArtPrompt } from "../../../share/art/prompts";
import { RATE_LIMIT, resetMemeArtState } from "./memeArt";
import { GET, POST, maxDuration } from "./route";

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

function post(body: unknown, ip = "203.0.113.7"): Request {
  return new Request("http://localhost/api/meme-art", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function enable() {
  vi.stubEnv("MEME_ART_RUNTIME", "1");
  vi.stubEnv("MEME_ART_API_KEY", "test-key");
  vi.stubEnv("MEME_ART_BASE_URL", "https://images.example/v1/");
  vi.stubEnv("MEME_ART_MODEL", "");
}

function mockProvider(body = `\n\n   ${JSON.stringify({ data: [{ b64_json: Buffer.from(PNG).toString("base64") }] })}`, status = 200) {
  const fetchMock = vi.fn(async () => new Response(body, { status, headers: { "content-type": "application/json" } }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  resetMemeArtState();
  vi.stubEnv("MEME_ART_RUNTIME", "");
  vi.stubEnv("MEME_ART_API_KEY", "");
  vi.stubEnv("MEME_ART_BASE_URL", "");
  vi.stubEnv("MEME_ART_MODEL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/meme-art", () => {
  it("reports disabled with no env", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ enabled: false });
  });

  it("stays disabled with a key but without MEME_ART_RUNTIME=1", async () => {
    vi.stubEnv("MEME_ART_API_KEY", "test-key");
    expect(await (await GET()).json()).toEqual({ enabled: false });
  });

  it("reports enabled when configured", async () => {
    enable();
    expect(await (await GET()).json()).toEqual({ enabled: true });
  });

  it("allows long generations", () => {
    expect(maxDuration).toBe(300);
  });
});

describe("POST /api/meme-art", () => {
  it("answers 501 with no env, without calling the provider", async () => {
    const fetchMock = mockProvider();
    const res = await POST(post({ key: "jacket" }));
    expect(res.status).toBe(501);
    expect(await res.json()).toEqual({ error: { code: "disabled", message: "Runtime meme art is not enabled on this deployment." } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unknown keys and free-text prompts with 404", async () => {
    enable();
    const fetchMock = mockProvider();
    const res = await POST(post({ key: "a portrait of a famous CEO", prompt: "anything" }));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("unknown_key");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed bodies with 400", async () => {
    enable();
    mockProvider();
    expect((await POST(post("{not json"))).status).toBe(400);
    expect((await POST(post({ prompt: "draw a cat" }))).status).toBe(400);
  });

  it("returns the generated image and serves the second call from cache", async () => {
    enable();
    const fetchMock = mockProvider();

    const first = await POST(post({ key: "jacket" }));
    expect(first.status).toBe(200);
    expect(first.headers.get("content-type")).toBe("image/png");
    expect(first.headers.get("x-meme-art-cache")).toBe("miss");
    expect(new Uint8Array(await first.arrayBuffer())).toEqual(PNG);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://images.example/v1/images/generations");
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer test-key");
    expect(JSON.parse(String(init.body))).toEqual({
      model: "gpt-image-2",
      prompt: buildArtPrompt("jacket"),
      n: 1,
      size: "1536x1024",
      response_format: "b64_json",
    });

    const second = await POST(post({ key: "jacket" }, "198.51.100.1"));
    expect(second.status).toBe(200);
    expect(second.headers.get("x-meme-art-cache")).toBe("hit");
    expect(new Uint8Array(await second.arrayBuffer())).toEqual(PNG);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps provider failures to 502 JSON and does not cache them", async () => {
    enable();
    mockProvider(JSON.stringify({ error: "quota" }), 429);
    const res = await POST(post({ key: "doom" }));
    expect(res.status).toBe(502);
    expect((await res.json()).error.code).toBe("upstream_error");

    const fetchMock = mockProvider();
    expect((await POST(post({ key: "doom" }))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps a provider timeout to 504", async () => {
    enable();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
      }),
    );
    const res = await POST(post({ key: "victory" }));
    expect(res.status).toBe(504);
    expect((await res.json()).error.code).toBe("upstream_timeout");
  });

  it("rate-limits uncached generations per IP", async () => {
    enable();
    mockProvider();
    const keys = ["victory", "doom", "jacket", "gpu-wig", "trenchcoat", "bankrupt"];
    const statuses: number[] = [];
    for (const key of keys.slice(0, RATE_LIMIT.max + 1)) statuses.push((await POST(post({ key }))).status);
    expect(statuses).toEqual([...Array(RATE_LIMIT.max).fill(200), 429]);
    expect((await POST(post({ key: keys[RATE_LIMIT.max] }, "192.0.2.50"))).status).toBe(200);
    expect((await POST(post({ key: "victory" }))).status).toBe(200);
  });
});
