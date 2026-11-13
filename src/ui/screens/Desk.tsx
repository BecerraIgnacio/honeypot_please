"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { currentCase, lineupPosition, offeredQuestions } from "../../game/engine";
import { FactList, MarketCap, StabilityBar } from "../common";
import { CONTENT } from "../content";
import { Applicant, ApplicantStrip, JensenFaceButton, JensenPop } from "../desk/Applicant";
import { DocCarousel, Documents } from "../desk/Documents";
import { Database, QuestionList, Terminal } from "../desk/Terminal";
import { CompareBar, FindingsChip, Notebook, Readout, ScanButton, ScanFindings, ScanOverlay } from "../desk/Tools";
import { VerdictBar } from "../desk/Verdict";
import { useGame, useMedia, useReducedMotion } from "../GameProvider";

export function TopBar({ children }: { children?: ReactNode }) {
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
      <div className="hud-cell hud-wide" title="Innocent applicants you rejected">
        <span className="hud-label">Mistakes</span>
        <span className={`hud-value ${run.stats.innocentsRejected ? "text-[var(--red)]" : ""}`}>{run.stats.innocentsRejected}</span>
      </div>
      <div className="hud-cell">
        <span className="hud-label hud-wide">NVDA</span>
        <span className="hud-value">
          <MarketCap value={run.stats.marketCap} />
        </span>
      </div>
      <div className="topbar-stab ml-auto min-w-0">
        <StabilityBar value={run.stats.romanticStability} />
      </div>
      {children}
    </header>
  );
}

function DeskWide() {
  return (
    <div className="desk-screen">
      <TopBar />
      <main className="desk-grid">
        <Applicant />
        <section className="col col-desk" aria-label="Desk">
          <Documents />
          <div className="tray">
            <div className="compare">
              <CompareBar />
              <Readout />
            </div>
            <div className="tray-row">
              <ScanButton />
              <Notebook />
            </div>
          </div>
        </section>
        <Terminal />
      </main>
      <VerdictBar />
      <ScanOverlay />
    </div>
  );
}

const SECTIONS = ["claims", "docs", "ask", "database", "scan"] as const;
type Section = (typeof SECTIONS)[number];
/** A section counts as "in view" once its top passes this fraction of the scroller's height. */
const IN_VIEW = 0.4;

function CaseSection({ id, title, children }: { id: Section; title: string; children: ReactNode }) {
  return (
    <section id={`sec-${id}`} className="case-sec" aria-label={title}>
      <h2 className="hud-label">{title}</h2>
      {children}
    </section>
  );
}

/** Narrow layouts: the whole case on one scrolling page, with section chips on top and the compare tray and stamps pinned below. */
function CasePage() {
  const { s } = useGame();
  const reduced = useReducedMotion();
  const run = s.run!;
  const c = currentCase(run, CONTENT)!;
  const scroller = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Section>("claims");
  const fresh = offeredQuestions(run, CONTENT).filter((o) => !o.asked && o.question.requires?.length).length;
  const labels: Record<Section, string> = {
    claims: "Claims",
    docs: `Docs (${c.documents.length})`,
    ask: fresh ? `Ask (${fresh} new)` : "Ask",
    database: "Database",
    scan: "Scan",
  };

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) return setActive(SECTIONS[SECTIONS.length - 1]);
    let current: Section = SECTIONS[0];
    for (const id of SECTIONS) {
      const sec = document.getElementById(`sec-${id}`);
      if (sec && sec.offsetTop - el.scrollTop <= el.clientHeight * IN_VIEW) current = id;
    }
    setActive(current);
  };
  const jump = (id: Section) => {
    const sec = document.getElementById(`sec-${id}`);
    scroller.current?.scrollTo({ top: (sec?.offsetTop ?? 0) - 8, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="case-page">
      <TopBar>
        <JensenFaceButton size={32} />
      </TopBar>
      <nav className="jump" aria-label="Case sections">
        {SECTIONS.map((id) => (
          <button key={id} type="button" className={`jump-chip ${active === id ? "jump-on" : ""} ${id === "ask" && fresh ? "jump-new" : ""}`} aria-current={active === id} onClick={() => jump(id)}>
            {labels[id]}
          </button>
        ))}
      </nav>
      <main ref={scroller} className="case-scroll" onScroll={onScroll}>
        <ApplicantStrip />
        <CaseSection id="claims" title="Her claims">
          <FactList owner={c.id} facts={c.claims} compact />
        </CaseSection>
        <CaseSection id="docs" title="Her documents">
          <DocCarousel />
        </CaseSection>
        <CaseSection id="ask" title="Ask her">
          <div className="terminal term-screen">
            <QuestionList />
          </div>
        </CaseSection>
        <CaseSection id="database" title="Security database">
          <div className="terminal term-screen">
            <Database />
          </div>
        </CaseSection>
        <CaseSection id="scan" title="Advanced scan">
          <ScanButton inline />
          <div className="xray-inline">
            <ScanFindings />
          </div>
        </CaseSection>
      </main>
      <div className="dock">
        <div className="dock-float">
          <JensenPop />
          <Readout className="readout-banner" />
        </div>
        <div className="compare">
          <CompareBar />
        </div>
        <VerdictBar>
          <FindingsChip />
        </VerdictBar>
      </div>
    </div>
  );
}

export function Desk() {
  const { dispatch } = useGame();
  const wide = useMedia("(min-width: 1100px)", true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector(".modal-back")) dispatch({ type: "closeDoc" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return wide ? <DeskWide /> : <CasePage />;
}
