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
          <SharePanel card={share.card} templates={open.shareTemplates} vars={share.vars} artKey={share.artKey} />
        </Modal>
      )}
    </Shell>
  );
}

const STEPS = [
  "Read her claims and papers. Every label and value is a fact.",
  "Pick any two facts and COMPARE. Contradictions are evidence.",
  "Ask questions. Some unlock after the right document or record.",
  "Search the database. Directives pile up and never expire.",
  "Scan sparingly: two x-rays per shift.",
  "Hold ACCEPT or REJECT. Let one spy in and it is over.",
];

export function HowTo() {
  return (
    <Shell title="How to play" kicker="Orientation pack · RPC-7">
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <Paper>
          <ol className="flex flex-col gap-3">
            {STEPS.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="font-display text-2xl leading-none text-[var(--red)]">{i + 1}</span>
                <span className="text-sm leading-relaxed">{t}</span>
              </li>
            ))}
          </ol>
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
