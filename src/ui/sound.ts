export type Sfx = "paper" | "stamp" | "key" | "scan" | "alarm" | "blip" | "good" | "bad" | "chime";

let ctx: AudioContext | null = null;
let enabled = false;
let unlocked = false;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

/** Browsers refuse audio before a gesture; the provider calls this from the first pointer or key event. */
export function unlockAudio() {
  unlocked = true;
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(c: AudioContext, opts: { type: OscillatorType; from: number; to?: number; at?: number; dur: number; vol: number }) {
  const t = c.currentTime + (opts.at ?? 0);
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.from, t);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + opts.dur);
  gain.gain.setValueAtTime(opts.vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + opts.dur + 0.02);
}

function noise(c: AudioContext, opts: { dur: number; vol: number; at?: number; filter: number; q?: number; type?: BiquadFilterType }) {
  const t = c.currentTime + (opts.at ?? 0);
  const length = Math.max(1, Math.floor(c.sampleRate * opts.dur));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = opts.type ?? "bandpass";
  filter.frequency.value = opts.filter;
  filter.Q.value = opts.q ?? 0.8;
  const gain = c.createGain();
  gain.gain.value = opts.vol;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
}

const VOICES: Record<Sfx, (c: AudioContext) => void> = {
  paper: (c) => noise(c, { dur: 0.16, vol: 0.35, filter: 2400, q: 0.6 }),
  stamp: (c) => {
    tone(c, { type: "sine", from: 140, to: 45, dur: 0.22, vol: 0.7 });
    noise(c, { dur: 0.08, vol: 0.5, filter: 900, type: "lowpass" });
  },
  key: (c) => tone(c, { type: "square", from: 1800 + Math.random() * 400, dur: 0.025, vol: 0.04 }),
  blip: (c) => tone(c, { type: "square", from: 660, to: 990, dur: 0.07, vol: 0.06 }),
  scan: (c) => {
    tone(c, { type: "sawtooth", from: 200, to: 1600, dur: 0.9, vol: 0.06 });
    tone(c, { type: "sine", from: 1600, to: 300, at: 0.9, dur: 0.5, vol: 0.05 });
  },
  good: (c) => {
    tone(c, { type: "triangle", from: 523, dur: 0.12, vol: 0.12 });
    tone(c, { type: "triangle", from: 784, at: 0.1, dur: 0.18, vol: 0.12 });
  },
  bad: (c) => {
    tone(c, { type: "square", from: 220, to: 150, dur: 0.25, vol: 0.08 });
  },
  chime: (c) => {
    [784, 988, 1319].forEach((f, i) => tone(c, { type: "triangle", from: f, at: i * 0.08, dur: 0.3, vol: 0.09 }));
  },
  alarm: (c) => {
    for (let i = 0; i < 6; i++) {
      tone(c, { type: "square", from: i % 2 ? 620 : 880, at: i * 0.22, dur: 0.2, vol: 0.09 });
    }
  },
};

export function sfx(name: Sfx) {
  if (!enabled || !unlocked) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    VOICES[name](ctx);
  } catch {
    // Audio is decoration; a failing device must not break the game.
  }
}
