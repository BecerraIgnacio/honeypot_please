"use client";

import { useEffect, useRef } from "react";
import { JensenFace, Portrait } from "../../art/PixelArt";
import { currentCase, discovered, suspicion } from "../../game/engine";
import { FactList } from "../common";
import { CONTENT, jensenMood } from "../content";
import { useGame } from "../GameProvider";

export function JensenBox({ className = "" }: { className?: string }) {
  const { s, dispatch } = useGame();
  const clicks = useRef(0);
  const run = s.run;
  const mood = jensenMood(run, run ? suspicion(run, CONTENT) : 0);
  return (
    <div className={`jensen-box ${className}`}>
      <button
        type="button"
        className={`jensen-face mood-${mood}`}
        aria-label="Jensen. Do not touch the jacket."
        onClick={() => {
          clicks.current += 1;
          if (clicks.current === 10) dispatch({ type: "uiEgg", name: "jacket-clicks" });
        }}
      >
        <JensenFace mood={mood} size={96} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="hud-label mb-1">Jensen · {mood}</p>
        {s.jensen && (
          <p key={s.jensen.n} className="bubble bubble-left pop-in" aria-live="polite">
            {s.jensen.text}
          </p>
        )}
      </div>
    </div>
  );
}

export function Applicant() {
  const { s } = useGame();
  const run = s.run!;
  const c = currentCase(run, CONTENT)!;
  const asked = discovered(run)
    .filter((t) => t.startsWith("q:"))
    .map((t) => c.questions.find((q) => `q:${q.id}` === t)!)
    .filter(Boolean);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [asked.length]);

  return (
    <section className="col col-applicant" aria-label="Applicant at the window">
      <div className="window">
        <div className="window-glass">
          <Portrait key={c.id} spec={c.applicant.portrait} size={168} className="window-portrait step-up" label={`Applicant ${c.applicant.name}`} />
        </div>
        <div className="nameplate">
          <p className="font-display text-base leading-tight">{c.applicant.name}</p>
          <p className="text-[11px] leading-snug opacity-80">
            {c.applicant.occupation} · {c.applicant.nationality}
          </p>
        </div>
      </div>
      <details className="bio">
        <summary className="hud-label cursor-pointer">Observation notes</summary>
        <p className="mt-1 text-xs leading-relaxed text-[var(--cream-dim)]">{c.applicant.bio}</p>
        <p className="mt-1 text-xs leading-relaxed">
          <span className="text-[var(--acid)]">Stated reason:</span> {c.applicant.statedReason}
        </p>
      </details>
      <div>
        <p className="hud-label mb-1">Her claims</p>
        <FactList owner={c.id} facts={c.claims} compact />
      </div>
      <div className="dialogue" ref={log} aria-label="Conversation log">
        <p className="say say-her">{c.applicant.greeting}</p>
        {asked.map((q) => (
          <div key={q.id} className="flex flex-col gap-1">
            <p className="say say-you">{q.prompt}</p>
            <p className="say say-her">{q.answer}</p>
            {q.facts?.length ? <FactList owner={c.id} facts={q.facts} compact /> : null}
          </div>
        ))}
      </div>
      <JensenBox />
    </section>
  );
}
