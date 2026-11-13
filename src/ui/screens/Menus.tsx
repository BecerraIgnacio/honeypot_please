"use client";

import { useState, type ReactNode } from "react";
import { JensenFace } from "../../art/PixelArt";
import { ACHIEVEMENTS } from "../../game/content/achievements";
import type { Settings } from "../../game/persistence";
import { SharePanel } from "../../share/ui/SharePanel";
import { Btn, Modal, Paper } from "../common";
import { RARITY, TOTAL_EGGS } from "../content";
import { useGame } from "../GameProvider";
import { achievementShare } from "../share";

function Shell({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  const { s, dispatch } = useGame();
  return (
    <main className="screen-scroll">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="hud-label text-[var(--acid)]">{kicker}</p>
            <h1 className="font-display text-4xl leading-none md:text-5xl">{title}</h1>
          </div>
          <Btn onClick={() => dispatch({ type: "navigate", screen: s.back === s.screen ? "title" : s.back })} autoFocus>
            ← Back
          </Btn>
        </header>
        {children}
      </div>
    </main>
  );
}

export function Achievements() {
  const { s, dispatch } = useGame();
  const eggs = new Set([...s.profile.eggsFound, ...(s.run?.stats.eggsFound ?? [])]).size;
  const unlocked = ACHIEVEMENTS.filter((a) => a.id in s.profile.unlocked).length;
  const open = ACHIEVEMENTS.find((a) => a.id === s.detail && a.id in s.profile.unlocked);
  const share = open ? achievementShare(open, s.profile) : null;

  return (
    <Shell title="Achievements" kicker={`${unlocked}/${ACHIEVEMENTS.length} unlocked · ${eggs}/${TOTAL_EGGS} easter eggs found`}>
      <ul className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = a.id in s.profile.unlocked;
          const r = RARITY[a.rarity];
          const hidden = !got && a.secret;
          return (
            <li key={a.id}>
              <button
                type="button"
                className={`ach ${got ? "ach-got" : "ach-locked"} rarity-${a.rarity}`}
                style={{ ["--r" as string]: r.color }}
                disabled={!got}
                onClick={() => dispatch({ type: "detail", id: a.id })}
                aria-label={got ? `${a.title}, ${r.label}. Open to share.` : hidden ? "Secret achievement, locked" : `${a.title}, locked`}
              >
                <span className="ach-rarity">{r.label}</span>
                <span className="ach-title">{hidden ? "???" : a.title}</span>
                <span className="ach-desc">{hidden ? "Secret. Keep playing." : a.description}</span>
                {got && <span className="ach-flavor">{a.flavor}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {open && share && (
        <Modal label={open.title} onClose={() => dispatch({ type: "detail", id: null })} wide>
          <p className="hud-label" style={{ color: RARITY[open.rarity].color }}>
            {RARITY[open.rarity].label} · unlocked {new Date(s.profile.unlocked[open.id].at).toLocaleDateString()}
          </p>
          <h2 className="font-display text-3xl leading-tight">{open.title}</h2>
          <p className="text-sm">{open.description}</p>
          <p className="mb-4 text-xs italic opacity-70">{open.flavor}</p>
          <SharePanel card={share.card} templates={open.shareTemplates} vars={share.vars} />
        </Modal>
      )}
    </Shell>
  );
}

const STEPS: [string, string][] = [
  ["Read her papers.", "Click a document on the pile to open it. On a big screen you can drag the sheets around the desk. Every label and value on paper is a fact."],
  ["Compare two facts.", "Click any two facts, from her claims, a document, an answer, a database record or a directive. Hit COMPARE. The terminal tells you if they contradict, match, or have an innocent explanation. Findings land in the notebook."],
  ["Interrogate.", "Ask questions from the terminal. Some only unlock after you have read the right document or pulled the right record. They pulse when they do."],
  ["Search the database.", "Names, badge numbers, firms, phone numbers. An empty search lists every directive in force. Dolores adds new ones every morning and the old ones never go away."],
  ["Scan, sparingly.", "Two advanced scans per shift. The x-ray sees what she did not declare."],
  ["Stamp it.", "Press and hold ACCEPT or REJECT. Accept one spy and the run ends: HONEYPOTTED. Reject too many innocents and Romantic Stability hits zero: romantically bankrupt."],
];

export function HowTo() {
  return (
    <Shell title="How to play" kicker="Orientation pack · RPC-7">
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <Paper>
          <p className="font-mono text-sm leading-relaxed">
            You are the last line between the world&apos;s most valuable man and everyone who wants five minutes of his time. Most of them want coffee. Some of them want the Rubin roadmap. They all have a lanyard.
          </p>
          <ol className="mt-4 flex flex-col gap-3">
            {STEPS.map(([h, t], i) => (
              <li key={h} className="flex gap-3">
                <span className="font-display text-2xl leading-none text-[var(--red)]">{i + 1}</span>
                <span className="text-sm leading-relaxed">
                  <b>{h}</b> {t}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-mono text-sm leading-relaxed">
            Nervous, foreign, gorgeous or brilliant proves nothing. The suspicion meter is a vibe, not a verdict. Contradictions are evidence. Everything else is a mood.
          </p>
          <p className="mt-3 text-xs opacity-70">
            Keys: Tab to move, Enter or Space to press, hold Space on a stamp to decide, Esc to put a sheet back, 1 2 3 to switch sections on small screens.
          </p>
        </Paper>
        <div className="flex flex-col items-center gap-2">
          <JensenFace mood="wary" size={160} />
          <p className="bubble bubble-up text-sm">She says she loves me for my personality. My personality is CUDA.</p>
        </div>
      </div>
    </Shell>
  );
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="toggle" onClick={() => onChange(!on)}>
      <span className="flex min-w-0 flex-col text-left">
        <span className="font-display text-base">{label}</span>
        <span className="text-xs opacity-70">{hint}</span>
      </span>
      <span className={`toggle-pill ${on ? "toggle-on" : ""}`}>{on ? "ON" : "OFF"}</span>
    </button>
  );
}

export function SettingsScreen() {
  const { s, dispatch } = useGame();
  const [confirm, setConfirm] = useState("");
  const set = (patch: Partial<Settings>) => dispatch({ type: "settings", settings: { ...s.settings, ...patch } });
  return (
    <Shell title="Settings" kicker="Desk configuration">
      <div className="flex max-w-xl flex-col gap-3">
        <Toggle label="Sound" hint="Tiny synth blips. Nothing plays until you click something." on={s.settings.sound} onChange={(v) => set({ sound: v })} />
        <Toggle label="CRT effect" hint="Scanlines and vignette over everything." on={s.settings.crt} onChange={(v) => set({ crt: v })} />
        <Toggle label="Reduced motion" hint="No shakes, slams or sweeps. Your system setting is always respected too." on={s.settings.reducedMotion} onChange={(v) => set({ reducedMotion: v })} />
        <section className="panel mt-4 border-[var(--red)]">
          <h2 className="panel-title text-[var(--red)]">Reset progress</h2>
          <p className="mb-2 text-xs">Deletes every achievement, egg and saved shift. Type SHRED to confirm.</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (confirm.trim().toUpperCase() !== "SHRED") return;
              setConfirm("");
              dispatch({ type: "resetProgress" });
            }}
          >
            <input className="input flex-1" aria-label="Type SHRED to confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="SHRED" />
            <Btn variant="danger" type="submit" disabled={confirm.trim().toUpperCase() !== "SHRED"}>
              Shred it
            </Btn>
          </form>
        </section>
      </div>
    </Shell>
  );
}
