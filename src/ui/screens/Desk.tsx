"use client";

import { useEffect } from "react";
import { lineupPosition } from "../../game/engine";
import { MarketCap, StabilityBar } from "../common";
import { Applicant } from "../desk/Applicant";
import { Documents } from "../desk/Documents";
import { Terminal } from "../desk/Terminal";
import { CompareBar, Notebook, ScanButton, ScanOverlay } from "../desk/Tools";
import { VerdictBar } from "../desk/Verdict";
import { useGame } from "../GameProvider";
import type { DeskTab } from "../state";

const TABS: { id: DeskTab; label: string }[] = [
  { id: "applicant", label: "Applicant" },
  { id: "desk", label: "Desk" },
  { id: "terminal", label: "Terminal" },
];

export function TopBar() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const pos = lineupPosition(run);
  return (
    <header className="topbar">
      <button type="button" className="topbar-menu" onClick={() => dispatch({ type: "navigate", screen: "title" })} aria-label="Pause and return to title">
        II
      </button>
      <div className="hud-cell">
        <span className="hud-label">Day</span>
        <span className="hud-value">{run.stats.day}/5</span>
      </div>
      {pos && (
        <div className="hud-cell">
          <span className="hud-label">Case</span>
          <span className="hud-value">
            {pos.index + 1}/{pos.total}
          </span>
        </div>
      )}
      <div className="hud-cell" title="Innocent applicants you rejected">
        <span className="hud-label">Mistakes</span>
        <span className={`hud-value ${run.stats.innocentsRejected ? "text-[var(--red)]" : ""}`}>{run.stats.innocentsRejected}</span>
      </div>
      <div className="hud-cell">
        <span className="hud-label">NVDA</span>
        <span className="hud-value">
          <MarketCap value={run.stats.marketCap} />
        </span>
      </div>
      <div className="ml-auto min-w-0">
        <StabilityBar value={run.stats.romanticStability} />
      </div>
    </header>
  );
}

export function Desk() {
  const { s, dispatch } = useGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea");
      if (e.key === "Escape" && !document.querySelector(".modal-back")) dispatch({ type: "closeDoc" });
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const i = ["1", "2", "3"].indexOf(e.key);
      if (i >= 0 && window.matchMedia("(max-width: 1099px)").matches) dispatch({ type: "tab", tab: TABS[i].id });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <div className="desk-screen" data-tab={s.tab}>
      <TopBar />
      <nav className="desk-tabs" role="tablist" aria-label="Desk sections">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={s.tab === t.id}
            className={`desk-tab ${s.tab === t.id ? "desk-tab-on" : ""}`}
            onClick={() => dispatch({ type: "tab", tab: t.id })}
          >
            <span className="opacity-50">{i + 1}</span> {t.label}
          </button>
        ))}
      </nav>
      <main className="desk-grid">
        <Applicant />
        <section className="col col-desk" aria-label="Desk">
          <Documents />
          <div className="tray">
            <CompareBar className="wide-only" />
            <div className="tray-row">
              <ScanButton />
              <Notebook />
            </div>
          </div>
        </section>
        <Terminal />
      </main>
      <VerdictBar>
        <CompareBar className="narrow-only" />
      </VerdictBar>
      <ScanOverlay />
    </div>
  );
}
