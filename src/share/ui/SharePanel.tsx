"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { RunOutcome } from "../../game/types";
import { canNativeShare, copyText, downloadBlob, nativeShare, openXIntent } from "../actions";
import { remoteArtProvider, resolveArt, staticArtProvider } from "../art/pipeline";
import { renderCardToBlob, resolveFonts } from "../card/render";
import type { CardData, CardSize } from "../card/types";
import { X_MAX_LENGTH, shareTextOptions, xLength, type ShareVars } from "../text";

export interface SharePanelProps {
  card: CardData;
  templates: string[];
  vars: ShareVars;
  /** Defaults to the card style's key. */
  artKey?: string;
  /** Picks the built-in fallback texts when none of `templates` is usable. */
  outcome?: RunOutcome;
}

type Flash = "copied" | "copy-failed" | "saved" | "shared" | null;

interface Rendered {
  key: string;
  blob: Blob;
  url: string;
}

const noopSubscribe = () => () => {};

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "card"
  );
}

const button =
  "border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6ff00]";
const primary = `${button} border-[#b6ff00] bg-[#b6ff00] text-[#0d0f0e] hover:bg-[#d4ff66]`;
const secondary = `${button} border-[#b6ff00]/40 bg-[#151816] text-[#f1e9d2] hover:border-[#b6ff00] hover:text-[#b6ff00]`;

