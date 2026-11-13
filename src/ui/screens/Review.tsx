"use client";

import { Portrait } from "../../art/PixelArt";
import { ACHIEVEMENTS } from "../../game/content/achievements";
import { reviewView } from "../../game/engine";
import { Btn, Paper } from "../common";
import { CONTENT, RARITY, signed, signedMoney, tokenLabel } from "../content";
import { JensenBox } from "../desk/Applicant";
import { useGame } from "../GameProvider";
import { sfx } from "../sound";
import { TopBar } from "./Desk";

export function Review() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const v = reviewView(run, CONTENT);
  if (!v) return null;
  const { decision: d } = v;
  const fatal = d.verdict === "accept" && d.truth === "spy";
  const caseUnlocks = ACHIEVEMENTS.filter((a) => s.caseUnlocks.includes(a.id));
  const tone = fatal ? "review-fatal" : d.correct ? "review-right" : "review-wrong";
  const next =
    run.stats.outcome === "honeypotted" || run.stats.outcome === "romantically-bankrupt"
      ? "See what happened"
      : run.stats.outcome === "victory"
        ? "Close the week"
        : "Next applicant";

  return (
    <div className="desk-screen">
      <TopBar />
      <main className={`screen-scroll ${tone}`}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6">
          {fatal && <div className="alarm-strip" aria-hidden>BREACH · BREACH · BREACH · BREACH · BREACH · BREACH · BREACH · BREACH</div>}
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <Paper className="review-file relative flex-1">
              <div className="flex items-start gap-4">
                <Portrait spec={v.case.applicant.portrait} size={110} className="doc-photo shrink-0" label={v.case.applicant.name} />
                <div className="min-w-0">
                  <p className="hud-label text-[#6b604a]">Case file · {v.case.applicant.name}</p>
                  <h1 className="review-headline">{v.outcome.headline}</h1>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{v.outcome.text}</p>
              <span className={`stamp-ink review-stamp ${d.verdict === "accept" ? "stamp-green" : "stamp-red"}`}>
                {d.verdict === "accept" ? "Accepted" : "Rejected"}
              </span>
            </Paper>
            <div className="flex flex-col gap-3 md:w-72">
              <div className={`verdict-card ${d.correct ? "verdict-card-right" : "verdict-card-wrong"}`}>
                <p className="font-display text-2xl leading-none">{d.correct ? "RIGHT CALL" : fatal ? "HONEYPOTTED" : "WRONG CALL"}</p>
                <p className="mt-1 text-xs">She was {v.truth === "spy" ? "a spy" : "innocent"}.</p>
              </div>
              <div className="panel grid grid-cols-2 gap-2">
                <div>
                  <p className="hud-label">Market cap</p>
                  <p className={`font-pixel text-2xl ${d.marketCapDelta < 0 ? "text-[var(--red)]" : "text-[var(--acid)]"}`}>{signedMoney(d.marketCapDelta)}</p>
                </div>
                <div>
                  <p className="hud-label">Stability</p>
                  <p className={`font-pixel text-2xl ${d.stabilityDelta < 0 ? "text-[var(--red)]" : "text-[var(--acid)]"}`}>{signed(d.stabilityDelta)}</p>
                </div>
              </div>
              <JensenBox />
            </div>
          </div>

          <section className="panel">
            <h2 className="panel-title">Who she really was</h2>
            <p className="text-sm leading-relaxed">{v.hiddenTruth}</p>
          </section>
          <section className="panel">
            <h2 className="panel-title">How to read it</h2>
            <p className="text-sm leading-relaxed text-[var(--cream-dim)]">{v.explanation}</p>
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="panel">
              <h2 className="panel-title text-[var(--acid)]">Clues you found · {v.cluesFound.length}</h2>
              <ClueList c={v.case} tokens={v.cluesFound} empty="None. Vibes only." />
            </div>
            <div className="panel">
              <h2 className="panel-title text-[var(--red)]">Clues you missed · {v.cluesMissed.length}</h2>
              <ClueList c={v.case} tokens={v.cluesMissed} empty="Nothing. Clean work." />
            </div>
          </section>
          {v.redHerringsFound.length > 0 && (
            <section className="panel">
              <h2 className="panel-title text-[var(--amber)]">Red herrings you chased</h2>
              <ClueList c={v.case} tokens={v.redHerringsFound} empty="" />
            </section>
          )}
          {caseUnlocks.length > 0 && (
            <section className="panel">
              <h2 className="panel-title">Unlocked</h2>
              <ul className="flex flex-wrap gap-2">
                {caseUnlocks.map((a) => (
                  <li key={a.id} className="ach-chip" style={{ borderColor: RARITY[a.rarity].color, color: RARITY[a.rarity].color }}>
                    {a.title}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="sticky bottom-0 flex justify-end bg-linear-to-t from-[var(--ink)] to-transparent py-3">
            <Btn
              variant={fatal ? "danger" : "primary"}
              className="btn-xl"
              autoFocus
              onClick={() => {
                sfx("paper");
                dispatch({ type: "engine", action: { type: "advance" } });
              }}
            >
              {next}
            </Btn>
          </div>
        </div>
      </main>
    </div>
  );
}

function ClueList({ c, tokens, empty }: { c: Parameters<typeof tokenLabel>[0]; tokens: string[]; empty: string }) {
  if (tokens.length === 0) return <p className="text-xs opacity-60">{empty}</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {tokens.map((t) => {
        const l = tokenLabel(c, t);
        return (
          <li key={t} className="text-xs leading-snug">
            <span className="hud-label mr-1">{l.verb}</span>
            {l.text}
          </li>
        );
      })}
    </ul>
  );
}
