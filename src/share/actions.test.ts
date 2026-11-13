import { describe, expect, it } from "vitest";
import { xIntentUrl } from "./actions";

describe("xIntentUrl", () => {
  it("percent-encodes the whole text into the text parameter", () => {
    const text = "HONEYPOTTED & bankrupt? 100% #GTC 🔥\nhttps://honeypot.example/?a=1&b=2";
    expect(xIntentUrl(text)).toBe(
      "https://twitter.com/intent/tweet?text=HONEYPOTTED%20%26%20bankrupt%3F%20100%25%20%23GTC%20%F0%9F%94%A5%0Ahttps%3A%2F%2Fhoneypot.example%2F%3Fa%3D1%26b%3D2",
    );
  });

  it("round-trips through URLSearchParams", () => {
    const text = `She said "AMD" with affection. $840B gone. https://x.com/a/status/1`;
    const url = new URL(xIntentUrl(text));
    expect(url.origin + url.pathname).toBe("https://twitter.com/intent/tweet");
    expect([...url.searchParams.keys()]).toEqual(["text"]);
    expect(url.searchParams.get("text")).toBe(text);
  });
});
