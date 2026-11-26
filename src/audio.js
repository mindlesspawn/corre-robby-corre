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
