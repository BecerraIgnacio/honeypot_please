"use client";

import { useState } from "react";
import { currentCase, discovered, offeredQuestions, searchDatabase, suspicion, type DbHit } from "../../game/engine";
import type { DbCategory, Question } from "../../game/types";
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

function Hit({ h }: { h: DbHit }) {
  const { s, dispatch } = useGame();
  const open = s.record === h.record.id;
  return (
    <li>
      <button
        type="button"
        className={`term-hit ${open ? "term-hit-on" : ""}`}
        aria-expanded={open}
        onClick={() => {
          sfx("blip");
          dispatch({ type: "openRecord", id: open ? null : h.record.id });
        }}
      >
        <span className={`term-tag tag-${h.record.category}`}>{CAT[h.record.category]}</span>
        <span className="min-w-0 flex-1 truncate">{h.record.title}</span>
        <span aria-hidden className="opacity-60">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="term-rec">
          {h.record.body && <p className="term-body">{h.record.body}</p>}
          <FactList owner={h.owner} facts={h.record.facts} compact />
        </div>
      )}
    </li>
  );
}

function Hits({ hits }: { hits: DbHit[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {hits.map((h) => (
        <Hit key={`${h.owner}|${h.record.id}`} h={h} />
      ))}
    </ul>
  );
}

/** Search field and results; a result expands in place. With no query, the directives in force sit in a closed group. */
export function Database() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const [draft, setDraft] = useState(s.query);
  const q = s.query.trim();
  const hits = searchDatabase(run, CONTENT, s.query);

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
          placeholder="name, badge, firm"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>
      {q === "" ? (
        <details className="term-group">
          <summary className="term-cat">Directives in force · {hits.length}</summary>
          <Hits hits={hits} />
        </details>
      ) : (
        <>
          <p className="term-cat">
            {hits.length} result{hits.length === 1 ? "" : "s"} for &quot;{q}&quot;
          </p>
          {hits.length === 0 && <p className="term-body">{q.length === 1 ? "Two characters minimum." : "No records. Try a name, badge or firm."}</p>}
          <Hits hits={hits} />
        </>
      )}
    </div>
  );
}

function AskedQuestion({ q, owner, latest }: { q: Question; owner: string; latest: boolean }) {
  const [open, setOpen] = useState<boolean | null>(null);
  const shown = open ?? latest;
  return (
    <li className={`q-asked ${shown ? "q-asked-open" : ""}`}>
      <button type="button" className="q-asked-head" aria-expanded={shown} onClick={() => setOpen(!shown)}>
        {q.prompt}
      </button>
      {shown && (
        <div className="flex flex-col gap-1 pop-in">
          <p className="term-body">“{q.answer}”</p>
          <FactList owner={owner} facts={q.facts} compact />
        </div>
      )}
    </li>
  );
}

/** Questions to ask; an asked question shows her answer and its facts right under it, latest open. */
export function QuestionList() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const c = currentCase(run, CONTENT)!;
  const offered = offeredQuestions(run, CONTENT);
  const lastAsked = discovered(run)
    .filter((t) => t.startsWith("q:"))
    .at(-1);
  return (
    <ul className="flex flex-col gap-1.5">
      {offered.map(({ question: q, asked }) =>
        asked ? (
          <AskedQuestion key={q.id} q={q} owner={c.id} latest={lastAsked === `q:${q.id}`} />
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
      {offered.length < c.questions.length && <li className="term-body mt-1 opacity-60">More questions unlock as you dig.</li>}
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
      <p className="text-[10px] leading-snug opacity-60">A vibe, not a verdict.</p>
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
          {s.termTab === "database" ? <Database /> : <QuestionList />}
        </div>
      </div>
      <Gauge value={suspicion(run, CONTENT)} />
    </section>
  );
}
