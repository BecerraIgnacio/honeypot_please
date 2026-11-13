"use client";

import { Pixel } from "../../art/PixelArt";
import { scannerSvg } from "../../art/props";
import { notebook, revealedFacts, revealedScanFindings, currentCase } from "../../game/engine";
import { FactList, Modal } from "../common";
import { CONTENT, refKey } from "../content";
import { useGame } from "../GameProvider";
import { sfx } from "../sound";

const KIND_TAG = { contradiction: "CONTRADICTION", explained: "EXPLAINED", match: "MATCH" } as const;

export function CompareBar({ className = "" }: { className?: string }) {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const byKey = new Map(revealedFacts(run, CONTENT).map((f) => [refKey(f.ref), f.fact]));
  const slots = [0, 1].map((i) => s.selection[i]);
  const ready = s.selection.length === 2;
  const r = s.readout;

  return (
    <div className={`compare ${className}`}>
      <div className="compare-row">
        {slots.map((ref, i) => {
          const fact = ref && byKey.get(refKey(ref));
          return (
            <button
              key={i}
              type="button"
              className={`slot ${fact ? "slot-full" : ""}`}
              disabled={!fact}
              onClick={() => ref && dispatch({ type: "select", ref })}
              aria-label={fact ? `Slot ${i ? "B" : "A"}: ${fact.label}, ${fact.value}. Click to clear.` : `Slot ${i ? "B" : "A"} empty`}
            >
              <span className="slot-tag">{i ? "B" : "A"}</span>
              {fact ? (
                <span className="min-w-0">
                  <span className="block truncate text-[10px] uppercase tracking-wider opacity-70">{fact.label}</span>
                  <span className="block truncate text-xs">{fact.value}</span>
                </span>
              ) : (
                <span className="text-[11px] opacity-50">select a fact</span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          className="btn btn-primary compare-go"
          disabled={!ready}
          onClick={() => {
            sfx("key");
            dispatch({ type: "compare" });
          }}
        >
          Compare
        </button>
      </div>
      {r && (
        <div key={r.n} className={`readout readout-${r.kind} print-in`} role="status">
          <span className="readout-tag">
            {r.kind === "none" ? "NO CONFLICT" : r.kind === "repeat" ? "LOGGED" : r.kind === "empty" ? "SCANNER" : KIND_TAG[r.kind]}
          </span>
          <span className="min-w-0 flex-1">{r.text}</span>
          <button type="button" className="sheet-x" aria-label="Dismiss readout" onClick={() => dispatch({ type: "dismissReadout" })}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export function ScanButton() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const used = run.phase.kind === "case" && run.phase.tokens.includes("scan");
  return (
    <button
      type="button"
      className={`scan-btn ${run.scansLeft === 0 && !used ? "scan-empty" : ""}`}
      onClick={() => dispatch({ type: "scanPress" })}
      aria-label={used ? "View scan results" : `Advanced scan, ${run.scansLeft} charges left today`}
    >
      <Pixel svg={scannerSvg(run.scansLeft, { size: 120 })} />
      <span className="hud-label">{used ? "View x-ray" : `Scan · ${run.scansLeft} left`}</span>
    </button>
  );
}

export function Notebook() {
  const { s } = useGame();
  const notes = notebook(s.run!, CONTENT);
  return (
    <section className="notebook" aria-label="Notebook">
      <p className="notebook-title">Findings</p>
      {notes.length === 0 ? (
        <p className="notebook-empty">Nothing yet. Compare two facts and the terminal writes here.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {notes.map((d) => (
            <li key={d.id} className={`note note-${d.kind}`}>
              <span className="note-tag">{KIND_TAG[d.kind]}</span> {d.note}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function ScanOverlay() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  if (!s.scanView) return null;
  const c = currentCase(run, CONTENT)!;
  const findings = revealedScanFindings(run, CONTENT);
  return (
    <Modal label="X-ray scan results" onClose={() => dispatch({ type: "scanView", open: false })}>
      <div className="xray">
        <div className="xray-sweep" aria-hidden />
        <p className="hud-label text-[var(--acid)]">Advanced scan · {c.applicant.name}</p>
        <h2 className="font-display mb-3 text-2xl">X-RAY</h2>
        <ul className="flex flex-col gap-3">
          {findings.map((f) => (
            <li key={f.id} className={`xray-item ${f.kind === "clean" ? "xray-clean" : ""}`}>
              <p className="hud-label">{f.kind.replace(/-/g, " ")}</p>
              <p className="font-display text-sm">{f.title}</p>
              <p className="mb-1 text-xs leading-relaxed opacity-85">{f.description}</p>
              <FactList owner={c.id} facts={f.facts} compact />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
