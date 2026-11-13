"use client";

import { currentDay } from "../../game/engine";
import { Btn, Paper, Typed } from "../common";
import { CONTENT, DAY_DATES } from "../content";
import { useGame } from "../GameProvider";
import { sfx } from "../sound";

export function Briefing() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const day = currentDay(run, CONTENT);
  if (!day) return null;
  return (
    <main className="screen-scroll">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-1">
          <p className="hud-label text-[var(--acid)]">Shift briefing · {DAY_DATES[day.day]}</p>
          <h1 className="font-display text-4xl leading-none md:text-6xl">
            Day {day.day}: <span className="text-[var(--amber)]">{day.title}</span>
          </h1>
        </header>
        <Paper className="briefing-paper deal-in">
          <span className="paper-clip" aria-hidden />
          <div className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed md:text-sm">
            <Typed key={day.day} text={day.briefing} />
          </div>
          <span className="stamp-ink stamp-red" style={{ rotate: "-9deg", right: "1.5rem", top: "1.2rem" }}>
            Eyes only
          </span>
        </Paper>
        <section className="panel" aria-label="New directives">
          <h2 className="panel-title">New directives today</h2>
          <ul className="flex flex-col gap-2">
            {day.directives.map((d) => (
              <li key={d.id}>
                <details className="directive">
                  <summary className="font-display text-sm">{d.title}</summary>
                  <ul className="mt-1 flex flex-col gap-0.5 text-xs text-[var(--cream-dim)]">
                    {d.facts.map((f) => (
                      <li key={f.id}>
                        <span className="text-[var(--acid)]">{f.label}:</span> {f.value}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
          {day.day > 1 && <p className="mt-3 text-xs text-[var(--cream-dim)]">Earlier directives still apply.</p>}
        </section>
        <div className="flex flex-wrap items-center gap-3">
          <Btn
            variant="primary"
            className="btn-xl"
            autoFocus
            onClick={() => {
              sfx("paper");
              dispatch({ type: "engine", action: { type: "advance" } });
            }}
          >
            Begin shift
          </Btn>
          <Btn onClick={() => dispatch({ type: "navigate", screen: "title" })}>Back to title</Btn>
        </div>
      </div>
    </main>
  );
}
