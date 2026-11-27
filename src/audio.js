// Sound effects made from simple tones, so there are no sound files to load.
// iOS only allows sound after the first touch, so unlockAudio() is called on every tap.

let ctx = null;
let muted = false;

// iPhones and iPads silence "game" sound when the switch on the side is set to silent.
// Music and video are not silenced by it, so the game asks for that kind of sound.
let mediaSound = false;
let silence = null;

function useMediaSound() {
  if (mediaSound) return;
  mediaSound = true;
  try {
    // Newer iPhones and iPads let a page say what kind of sound it makes.
    if (navigator.audioSession) {
      navigator.audioSession.type = 'playback';
      return;
    }
  } catch {
    // Not allowed here; try the older way below.
  }
  // Older ones: quietly play a silent sound as ordinary media, which has the same effect.
  const apple =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!apple) return;
  try {
    if (!silence) {
      // A quarter of a second of silence, built here so there is no extra file to load.
      const samples = 2000;
      const wav = new DataView(new ArrayBuffer(44 + samples));
      const text = (at, word) => [...word].forEach((letter, i) => wav.setUint8(at + i, letter.charCodeAt(0)));
      text(0, 'RIFF');
      wav.setUint32(4, 36 + samples, true);
      text(8, 'WAVEfmt ');
      wav.setUint32(16, 16, true);
      wav.setUint16(20, 1, true); // plain sound
      wav.setUint16(22, 1, true); // one channel
      wav.setUint32(24, 8000, true); // samples a second
      wav.setUint32(28, 8000, true);
      wav.setUint16(32, 1, true);
      wav.setUint16(34, 8, true); // 8 bits each
      text(36, 'data');
      wav.setUint32(40, samples, true);
      for (let i = 0; i < samples; i++) wav.setUint8(44 + i, 128); // 128 is silence
      silence = new Audio(URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })));
      silence.loop = true;
      silence.setAttribute('playsinline', '');
    }
    // This only works inside a touch, so if it is refused, try again on the next one.
    silence.play().catch(() => {
      mediaSound = false;
    });
  } catch {
    mediaSound = false;
  }
}

export function unlockAudio() {
  useMediaSound();
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

// The music (src/music.js) plays through the same sound system.
export function audioContext() {
  return ctx;
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
let starting = 0; // clips that have been asked for but have not begun yet

// True while a clip is being said, is waiting its turn, or is about to start.
export function voiceBusy() {
  return Boolean(playing || waiting || starting > 0);
}

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

function startClip(url, mine, onFail) {
  starting += 1;
  loadClip(url)
    .finally(() => {
      starting -= 1;
    })
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
          startClip(next.url, request, next.onFail);
        }
      };
      playing = source;
      source.start();
    })
    .catch(() => {
      // The clip could not be fetched or understood (no internet, perhaps).
      if (mine === request) onFail?.();
    });
}

// Plays a clip. Normally it cuts off whatever is being said; with { queue: true } it waits
// for that to finish. Returns false if sound is not available yet (before the first touch).
// onFail is called if the clip turns out not to be playable.
export function playVoiceClip(url, { queue = false, onFail } = {}) {
  if (muted || !ctx) return false;
  if (queue && playing) {
    waiting = { url, onFail };
    loadClip(url).catch(() => {});
    return true;
  }
  stopVoiceClip();
  startClip(url, request, onFail);
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
