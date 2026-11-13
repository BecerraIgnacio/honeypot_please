"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { Pixel, Portrait } from "../../art/PixelArt";
import { docIconSvg, sealSvg } from "../../art/props";
import { currentCase, discovered } from "../../game/engine";
import type { CaseDef, DocKind, GameDocument } from "../../game/types";
import { FactList } from "../common";
import { CONTENT, rng01 } from "../content";
import { useGame, useMedia } from "../GameProvider";
import { sfx } from "../sound";
import type { OpenDoc } from "../state";

type Family = "card" | "badge" | "letter" | "memo" | "receipt" | "tabloid" | "certificate" | "photo" | "plain";

const FAMILY: Record<DocKind, Family> = {
  "id-card": "card",
  "employee-credential": "card",
  "access-badge": "badge",
  "conference-pass": "badge",
  "personal-note": "letter",
  "invitation-letter": "letter",
  "relationship-proof": "letter",
  "romance-artifact": "letter",
  "security-memo": "memo",
  "board-notice": "memo",
  "shipping-record": "receipt",
  receipt: "receipt",
  tabloid: "tabloid",
  certificate: "certificate",
  photo: "photo",
  other: "plain",
};

const KIND_LABEL: Record<DocKind, string> = {
  "id-card": "ID",
  "employee-credential": "Credential",
  "access-badge": "Badge",
  "conference-pass": "Pass",
  "personal-note": "Note",
  "invitation-letter": "Letter",
  "relationship-proof": "Proof",
  "romance-artifact": "Artifact",
  "security-memo": "Memo",
  "board-notice": "Notice",
  "shipping-record": "Shipping",
  receipt: "Receipt",
  tabloid: "Tabloid",
  certificate: "Certificate",
  photo: "Photo",
  other: "Document",
};

const WIDTH: Record<Family, number> = {
  card: 340,
  badge: 270,
  letter: 330,
  memo: 340,
  receipt: 260,
  tabloid: 380,
  certificate: 360,
  photo: 280,
  plain: 320,
};

function Stamp({ text, seed }: { text?: string; seed: string }) {
  if (!text) return null;
  const rot = Math.round((rng01(seed, "stamp") - 0.5) * 30);
  const red = !/verified|valid|approved|paid|clear|authentic|ok\b/i.test(text);
  return (
    <span className={`stamp-ink ${red ? "stamp-red" : "stamp-green"}`} style={{ rotate: `${rot}deg` }}>
      {text}
    </span>
  );
}

function DocBody({ c, doc }: { c: CaseDef; doc: GameDocument }) {
  const family = FAMILY[doc.kind] ?? "plain";
  const facts = <FactList owner={c.id} facts={doc.facts} />;
  const body = doc.body ? <p className="doc-prose">{doc.body}</p> : null;
  const footer = doc.footer ? <p className="doc-footer">{doc.footer}</p> : null;
  const photo = (size: number) => <Portrait spec={c.applicant.portrait} size={size} className="doc-photo" label={`Photo on ${doc.title}`} />;

  const layouts: Record<Family, ReactNode> = {
    card: (
      <>
        <div className="doc-band">{doc.issuer ?? "Identity document"}</div>
        <p className="doc-title">{doc.title}</p>
        <div className="flex gap-3">
          {photo(84)}
          <div className="min-w-0 flex-1">{facts}</div>
        </div>
        {body}
        {footer}
        <div className="doc-mrz" aria-hidden>
          {`<<${c.applicant.name.toUpperCase().replace(/[^A-Z]/g, "<")}<<<<<<<<<<<<<<<<<`.slice(0, 40)}
        </div>
      </>
    ),
    badge: (
      <>
        <span className="lanyard-hole" aria-hidden />
        <div className="doc-band doc-band-acid">{doc.issuer ?? "Access"}</div>
        <div className="flex flex-col items-center gap-2 py-2">
          {photo(96)}
          <p className="doc-title text-center">{doc.title}</p>
        </div>
        {facts}
        {body}
        {footer}
        <div className="barcode" aria-hidden />
      </>
    ),
    letter: (
      <>
        {doc.issuer && <p className="doc-letterhead">{doc.issuer}</p>}
        <p className="doc-title">{doc.title}</p>
        {body && <div className="doc-ruled">{body}</div>}
        {facts}
        {footer}
      </>
    ),
    memo: (
      <>
        <p className="doc-memo-head">MEMORANDUM</p>
        <p className="doc-meta">
          <b>FROM:</b> {doc.issuer ?? "Unknown"}
          <br />
          <b>RE:</b> {doc.title}
        </p>
        <hr className="doc-rule" />
        {body}
        {facts}
        {footer}
      </>
    ),
    receipt: (
      <>
        <p className="text-center font-mono text-xs font-bold uppercase">{doc.issuer ?? "Receipt"}</p>
        <p className="text-center font-mono text-[11px]">{doc.title}</p>
        <hr className="doc-dash" />
        {facts}
        <hr className="doc-dash" />
        {body}
        {footer ?? <p className="doc-footer text-center">THANK YOU · NO REFUNDS ON FEELINGS</p>}
        <div className="receipt-teeth" aria-hidden />
      </>
    ),
    tabloid: (
      <>
        <p className="tabloid-mast">{doc.issuer ?? "THE DAILY SCALPER"}</p>
        <p className="tabloid-head">{doc.title}</p>
        {body && <p className="doc-prose tabloid-cols">{doc.body}</p>}
        {facts}
        {footer}
      </>
    ),
    certificate: (
      <div className="cert-frame">
        <p className="cert-issuer">{doc.issuer ?? "Certificate"}</p>
        <p className="cert-title">{doc.title}</p>
        {body}
        {facts}
        <div className="mt-2 flex items-end justify-between gap-2">
          {footer ?? <span />}
          <Pixel svg={sealSvg(doc.issuer ?? doc.title, { size: 64 })} className="shrink-0" />
        </div>
      </div>
    ),
    photo: (
      <>
        <div className="polaroid">{photo(200)}</div>
        <p className="photo-caption">{doc.title}</p>
        {doc.issuer && <p className="doc-footer">{doc.issuer}</p>}
        {body}
        {facts}
        {footer}
      </>
    ),
    plain: (
      <>
        {doc.issuer && <p className="doc-letterhead">{doc.issuer}</p>}
        <p className="doc-title">{doc.title}</p>
        {body}
        {facts}
        {footer}
      </>
    ),
  };

  return (
    <div className={`doc doc-${family}`}>
      {layouts[family]}
      <Stamp text={doc.stamp} seed={doc.id} />
    </div>
  );
}

