"use client";

import { Pixel } from "../../art/PixelArt";
import { scannerSvg } from "../../art/props";
import { notebook, revealedFacts, revealedScanFindings, currentCase } from "../../game/engine";
import { FactList, Modal } from "../common";
import { CONTENT, refKey } from "../content";
import { useGame } from "../GameProvider";
import { sfx } from "../sound";

const KIND_TAG = { contradiction: "CONTRADICTION", explained: "EXPLAINED", match: "MATCH" } as const;

/** The two compare slots and the COMPARE button. */
export function CompareBar() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const byKey = new Map(revealedFacts(run, CONTENT).map((f) => [refKey(f.ref), f.fact]));
  const slots = [0, 1].map((i) => s.selection[i]);

  return (
    <div className="compare-row">
      {slots.map((ref, i) => {
        const fact = ref && byKey.get(refKey(ref));
        const tag = i ? "B" : "A";
        return (
          <button
            key={i}
            type="button"
            className={`slot ${fact ? "slot-full" : ""}`}
            disabled={!fact}
            onClick={() => ref && dispatch({ type: "select", ref })}
            aria-label={fact ? `Slot ${tag}: ${fact.label}, ${fact.value}. Clear.` : `Slot ${tag} empty`}
          >
            <span className="slot-tag">{tag}</span>
            {fact ? (
              <>
                <span className="slot-text">
                  <span className="opacity-70">{fact.label}:</span> {fact.value}
                </span>
                <span className="slot-x" aria-hidden>
                  ×
                </span>
              </>
            ) : (
              <span className="slot-text opacity-50">pick a fact</span>
            )}
          </button>
        );
      })}
      <button
        type="button"
        className="btn btn-primary compare-go"
        disabled={s.selection.length !== 2}
        onClick={() => {
          sfx("key");
          dispatch({ type: "compare" });
        }}
      >
        Compare
      </button>
    </div>
  );
}

/** The terminal's verdict on the last compare. Collapses into the notebook after a few seconds. */
export function Readout({ className = "" }: { className?: string }) {
  const { s, dispatch } = useGame();
  const r = s.readout;
  if (!r) return null;
  return (
    <div key={r.n} className={`readout readout-${r.kind} print-in ${className}`} role="status">
      <span className="readout-tag">
        {r.kind === "none" ? "NO CONFLICT" : r.kind === "repeat" ? "LOGGED" : r.kind === "empty" ? "SCANNER" : KIND_TAG[r.kind]}
      </span>
      <span className="min-w-0 flex-1">{r.text}</span>
      <button type="button" className="sheet-x" aria-label="Dismiss readout" onClick={() => dispatch({ type: "dismissReadout" })}>
        ×
      </button>
    </div>
  );
}

export function ScanButton({ inline = false }: { inline?: boolean }) {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const used = run.phase.kind === "case" && run.phase.tokens.includes("scan");
  const label = used ? (inline ? `Scanned · ${run.scansLeft} left` : "View x-ray") : `Scan · ${run.scansLeft} left`;
  return (
    <button
      type="button"
      className={`scan-btn ${inline ? "scan-btn-inline" : ""} ${run.scansLeft === 0 && !used ? "scan-empty" : ""}`}
      disabled={inline && used}
      onClick={() => dispatch({ type: "scanPress" })}
      aria-label={used ? (inline ? "Scan done" : "View scan results") : `Advanced scan, ${run.scansLeft} charges left today`}
    >
      <Pixel svg={scannerSvg(run.scansLeft, { size: inline ? 48 : 120 })} />
      <span className="hud-label">{label}</span>
    </button>
  );
}

export function ScanFindings() {
  const { s } = useGame();
  const run = s.run!;
  const c = currentCase(run, CONTENT)!;
  const findings = revealedScanFindings(run, CONTENT);
  return (
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
  );
}

export function Notebook() {
  const { s } = useGame();
  const notes = notebook(s.run!, CONTENT);
  return (
    <section className="notebook" aria-label="Findings">
      <p className="notebook-title">Findings</p>
      {notes.length === 0 ? (
        <p className="notebook-empty">Compare two facts to log findings.</p>
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

/** Narrow layouts: the notebook lives behind this chip, in a bottom sheet. */
export function FindingsChip() {
  const { s, dispatch } = useGame();
  const n = notebook(s.run!, CONTENT).length;
  return (
    <>
      <button type="button" className="findings-chip" onClick={() => dispatch({ type: "findings", open: true })} aria-label={`Findings, ${n}. Open notebook.`}>
        <span className="hud-label">Findings</span>
        <span key={n} className="findings-n pop-in">
          {n}
        </span>
      </button>
      {s.findings && (
        <Modal label="Findings" sheet onClose={() => dispatch({ type: "findings", open: false })}>
          <Notebook />
        </Modal>
      )}
    </>
  );
}

export function ScanOverlay() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  if (!s.scanView) return null;
  const c = currentCase(run, CONTENT)!;
  return (
    <Modal label="X-ray scan results" onClose={() => dispatch({ type: "scanView", open: false })}>
      <div className="xray">
        <div className="xray-sweep" aria-hidden />
        <p className="hud-label text-[var(--acid)]">Advanced scan · {c.applicant.name}</p>
        <h2 className="font-display mb-3 text-2xl">X-RAY</h2>
        <ScanFindings />
      </div>
    </Modal>
  );
}
