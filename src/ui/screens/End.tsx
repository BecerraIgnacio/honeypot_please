"use client";

import { useEffect, useMemo } from "react";
import { JensenFace, Pixel } from "../../art/PixelArt";
import { portraitSvg } from "../../art/portrait";
import { ACHIEVEMENTS } from "../../game/content/achievements";
import { BOARD_STATEMENTS, dayEndLines, pickHeadline } from "../../game/content/headlines";
import { vulnerabilityLine } from "../../game/content/ranks";
import { daySummary } from "../../game/engine";
import { renderTemplate } from "../../share/text";
import { SharePanel } from "../../share/ui/SharePanel";
import { Btn, Paper } from "../common";
import { CONTENT, RARITY, fatalCase, money, rng01, signed, signedMoney } from "../content";
import { useGame } from "../GameProvider";
import { runShare } from "../share";
import { sfx } from "../sound";
import { TopBar } from "./Desk";

export function DayEnd() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const sum = daySummary(run);
  const r = rng01(run.stats.seed, "day", sum.day);
  const line = dayEndLines[sum.day][Math.floor(r * dayEndLines[sum.day].length)];
  const board = BOARD_STATEMENTS[Math.floor(rng01(run.stats.seed, "board", sum.day) * BOARD_STATEMENTS.length)];
  const last = run.stats.day === 5;

  return (
    <div className="desk-screen">
      <TopBar />
      <main className="screen-scroll">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8">
          <header>
            <p className="hud-label text-[var(--acid)]">Shift report</p>
            <h1 className="font-display text-4xl leading-none md:text-5xl">End of Day {sum.day}</h1>
            <p className="mt-2 text-sm text-[var(--cream-dim)]">{line}</p>
          </header>
          <Paper className="relative">
            <p className="hud-label text-[#6b604a]">Romantic Perimeter Checkpoint 7 · Daily ledger</p>
            <table className="ledger mt-2 w-full">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Verdict</th>
                  <th>Was</th>
                  <th className="text-right">NVDA</th>
                </tr>
              </thead>
              <tbody>
                {sum.decisions.map((d) => (
                  <tr key={d.caseId} className={d.correct ? "" : "ledger-wrong"}>
                    <td>{d.applicantName}</td>
                    <td>{d.verdict.toUpperCase()}</td>
                    <td>{d.truth}</td>
                    <td className="text-right">{signedMoney(d.marketCapDelta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex flex-wrap gap-6 text-sm">
              <span>
                Correct: <b>{sum.correct}/{sum.decisions.length}</b>
              </span>
              <span>
                Market cap: <b>{signedMoney(sum.marketCapDelta)}</b>
              </span>
              <span>
                Stability: <b>{signed(sum.stabilityDelta)}</b>
              </span>
            </div>
            <span className="stamp-ink stamp-red" style={{ rotate: "8deg", right: "1rem", bottom: "1rem" }}>
              Filed
            </span>
          </Paper>
          <section className="panel flex items-start gap-3">
            <span className="board-seal" aria-hidden>
              B
            </span>
            <div>
              <p className="hud-label">Statement from the Board</p>
              <p className="text-sm leading-relaxed">{board}</p>
            </div>
          </section>
          <div className="flex justify-end">
            <Btn
              variant="primary"
              className="btn-xl"
              autoFocus
              onClick={() => {
                sfx("paper");
                dispatch({ type: "engine", action: { type: "advance" } });
              }}
            >
              {last ? "Final report" : `Day ${sum.day + 1} briefing`}
            </Btn>
          </div>
        </div>
      </main>
    </div>
  );
}

const OUTCOME_WORD = {
  honeypotted: "HONEYPOTTED",
  "romantically-bankrupt": "ROMANTICALLY BANKRUPT",
  victory: "THE PERIMETER HELD",
} as const;

export function RunEnd() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const share = useMemo(() => runShare(run, s.unlockedThisRun, s.profile), [run, s.unlockedThisRun, s.profile]);
  const { outcome, rank, vars, card, templates, artKey } = share;
  const headline = pickHeadline(outcome, run.stats, rng01(run.stats.seed, "headline"));
  const spy = fatalCase(run);
  const lost = run.stats.startingMarketCap - run.stats.marketCap;
  const unlocks = ACHIEVEMENTS.filter((a) => s.unlockedThisRun.includes(a.id));

  useEffect(() => {
    document.documentElement.dataset.ending = outcome;
    return () => {
      delete document.documentElement.dataset.ending;
    };
  }, [outcome]);

  return (
    <main className={`screen-scroll ending ending-${outcome}`}>
      <div className="ending-hero">
        {outcome === "honeypotted" && <div className="alarm-strip" aria-hidden>HONEYPOTTED · HONEYPOTTED · HONEYPOTTED · HONEYPOTTED · HONEYPOTTED · HONEYPOTTED</div>}
        <h1 className="ending-word" data-text={OUTCOME_WORD[outcome]}>
          {OUTCOME_WORD[outcome]}
        </h1>
        <div className="ending-faces">
          {spy && <Pixel svg={portraitSvg(spy.applicant.portrait, { size: 150 })} label={spy.applicant.name} className="ending-spy" />}
          <JensenFace mood={outcome === "victory" ? "triumphant" : outcome === "honeypotted" ? "devastated" : "unhinged"} size={150} />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 pb-10">
        <Paper className="tabloid-front">
          <p className="tabloid-mast">THE SANTA CLARA LEDGER · EXTRA</p>
          <p className="tabloid-head">{renderTemplate(headline.headline, vars)}</p>
          <p className="text-sm leading-relaxed">{renderTemplate(headline.subhead, vars)}</p>
          <p className="mt-2 border-t border-[#0d0f0e]/30 pt-2 text-xs italic">{renderTemplate(headline.boardStatement, vars)}</p>
        </Paper>
        <section className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="panel">
            <p className="hud-label">Your rank</p>
            <p className="font-display text-2xl leading-tight text-[var(--amber)]">{rank.title}</p>
            <p className="mt-1 text-sm text-[var(--cream-dim)]">{rank.blurb}</p>
            <p className="mt-3 text-xs leading-relaxed">{vulnerabilityLine(run.stats)}</p>
          </div>
          <div className="panel">
            <table className="stats w-full">
              <tbody>
                <tr><th>Day reached</th><td>{run.stats.day} / 5</td></tr>
                <tr><th>Spies caught</th><td>{run.stats.spiesCaught}</td></tr>
                <tr><th>Spies missed</th><td>{run.stats.spiesAccepted}</td></tr>
                <tr><th>Innocents rejected</th><td>{run.stats.innocentsRejected}</td></tr>
                <tr><th>Innocents accepted</th><td>{run.stats.innocentsAccepted}</td></tr>
                <tr>
                  <th>{lost > 0 ? "Market cap lost" : "Market cap gained"}</th>
                  <td className={lost > 0 ? "text-[var(--red)]" : "text-[var(--acid)]"}>{money(Math.abs(lost))}</td>
                </tr>
                <tr><th>Market cap preserved</th><td>{money(Math.min(run.stats.marketCap, run.stats.startingMarketCap))}</td></tr>
                {run.stats.fatalSpyName && <tr><th>Let in</th><td>{run.stats.fatalSpyName}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        {unlocks.length > 0 && (
          <section className="panel">
            <h2 className="panel-title">Achievements this run · {unlocks.length}</h2>
            <ul className="flex flex-wrap gap-2">
              {unlocks.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="ach-chip"
                    style={{ borderColor: RARITY[a.rarity].color, color: RARITY[a.rarity].color }}
                    onClick={() => {
                      dispatch({ type: "navigate", screen: "achievements" });
                      dispatch({ type: "detail", id: a.id });
                    }}
                  >
                    {a.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex justify-center">
          <SharePanel card={card} templates={templates} vars={vars} outcome={outcome} artKey={artKey} />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Btn
            variant="primary"
            className="btn-xl"
            onClick={() => {
              const buf = new Uint32Array(1);
              crypto.getRandomValues(buf);
              dispatch({ type: "newRun", seed: buf[0] });
            }}
          >
            Play again
          </Btn>
          <Btn className="btn-xl" onClick={() => dispatch({ type: "navigate", screen: "achievements" })}>
            Achievements
          </Btn>
          <Btn className="btn-xl" onClick={() => dispatch({ type: "navigate", screen: "title" })}>
            Title
          </Btn>
        </div>
      </div>
    </main>
  );
}
