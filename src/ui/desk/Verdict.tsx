"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Pixel } from "../../art/PixelArt";
import { stampSvg } from "../../art/props";
import { canDecide, currentCase } from "../../game/engine";
import type { Verdict } from "../../game/types";
import { CONTENT } from "../content";
import { useGame, useReducedMotion } from "../GameProvider";
import { sfx } from "../sound";

const HOLD_MS = 420;
const STAMPS = { accept: stampSvg("accept", { size: 72 }), reject: stampSvg("reject", { size: 72 }) };

function HoldButton({ verdict, onDone, disabled }: { verdict: Verdict; onDone: (v: Verdict) => void; disabled: boolean }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (disabled || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      onDone(verdict);
    }, HOLD_MS);
  };
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  useEffect(() => stop, []);

  const keyDown = (e: KeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      start();
    }
  };
  const keyUp = (e: KeyboardEvent) => (e.key === " " || e.key === "Enter") && stop();

  return (
    <button
      type="button"
      className={`verdict verdict-${verdict} ${holding ? "verdict-hold" : ""}`}
      style={{ ["--hold" as string]: `${HOLD_MS}ms` }}
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={keyDown}
      onKeyUp={keyUp}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`${verdict === "accept" ? "Accept" : "Reject"} applicant. Press and hold.`}
    >
      <span className="verdict-fill" aria-hidden />
      <Pixel svg={STAMPS[verdict]} className="verdict-icon" />
      <span className="flex flex-col items-start leading-none">
        <span className="verdict-word">{verdict === "accept" ? "ACCEPT" : "REJECT"}</span>
        <span className="verdict-sub">hold to stamp</span>
      </span>
    </button>
  );
}

export function VerdictBar({ children }: { children?: ReactNode }) {
  const { s, dispatch } = useGame();
  const reduced = useReducedMotion();
  const run = s.run!;
  const [slam, setSlam] = useState<Verdict | null>(null);
  const c = currentCase(run, CONTENT);

  function done(v: Verdict) {
    setSlam(v);
    setTimeout(() => sfx("stamp"), reduced ? 0 : 260);
    setTimeout(() => {
      dispatch({ type: "engine", action: { type: "decide", verdict: v } });
      setSlam(null);
    }, reduced ? 250 : 1100);
  }

  return (
    <>
      <div className="verdict-bar">
        <HoldButton verdict="reject" onDone={done} disabled={!canDecide(run) || slam !== null} />
        <div className="verdict-mid">{children}</div>
        <HoldButton verdict="accept" onDone={done} disabled={!canDecide(run) || slam !== null} />
      </div>
      {slam && (
        <div className="slam-layer" aria-live="assertive">
          <div className="slam-file">
            <p className="hud-label">Applicant file · {c?.applicant.name}</p>
            <div className={`slam-stamp slam-${slam}`}>{slam === "accept" ? "ACCEPTED" : "REJECTED"}</div>
          </div>
        </div>
      )}
    </>
  );
}
