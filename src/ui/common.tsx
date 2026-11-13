"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { jensenSvg } from "../art/jensen";
import { Pixel } from "../art/PixelArt";
import { ACHIEVEMENTS } from "../game/content/achievements";
import { findEgg, revealedFacts, type FactRef } from "../game/engine";
import type { Fact } from "../game/types";
import { CONTENT, RARITY, money, refKey, sameRef } from "./content";
import { useGame, useReducedMotion } from "./GameProvider";
import { sfx } from "./sound";

type Variant = "primary" | "ghost" | "danger" | "paper";

export function Btn({
  variant = "ghost",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** A selectable fact. Selection is global: any revealed fact anywhere can be one of the two compare slots. */
export function FactChip({ owner, fact, compact = false }: { owner: string; fact: Fact; compact?: boolean }) {
  const { s, dispatch } = useGame();
  const ref: FactRef = { owner, id: fact.id };
  const slot = s.selection.findIndex((r) => sameRef(r, ref));
  const revealed = s.run ? revealedFacts(s.run, CONTENT).some((f) => refKey(f.ref) === refKey(ref)) : false;
  return (
    <button
      type="button"
      className={`fact ${compact ? "fact-compact" : ""} ${slot >= 0 ? "fact-on" : ""}`}
      aria-pressed={slot >= 0}
      disabled={!revealed || s.run?.phase.kind !== "case"}
      onClick={() => {
        sfx("key");
        dispatch({ type: "select", ref });
      }}
      title={slot >= 0 ? "Selected for COMPARE. Click to deselect." : "Select for COMPARE"}
    >
      <span className="fact-label">{fact.label}</span>
      <span className="fact-value">{fact.value}</span>
      {slot >= 0 && <span className="fact-slot">{slot === 0 ? "A" : "B"}</span>}
    </button>
  );
}

export function FactList({ owner, facts, compact }: { owner: string; facts: Fact[] | undefined; compact?: boolean }) {
  if (!facts?.length) return null;
  return (
    <div className="flex flex-col gap-1">
      {facts.map((f) => (
        <FactChip key={f.id} owner={owner} fact={f} compact={compact} />
      ))}
    </div>
  );
}

/** Animated count between market-cap values; jumps straight there under reduced motion. */
export function MarketCap({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const [dir, setDir] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = reduced ? 0 : 900;
    const tick = (t: number) => {
      const k = dur === 0 ? 1 : Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(start + (value - start) * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame((t) => {
      setDir(value > start ? "up" : "down");
      tick(t);
    });
    const clear = setTimeout(() => setDir(null), 1400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(clear);
    };
  }, [value, reduced]);

  return (
    <span className={`mcap ${dir === "up" ? "mcap-up" : dir === "down" ? "mcap-down" : ""}`} aria-label={`Market cap ${money(value)}`}>
      {money(shown)}
    </span>
  );
}

export function StabilityBar({ value }: { value: number }) {
  const tone = value > 60 ? "var(--acid)" : value > 30 ? "var(--amber)" : "var(--red)";
  return (
    <div className="flex min-w-0 items-center gap-2" title="Romantic Stability. Every innocent you reject drains it.">
      <span className="hud-label hidden sm:inline">Romantic stability</span>
      <span className="hud-label sm:hidden">Stab.</span>
      <div
        className="stab"
        role="meter"
        aria-label="Romantic Stability"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className="stab-fill" style={{ width: `${value}%`, background: tone }} />
      </div>
      <span className="font-pixel text-lg leading-none" style={{ color: tone }}>
        {value}%
      </span>
    </div>
  );
}

/** Text clamped to a few lines with a "more" toggle that only appears when it actually overflows. */
export function MoreText({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  return (
    <div className="more-text">
      <p
        ref={(el) => {
          if (el && !open) setOverflows(el.scrollHeight > el.clientHeight + 1);
        }}
        className={`${className} ${open ? "" : "clamp-4"}`}
      >
        {text}
      </p>
      {(overflows || open) && (
        <button type="button" className="more-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "less" : "more"}
        </button>
      )}
    </div>
  );
}

export function Paper({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`paper ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Modal({
  label,
  onClose,
  children,
  wide = false,
  sheet = false,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  /** Slides up from the bottom edge instead of centering. */
  sheet?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className={`modal-back ${sheet ? "modal-back-sheet" : ""}`} onClick={onClose}>
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`modal ${sheet ? "modal-sheet" : wide ? "max-w-4xl" : "max-w-xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-x" aria-label="Close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function Toasts() {
  const { s, dispatch } = useGame();
  return (
    <div className="toasts" aria-live="polite">
      {s.toasts.slice(0, 2).map((t) => {
        if (t.kind === "achievement") {
          const a = ACHIEVEMENTS.find((x) => x.id === t.achievementId);
          if (!a) return null;
          const r = RARITY[a.rarity];
          return (
            <button
              key={t.id}
              type="button"
              className="toast"
              style={{ borderColor: r.color, ["--glow" as string]: r.color }}
              onClick={() => {
                dispatch({ type: "dismissToast", id: t.id });
                dispatch({ type: "navigate", screen: "achievements" });
                dispatch({ type: "detail", id: a.id });
              }}
            >
              <Pixel svg={jensenSvg(a.rarity === "cursed" ? "devastated" : "triumphant", { size: 44 })} />
              <span className="flex min-w-0 flex-col text-left">
                <span className="hud-label" style={{ color: r.color }}>
                  Achievement · {r.label}
                </span>
                <span className="font-display text-sm leading-tight">{a.title}</span>
                <span className="text-[11px] opacity-70">Tap to share</span>
              </span>
            </button>
          );
        }
        const egg = findEgg(CONTENT, t.eggId);
        return (
          <button key={t.id} type="button" className="toast toast-egg" onClick={() => dispatch({ type: "dismissToast", id: t.id })}>
            <span className="egg-mark" aria-hidden>
              ?!
            </span>
            <span className="flex min-w-0 flex-col text-left">
              <span className="hud-label text-[var(--amber)]">Easter egg · {egg?.title ?? "Found"}</span>
              <span className="text-xs leading-snug">{egg?.toast ?? t.eggId}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const TYPE_TICK_MS = 16;
const TYPE_MAX_MS = 1800;

/** Typewriter text that finishes within ~2s whatever its length; a tap skips to the end. */
export function Typed({ text, className = "" }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const step = Math.max(2, Math.ceil(text.length / (TYPE_MAX_MS / TYPE_TICK_MS)));
    let i = 0;
    const t = setInterval(() => {
      i += step;
      setN((shown) => Math.max(shown, i));
      if (i >= text.length) clearInterval(t);
    }, TYPE_TICK_MS);
    return () => clearInterval(t);
  }, [text, reduced]);
  const done = reduced || n >= text.length;
  return (
    <span className={`typed ${className} ${done ? "" : "cursor-pointer"}`} aria-label={text} onClick={() => setN(text.length)}>
      <span aria-hidden className="typed-ghost">
        {text}
      </span>
      <span aria-hidden className="typed-live">
        {done ? text : text.slice(0, n)}
        {!done && <span className="caret" />}
      </span>
    </span>
  );
}
