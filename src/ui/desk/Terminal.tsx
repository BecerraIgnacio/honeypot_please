"use client";

import { useState } from "react";
import { currentCase, offeredQuestions, searchDatabase, suspicion } from "../../game/engine";
import { findRecord } from "../../game/engine/selectors";
import type { DbCategory } from "../../game/types";
import { FactList } from "../common";
import { CONTENT } from "../content";
import { useGame } from "../GameProvider";
import { sfx } from "../sound";

const CAT: Record<DbCategory, string> = {
  employee: "EMP",
  "access-log": "LOG",
  incident: "INC",
  alias: "AKA",
  watchlist: "WATCH",
  "chip-allocation": "ALLOC",
  attendee: "GTC",
  directive: "DIR",
};

function Database() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const [draft, setDraft] = useState(s.query);
  const hits = searchDatabase(run, CONTENT, s.query);
  const open = s.record ? findRecord(run, CONTENT, s.record) : undefined;

  if (open) {
    return (
      <div className="flex min-h-0 flex-col gap-2">
        <button type="button" className="term-link self-start" onClick={() => dispatch({ type: "openRecord", id: null })}>
          ← results
        </button>
        <p className="term-cat">{CAT[open.record.category]}</p>
        <h3 className="term-h">{open.record.title}</h3>
        {open.record.body && <p className="term-body">{open.record.body}</p>}
        <FactList owner={open.owner} facts={open.record.facts} compact />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <form
        className="term-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          sfx("blip");
          dispatch({ type: "search", query: draft });
        }}
      >
        <span aria-hidden className="text-[var(--acid)]">&gt;</span>
        <input
          aria-label="Search the security database"
          value={draft}
          onChange={(e) => {
            sfx("key");
            setDraft(e.target.value);
          }}
          placeholder="name, badge no., firm, anything"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>
      <p className="term-cat">
        {s.query.trim() === "" ? "Directives in force" : `${hits.length} result${hits.length === 1 ? "" : "s"} for "${s.query}"`}
      </p>
      {hits.length === 0 && s.query.trim().length === 1 && <p className="term-body">Two characters minimum. The database has standards.</p>}
      {hits.length === 0 && s.query.trim().length > 1 && <p className="term-body">NO RECORDS. Try a badge number, an employer, a surname.</p>}
      <ul className="flex flex-col gap-1">
        {hits.map((h) => (
          <li key={`${h.owner}|${h.record.id}`}>
            <button
              type="button"
              className="term-hit"
              onClick={() => {
                sfx("blip");
                dispatch({ type: "openRecord", id: h.record.id });
              }}
            >
              <span className={`term-tag tag-${h.record.category}`}>{CAT[h.record.category]}</span>
              <span className="min-w-0 truncate">{h.record.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Interrogate() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const c = currentCase(run, CONTENT)!;
  const offered = offeredQuestions(run, CONTENT);
  return (
    <ul className="flex flex-col gap-1.5">
      {offered.map(({ question: q, asked }) =>
        asked ? (
          <li key={q.id}>
            <details className="q-asked">
              <summary>{q.prompt}</summary>
              <p className="term-body mt-1">“{q.answer}”</p>
              <FactList owner={c.id} facts={q.facts} compact />
            </details>
          </li>
        ) : (
          <li key={q.id}>
            <button
              type="button"
              className={`q-btn ${q.requires?.length ? "q-new" : ""}`}
              onClick={() => dispatch({ type: "engine", action: { type: "askQuestion", questionId: q.id } })}
            >
              {q.requires?.length ? <span className="q-badge">new</span> : null}
              {q.prompt}
            </button>
          </li>
        ),
      )}
      <li className="term-body mt-2 opacity-60">Some questions only make sense once you have read the right document or record.</li>
    </ul>
  );
}

export function Gauge({ value }: { value: number }) {
  const angle = -90 + (value / 100) * 180;
  return (
    <div className="gauge" role="meter" aria-label="Suspicion meter (unreliable)" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <svg viewBox="0 0 200 116" className="w-full" aria-hidden>
        <defs>
          <linearGradient id="g-arc" x1="0" x2="1">
            <stop offset="0" stopColor="#b6ff00" />
            <stop offset="0.55" stopColor="#ffb000" />
            <stop offset="1" stopColor="#e5322d" />
          </linearGradient>
        </defs>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#262b28" strokeWidth="16" />
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#g-arc)" strokeWidth="10" opacity="0.85" />
        {Array.from({ length: 11 }, (_, i) => {
          const a = ((-180 + i * 18) * Math.PI) / 180;
          return <line key={i} x1={100 + Math.cos(a) * 64} y1={100 + Math.sin(a) * 64} x2={100 + Math.cos(a) * 72} y2={100 + Math.sin(a) * 72} stroke="#f1e9d2" strokeOpacity="0.5" strokeWidth="2" />;
        })}
        <g className="gauge-needle" style={{ transform: `rotate(${angle}deg)` }}>
          <line x1="100" y1="100" x2="100" y2="34" stroke="#f1e9d2" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="7" fill="#e5322d" />
      </svg>
      <div className="flex items-baseline justify-between gap-2">
        <span className="hud-label">Suspicion</span>
        <span className="font-pixel text-2xl leading-none">{value}</span>
      </div>
      <p className="text-[10px] leading-snug opacity-60">Calibrated by vibes. Not admissible. Spies have been known to read 12.</p>
    </div>
  );
}

export function Terminal() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const offered = offeredQuestions(run, CONTENT);
  const fresh = offered.some((o) => !o.asked && o.question.requires?.length);
  const tabs = [
    { id: "database", label: "Database" },
    { id: "interrogate", label: `Interrogate${fresh ? " •" : ""}` },
  ] as const;
  return (
    <section className="col col-terminal" aria-label="Security terminal">
      <div className="terminal">
        <div className="term-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={s.termTab === t.id}
              className={`term-tab ${s.termTab === t.id ? "term-tab-on" : ""}`}
              onClick={() => dispatch({ type: "termTab", tab: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="term-screen" role="tabpanel">
          {s.termTab === "database" ? <Database /> : <Interrogate />}
        </div>
      </div>
      <Gauge value={suspicion(run, CONTENT)} />
    </section>
  );
}
