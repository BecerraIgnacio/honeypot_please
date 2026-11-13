"use client";

import { useEffect, useRef, useState } from "react";
import { JensenFace, Portrait } from "../../art/PixelArt";
import { currentCase, discovered, suspicion } from "../../game/engine";
import { FactList } from "../common";
import { CONTENT, jensenMood } from "../content";
import { useGame } from "../GameProvider";

function useMood() {
  const { s } = useGame();
  return jensenMood(s.run, s.run ? suspicion(s.run, CONTENT) : 0);
}

/** His face; ten taps on it is an easter egg, so every layout keeps one within reach. */
export function JensenFaceButton({ size }: { size: number }) {
  const { dispatch } = useGame();
  const clicks = useRef(0);
  const mood = useMood();
  return (
    <button
      type="button"
      className={`jensen-face mood-${mood}`}
      aria-label="Jensen. Do not touch the jacket."
      onClick={() => {
        clicks.current += 1;
        if (clicks.current === 10) dispatch({ type: "uiEgg", name: "jacket-clicks" });
      }}
    >
      <JensenFace mood={mood} size={size} />
    </button>
  );
}

export function JensenBox() {
  const { s } = useGame();
  const mood = useMood();
  return (
    <div className="jensen-box">
      <JensenFaceButton size={96} />
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

const JENSEN_POP_MS = 4000;

/** Narrow layouts: each new remark pops up for a few seconds instead of living in a panel. */
export function JensenPop() {
  const { s } = useGame();
  const mood = useMood();
  const n = s.jensen?.n;
  const [gone, setGone] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (n === undefined) return;
    const t = setTimeout(() => setGone(n), JENSEN_POP_MS);
    return () => clearTimeout(t);
  }, [n]);
  if (!s.jensen || gone === n) return null;
  return (
    <button type="button" key={n} className="jensen-pop pop-in" aria-live="polite" onClick={() => setGone(n)}>
      <JensenFace mood={mood} size={36} />
      <span className="min-w-0 flex-1 text-left">{s.jensen.text}</span>
    </button>
  );
}

export function ApplicantNotes() {
  const { s } = useGame();
  const c = currentCase(s.run!, CONTENT)!;
  return (
    <details className="bio">
      <summary className="hud-label cursor-pointer">Observation notes</summary>
      <p className="mt-1 text-xs leading-relaxed text-[var(--cream-dim)]">{c.applicant.bio}</p>
      <p className="mt-1 text-xs leading-relaxed">
        <span className="text-[var(--acid)]">Stated reason:</span> {c.applicant.statedReason}
      </p>
    </details>
  );
}

/** Her latest line only; tapping it opens the whole conversation. */
export function Dialogue() {
  const { s } = useGame();
  const [open, setOpen] = useState(false);
  const run = s.run!;
  const c = currentCase(run, CONTENT)!;
  const asked = discovered(run)
    .filter((t) => t.startsWith("q:"))
    .map((t) => c.questions.find((q) => `q:${q.id}` === t))
    .filter((q) => q !== undefined);
  const latest = asked.at(-1)?.answer ?? c.applicant.greeting;

  if (!open) {
    return (
      <button type="button" key={asked.length} className="say say-her say-latest" aria-expanded={false} aria-label={`She says: ${latest}. Show conversation.`} onClick={() => setOpen(true)}>
        <span className="clamp-3">{latest}</span>
        {asked.length > 0 && <span className="say-more">log · {asked.length + 1}</span>}
      </button>
    );
  }
  return (
    <div className="dialogue" aria-label="Conversation log">
      <button type="button" className="say-more self-end" aria-expanded onClick={() => setOpen(false)}>
        hide log
      </button>
      <p className="say say-her">{c.applicant.greeting}</p>
      {asked.map((q) => (
        <div key={q.id} className="flex flex-col gap-1">
          <p className="say say-you">{q.prompt}</p>
          <p className="say say-her">{q.answer}</p>
        </div>
      ))}
    </div>
  );
}

export function SuspicionBar() {
  const { s } = useGame();
  const value = suspicion(s.run!, CONTENT);
  const tone = value > 60 ? "var(--red)" : value > 30 ? "var(--amber)" : "var(--acid)";
  return (
    <div className="susp" role="meter" aria-label="Suspicion, a vibe and not a verdict" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <span className="hud-label">Suspicion · a vibe</span>
      <span className="susp-bar">
        <span className="susp-fill" style={{ width: `${value}%`, background: tone }} />
      </span>
      <span className="font-pixel text-lg leading-none">{value}</span>
    </div>
  );
}

/** Narrow layouts: the applicant as a compact strip at the top of the case page. */
export function ApplicantStrip() {
  const { s } = useGame();
  const c = currentCase(s.run!, CONTENT)!;
  return (
    <section className="strip" aria-label="Applicant at the window">
      <div className="flex items-start gap-3">
        <Portrait key={c.id} spec={c.applicant.portrait} size={72} className="strip-portrait step-up" label={`Applicant ${c.applicant.name}`} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-display text-base leading-tight">{c.applicant.name}</p>
          <p className="truncate text-[11px] leading-snug text-[var(--cream-dim)]">
            {c.applicant.occupation} · {c.applicant.nationality}
          </p>
          <SuspicionBar />
        </div>
      </div>
      <Dialogue />
      <ApplicantNotes />
    </section>
  );
}

export function Applicant() {
  const { s } = useGame();
  const c = currentCase(s.run!, CONTENT)!;
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
      <ApplicantNotes />
      <div>
        <p className="hud-label mb-1">Her claims</p>
        <FactList owner={c.id} facts={c.claims} compact />
      </div>
      <Dialogue />
      <JensenBox />
    </section>
  );
}