export function SharePanel({ card, templates, vars, artKey, outcome }: SharePanelProps) {
  const cardKey = JSON.stringify(card);
  const stableCard = useMemo(() => JSON.parse(cardKey) as CardData, [cardKey]);
  const key = artKey ?? stableCard.style;

  const [size, setSize] = useState<CardSize>("landscape");
  const [variant, setVariant] = useState(0);
  const [staticArt, setStaticArt] = useState<string | null>(null);
  const [enhancedArt, setEnhancedArt] = useState<string | null>(null);
  const [remote] = useState(() => remoteArtProvider());
  const [remoteEnabled, setRemoteEnabled] = useState(false);
  const [enhancing, setEnhancing] = useState<"idle" | "working" | "failed">("idle");
  const [rendered, setRendered] = useState<Rendered | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const canShare = useSyncExternalStore(noopSubscribe, canNativeShare, () => false);

  const options = useMemo(() => shareTextOptions(templates, vars, outcome), [templates, vars, outcome]);
  const index = ((variant % options.length) + options.length) % options.length;
  const text = options[index];
  const count = xLength(text);

  const artUrl = enhancedArt ?? stableCard.artUrl ?? staticArt ?? undefined;
  const renderKey = `${cardKey}|${size}|${artUrl ?? ""}`;
  const filename = `honeypot-please-${slug(stableCard.title)}-${size}.png`;

  useEffect(() => {
    let live = true;
    remote.isEnabled().then((enabled) => live && setRemoteEnabled(enabled));
    return () => {
      live = false;
    };
  }, [remote]);

  useEffect(() => {
    if (stableCard.artUrl) return;
    const controller = new AbortController();
    resolveArt(key, [staticArtProvider()], controller.signal).then((art) => {
      if (!controller.signal.aborted) setStaticArt(art?.url ?? null);
    });
    return () => controller.abort();
  }, [key, stableCard.artUrl]);

  useEffect(() => {
    let live = true;
    renderCardToBlob({ ...stableCard, artUrl }, size, resolveFonts())
      .then((blob) => {
        if (!live) return;
        setRendered({ key: renderKey, blob, url: URL.createObjectURL(blob) });
        setRenderError(null);
      })
      .catch((error: unknown) => live && setRenderError(error instanceof Error ? error.message : "Render failed"));
    return () => {
      live = false;
    };
  }, [stableCard, size, artUrl, renderKey]);

  useEffect(() => {
    if (!rendered) return;
    return () => URL.revokeObjectURL(rendered.url);
  }, [rendered]);

  useEffect(() => {
    if (!enhancedArt) return;
    return () => URL.revokeObjectURL(enhancedArt);
  }, [enhancedArt]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 1800);
    return () => clearTimeout(timer);
  }, [flash]);

  const ready = rendered !== null;
  const stale = rendered?.key !== renderKey;

  async function onCopy() {
    setFlash((await copyText(text)) ? "copied" : "copy-failed");
  }

  function onDownload() {
    if (!rendered) return;
    downloadBlob(rendered.blob, filename);
    setFlash("saved");
  }

  async function onNativeShare() {
    const file = rendered ? new File([rendered.blob], filename, { type: "image/png" }) : undefined;
    const result = await nativeShare({ text, file });
    if (result === "shared-with-file" || result === "shared-text") setFlash("shared");
  }

  async function onEnhance() {
    setEnhancing("working");
    const url = await remote.resolve(key);
    if (url) {
      setEnhancedArt(url);
      setEnhancing("idle");
    } else {
      setEnhancing("failed");
    }
  }

  return (
    <section
      aria-label="Share this result"
      className="flex w-full max-w-3xl flex-col gap-4 border border-[#b6ff00]/30 bg-[#0d0f0e] p-4 font-(family-name:--font-mono) text-[#f1e9d2] shadow-[0_0_0_1px_#151816,0_24px_60px_-20px_rgba(182,255,0,0.25)]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-[#b6ff00]/20 pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b6ff00]">
          <span aria-hidden className="mr-2 inline-block size-2 animate-pulse bg-[#e5322d]" />
          Evidence export
        </p>
        <div role="radiogroup" aria-label="Card format" className="flex border border-[#b6ff00]/40">
          {(["landscape", "square"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={size === option}
              onClick={() => setSize(option)}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                size === option ? "bg-[#b6ff00] text-[#0d0f0e]" : "text-[#f1e9d2]/70 hover:text-[#b6ff00]"
              }`}
            >
              {option === "landscape" ? "X 16:9" : "Square"}
            </button>
          ))}
        </div>
      </header>

      <div
        className={`relative mx-auto w-full overflow-hidden border border-[#151816] bg-[#151816] ${
          size === "landscape" ? "aspect-[1200/675]" : "aspect-square max-w-md"
        }`}
      >
        {ready && (
          // A blob URL from the canvas; next/image cannot optimize it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rendered.url}
            alt={`${stableCard.title}: ${stableCard.memePhrase}`}
            className={`size-full object-contain transition-opacity duration-200 ${stale ? "opacity-50" : "opacity-100"}`}
          />
        )}
        {(!ready || stale) && !renderError && (
          <p className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.3em] text-[#b6ff00]">
            Rendering evidence…
          </p>
        )}
        {renderError && (
          <p role="alert" className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-[#e5322d]">
            Card render failed: {renderError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-[#f1e9d2]/60">
          <label htmlFor="share-text">Post text</label>
          <span className={count > X_MAX_LENGTH ? "text-[#e5322d]" : count > X_MAX_LENGTH - 20 ? "text-[#ffb000]" : ""}>
            {count}/{X_MAX_LENGTH}
          </span>
        </div>
        <output
          id="share-text"
          aria-live="polite"
          className="block min-h-20 whitespace-pre-wrap border border-[#b6ff00]/20 bg-[#151816] p-3 text-sm leading-relaxed"
        >
          {text}
        </output>
        <button
          type="button"
          className={`${secondary} self-start`}
          disabled={options.length < 2}
          onClick={() => setVariant((v) => v + 1)}
        >
          Shuffle text {options.length > 1 ? `(${index + 1}/${options.length})` : ""}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={primary} onClick={() => openXIntent(text)}>
          Share on X
        </button>
        <button type="button" className={secondary} onClick={onCopy}>
          {flash === "copied" ? "Copied ✓" : flash === "copy-failed" ? "Copy blocked" : "Copy text"}
        </button>
        <button type="button" className={secondary} onClick={onDownload} disabled={!ready}>
          {flash === "saved" ? "Saved ✓" : "Download image"}
        </button>
        {canShare && (
          <button type="button" className={secondary} onClick={onNativeShare}>
            {flash === "shared" ? "Shared ✓" : "Share…"}
          </button>
        )}
        {remoteEnabled && (
          <button
            type="button"
            className={`${button} border-[#ffb000]/60 bg-[#151816] text-[#ffb000] hover:border-[#ffb000]`}
            onClick={onEnhance}
            disabled={enhancing === "working" || enhancedArt !== null}
          >
            {enhancing === "working"
              ? "Enhancing… (can take minutes)"
              : enhancing === "failed"
                ? "Enhance failed. Retry"
                : enhancedArt
                  ? "Art enhanced ✓"
                  : "Enhance art"}
          </button>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {flash === "copied" ? "Post text copied" : flash === "saved" ? "Image downloaded" : flash === "copy-failed" ? "Copy failed" : ""}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-[#f1e9d2]/40">
        Nothing posts automatically. Share on X opens a draft you can edit.
      </p>
    </section>
  );
}
