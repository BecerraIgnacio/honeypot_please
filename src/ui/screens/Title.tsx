"use client";

import { useRef, useState } from "react";
import { jensenSvg } from "../../art/jensen";
import { Pixel } from "../../art/PixelArt";
import { logoSvg, stampSvg } from "../../art/props";
import { ACHIEVEMENTS } from "../../game/content/achievements";
import { DISCLAIMER } from "../../game/content/headlines";
import { Btn } from "../common";
import { useGame } from "../GameProvider";
import { sfx } from "../sound";

const LOGO = logoSvg({ size: 520 });
const STAMP = stampSvg("reject", { size: 150 });
const JENSEN = jensenSvg("calm", { size: 132 });

function newSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}

export function Title() {
  const { s, dispatch } = useGame();
  const hits = useRef<number[]>([]);
  const [marks, setMarks] = useState<{ id: number; x: number; y: number; r: number }[]>([]);
  const [slam, setSlam] = useState(0);
  const unlocked = Object.keys(s.profile.unlocked).length;
  const canContinue = s.hydrated && s.run !== null && s.run.stats.outcome === "in-progress";

  function hammer() {
    sfx("stamp");
    setSlam((n) => n + 1);
    const now = performance.now();
    hits.current = [...hits.current.filter((t) => now - t < 1500), now];
    setMarks((m) => [...m.slice(-7), { id: now, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, r: Math.random() * 50 - 25 }]);
    if (hits.current.length >= 5) {
      hits.current = [];
      dispatch({ type: "uiEgg", name: "stamp-spam" });
    }
  }

  return (
    <main className="title-screen">
      <div className="title-marks" aria-hidden>
        {marks.map((m) => (
          <span key={m.id} className="title-ink" style={{ left: `${m.x}%`, top: `${m.y}%`, rotate: `${m.r}deg` }}>
            REJECTED
          </span>
        ))}
      </div>
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="flex max-w-xl flex-col items-center gap-5 md:items-start">
          <p className="hud-label text-[var(--acid)]">Romantic Perimeter Checkpoint 7 · Endeavor lobby · GTC week</p>
          <h1 className="m-0">
            <Pixel svg={LOGO} className="title-logo" label="HONEYPOT, PLEASE" />
          </h1>
          <p className="font-display text-center text-lg leading-snug text-[var(--cream)] md:text-left md:text-xl">
            The world&apos;s most valuable man.
            <br />
            <span className="text-[var(--amber)]">The world&apos;s least reliable dating pool.</span>
          </p>
          <nav className="title-menu" aria-label="Main menu">
            <Btn variant="primary" className="btn-xl" onClick={() => dispatch({ type: "newRun", seed: newSeed() })}>
              {canContinue ? "New shift" : "Start shift"}
            </Btn>
            {canContinue && (
              <Btn variant="ghost" className="btn-xl" onClick={() => dispatch({ type: "navigate", screen: "game" })}>
                Continue · Day {s.run!.stats.day}
              </Btn>
            )}
            <Btn onClick={() => dispatch({ type: "navigate", screen: "achievements" })}>
              Achievements {unlocked}/{ACHIEVEMENTS.length}
            </Btn>
            <Btn onClick={() => dispatch({ type: "navigate", screen: "howto" })}>How to play</Btn>
            <Btn onClick={() => dispatch({ type: "navigate", screen: "settings" })}>Settings</Btn>
          </nav>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="title-jensen">
            <Pixel svg={JENSEN} label="Jensen, waiting in his own lobby" />
            <p className="bubble bubble-up text-sm">Five trillion dollars, and I wait in my own lobby.</p>
          </div>
          <button type="button" className="title-stamp" onClick={hammer} aria-label="Decorative stamp. Hit it." title="Hit it.">
            <span key={slam} className={slam ? "title-stamp-hit" : ""}>
              <Pixel svg={STAMP} />
            </span>
          </button>
        </div>
      </div>
      <p className="disclaimer relative z-10">{DISCLAIMER}</p>
    </main>
  );
}
