// Sound effects made from simple tones, so there are no sound files to load.
// iOS only allows sound after the first touch, so unlockAudio() is called on every tap.

let ctx = null;
let muted = false;

export function unlockAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      ctx = new AudioCtx();
    } catch {
      return;
    }
  }
  // "suspended" before the first touch, "interrupted" on iOS after a call or switching apps.
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}

export function setMuted(value) {
  muted = value;
  if (value) stopVoiceClip();
}

// --- Recorded voice clips ----------------------------------------------------------
// The clips go through the same sound system as the effects, which is what lets them
// play on iPhones and iPads after the first touch.

const clips = new Map(); // address -> the decoded clip (or a promise of it)
let playing = null; // the clip being said now
let waiting = null; // one clip waiting for it to finish
let request = 0; // goes up whenever speech is interrupted, so a slow download is not played late

function loadClip(url) {
  if (!clips.has(url)) {
    const loading = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} for ${url}`);
        return response.arrayBuffer();
      })
      .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)));
    loading.catch(() => clips.delete(url));
    clips.set(url, loading);
  }
  return clips.get(url);
}

function startClip(url, mine) {
  loadClip(url)
    .then((buffer) => {
      if (mine !== request || muted) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        if (playing !== source) return;
        playing = null;
        if (waiting) {
          const next = waiting;
          waiting = null;
          startClip(next, request);
        }
      };
      playing = source;
      source.start();
    })
    .catch(() => {});
}

// Plays a clip. Normally it cuts off whatever is being said; with { queue: true } it waits
// for that to finish. Returns false if sound is not available yet (before the first touch).
export function playVoiceClip(url, { queue = false } = {}) {
  if (muted || !ctx) return false;
  if (queue && playing) {
    waiting = url;
    loadClip(url).catch(() => {});
    return true;
  }
  stopVoiceClip();
  startClip(url, request);
  return true;
}

export function stopVoiceClip() {
  request += 1;
  waiting = null;
  if (!playing) return;
  const source = playing;
  playing = null;
  try {
    source.stop();
  } catch {
    // It had already finished.
  }
}

// Fetches a clip ahead of time so it starts without a pause.
export function preloadVoiceClip(url) {
  if (ctx) loadClip(url).catch(() => {});
}

function tone({ freq, slideTo, start = 0, length = 0.15, type = 'sine', volume = 0.2 }) {
  if (muted || !ctx || ctx.state !== 'running') return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + length);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + length + 0.03);
}

export const sfx = {
  tap() {
    tone({ freq: 440, length: 0.06, type: 'triangle', volume: 0.12 });
  },
  move() {
    tone({ freq: 560, slideTo: 700, length: 0.07, type: 'triangle', volume: 0.08 });
  },
  correct() {
    tone({ freq: 660, length: 0.12, type: 'triangle', volume: 0.22 });
    tone({ freq: 990, start: 0.1, length: 0.22, type: 'triangle', volume: 0.22 });
  },
  wrong() {
    // A soft low bump, not a harsh buzzer.
    tone({ freq: 240, slideTo: 150, length: 0.28, type: 'sine', volume: 0.3 });
  },
  fanfare() {
    [523, 659, 784, 659, 784, 1047].forEach((freq, i) => {
      tone({ freq, start: i * 0.12, length: i === 5 ? 0.45 : 0.16, type: 'triangle', volume: 0.22 });
    });
  },
  // A special trick: a quick swoop upward and two bright notes. It always rises,
  // so it can never be mistaken for the low sound of a wrong answer.
  trick() {
    tone({ freq: 523, slideTo: 1047, length: 0.2, type: 'triangle', volume: 0.2 });
    tone({ freq: 1319, start: 0.19, length: 0.12, type: 'triangle', volume: 0.2 });
    tone({ freq: 1568, start: 0.3, length: 0.3, type: 'triangle', volume: 0.22 });
  },
  unlock() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      tone({ freq, start: i * 0.11, length: 0.2, type: 'triangle', volume: 0.22 });
    });
  },
};