function Sheet({ c, doc, open, bounds, draggable }: { c: CaseDef; doc: GameDocument; open: OpenDoc; bounds: () => DOMRect | null; draggable: boolean }) {
  const { dispatch } = useGame();
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const grab = useRef<{ dx: number; dy: number; w: number; h: number } | null>(null);
  const family = FAMILY[doc.kind] ?? "plain";

  function down(e: RPointerEvent<HTMLDivElement>) {
    dispatch({ type: "focusDoc", id: doc.id });
    if (!draggable || (e.target as HTMLElement).closest("button, a, input, summary")) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    grab.current = { dx: e.clientX - open.x, dy: e.clientY - open.y, w: el.offsetWidth, h: el.offsetHeight };
    setDrag({ x: open.x, y: open.y });
  }
  function move(e: RPointerEvent<HTMLDivElement>) {
    const g = grab.current;
    const b = bounds();
    if (!g || !b) return;
    const x = Math.min(Math.max(-g.w * 0.4, e.clientX - g.dx), b.width - g.w * 0.6);
    const y = Math.min(Math.max(0, e.clientY - g.dy), b.height - 60);
    setDrag({ x, y });
  }
  function up() {
    if (grab.current && drag) dispatch({ type: "moveDoc", id: doc.id, x: drag.x, y: drag.y });
    grab.current = null;
    setDrag(null);
  }

  const pos = drag ?? open;
  const style: CSSProperties = draggable
    ? { left: pos.x, top: pos.y, zIndex: open.z, width: WIDTH[family], rotate: drag ? "0deg" : `${open.rot}deg` }
    : { zIndex: open.z };

  return (
    <div
      className={`sheet ${draggable ? "sheet-float" : "sheet-static"} ${drag ? "sheet-drag" : ""}`}
      style={style}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="dialog"
      aria-label={doc.title}
    >
      <div className="sheet-bar">
        <span className="hud-label truncate">{KIND_LABEL[doc.kind]} · drag to move</span>
        <button type="button" className="sheet-x" aria-label={`Put ${doc.title} back on the pile`} onClick={() => dispatch({ type: "closeDoc", id: doc.id })}>
          ×
        </button>
      </div>
      <DocBody c={c} doc={doc} />
    </div>
  );
}

export function Documents() {
  const { s, dispatch } = useGame();
  const run = s.run!;
  const c = currentCase(run, CONTENT)!;
  const tokens = discovered(run);
  const surface = useRef<HTMLDivElement>(null);
  const wide = useMedia("(min-width: 1100px)", true);
  const ordered = [...s.openDocs].sort((a, b) => (wide ? a.z - b.z : b.z - a.z));

  function open(doc: GameDocument) {
    sfx("paper");
    const n = s.openDocs.length % 6;
    const rect = surface.current?.getBoundingClientRect();
    const w = WIDTH[FAMILY[doc.kind] ?? "plain"];
    const maxX = Math.max(8, (rect?.width ?? 600) - w - 12);
    const x = Math.min(maxX, 16 + n * 34 + rng01(doc.id, "x") * 40);
    dispatch({ type: "openDoc", id: doc.id, x, y: 14 + n * 26, rot: Math.round((rng01(doc.id, "rot") - 0.5) * 60) / 10 });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="pile" role="list" aria-label="Her documents">
        {c.documents.map((doc, i) => {
          const read = tokens.includes(`doc:${doc.id}`);
          const isOpen = s.openDocs.some((o) => o.id === doc.id);
          return (
            <button
              key={doc.id}
              type="button"
              role="listitem"
              className={`thumb ${isOpen ? "thumb-open" : ""}`}
              style={{ rotate: `${(rng01(doc.id, i) - 0.5) * 8}deg` }}
              onClick={() => open(doc)}
              aria-label={`${isOpen ? "Bring to front" : "Open"}: ${doc.title}`}
            >
              <Pixel svg={docIconSvg(doc.kind, { size: 32 })} />
              <span className="thumb-kind">{KIND_LABEL[doc.kind]}</span>
              <span className="thumb-title">{doc.title}</span>
              {read && <span className="thumb-read">read</span>}
            </button>
          );
        })}
      </div>
      <div ref={surface} className={`desk-surface ${wide ? "" : "desk-surface-stack"}`}>
        {s.openDocs.length === 0 && (
          <p className="desk-hint">Pick a document off the pile. Click any fact, on paper or on screen, to load it into a COMPARE slot.</p>
        )}
        {ordered.map((o) => {
          const doc = c.documents.find((d) => d.id === o.id);
          return doc ? (
            <Sheet key={o.id} c={c} doc={doc} open={o} draggable={wide} bounds={() => surface.current?.getBoundingClientRect() ?? null} />
          ) : null;
        })}
      </div>
    </div>
  );
}
