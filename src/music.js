// A quiet tune that loops under the game: a marimba melody, a classical guitar picking
// the chords, and light percussion. It is made here from simple sounds, so there is no
// music file to load, and it joins end to start without a gap.
//
// It stays well below the voice, and dips further while the voice is talking.
// To change the tune, edit SONG below.

import { audioContext } from './audio.js';
import { isSpeaking } from './speech.js';

const TEMPO = 96; // beats a minute
// How loud the music is. It is kept far in the background: at 0.025 it measures less than
// a tenth as loud as the recorded voice. Raise it a little at a time.
const LEVEL = 0.025;
const WHILE_TALKING = 0.25; // the music drops to this share of LEVEL while the voice talks
const FASTEST = 1.9; // the most the tune can speed up (in an endless run)

// Guitar chords: the low string, three higher strings, and a second low string.
// Numbers are piano keys: 60 is middle C, and each step is one key up.
const CHORDS = {
  C: [48, 55, 60, 64, 43],
  Am: [45, 57, 60, 64, 52],
  F: [41, 57, 60, 65, 48],
  G: [43, 55, 59, 62, 50],
  Dm: [50, 57, 62, 65, 45],
};

// The order the guitar picks a chord's strings in, eight notes to a bar.
const PICKING = [
  [0, 1, 2, 3, 4, 1, 2, 3],
  [0, 1, 3, 2, 4, 1, 3, 2],
];

// The tune, one line per bar: the chord, the marimba's eight notes ("." is a rest),
// which picking pattern the guitar uses, and whether the soft drum plays.
const SONG = [
  ['C', '64 . 67 . 64 . 60 .', 0, false],
  ['Am', '69 . 67 . 64 . . .', 0, false],
  ['F', '65 . 69 . 67 . 65 .', 0, false],
  ['G', '62 . . . 67 . . .', 0, false],
  ['C', '64 . 67 . 72 . 67 .', 0, true],
  ['Am', '69 . 67 . 64 . 60 .', 0, true],
  ['Dm', '62 . 65 . 64 . 62 .', 0, true],
  ['G', '67 . . . 62 . 59 .', 0, true],
  ['F', '69 69 . 65 . 69 . .', 1, true],
  ['C', '67 67 . 64 . 67 . .', 1, true],
  ['G', '62 . 67 . 71 . 67 .', 1, true],
  ['Am', '69 . . . 64 . 60 .', 1, true],
  ['F', '65 . 69 . 72 . 69 .', 1, true],
  ['C', '67 . 64 . 60 . 64 .', 1, true],
  ['G', '62 64 65 . 62 . 59 .', 1, true],
  ['C', '60 . . . 72 . . .', 1, true],
].map(([chord, melody, picking, drum]) => ({
  chord: CHORDS[chord],
  melody: melody.split(' ').map((note) => (note === '.' ? 0 : Number(note))),
  picking: PICKING[picking],
  drum,
}));

const STEPS_PER_BAR = 8;
export const SONG_STEPS = SONG.length * STEPS_PER_BAR;

const pitch = (key) => 440 * 2 ** ((key - 69) / 12);

// --- The instruments ------------------------------------------------------------------

// Marimba: a pure note with a short bright ring on top, fading quickly like a struck bar.
function marimba(ctx, out, key, when, loud) {
  const freq = pitch(key);
  const ring = Math.max(0.3, 0.75 - (key - 60) * 0.014);
  for (const [times, share, lasts] of [
    [1, 1, ring],
    [4, 0.1, 0.12],
  ]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq * times;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(loud * share, when + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + lasts);
    osc.connect(gain).connect(out);
    osc.start(when);
    osc.stop(when + lasts + 0.02);
  }
}

// Classical guitar: each note is worked out once as a plucked nylon string (a burst of
// soft noise going round and round a loop the length of the string) and then kept.
const plucks = new Map();

function pluck(ctx, key) {
  const id = `${ctx.sampleRate}:${key}`;
  if (plucks.has(id)) return plucks.get(id);
  const rate = ctx.sampleRate;
  const loop = Math.max(2, Math.round(rate / pitch(key) - 0.5));
  const length = Math.floor(rate * 1.5);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  // The pluck itself: noise with the harsh edge taken off, as a fingertip does.
  let soft = 0;
  for (let i = 0; i < loop; i++) {
    soft += 0.2 * (Math.random() * 2 - 1 - soft);
    data[i] = soft;
  }
  let peak = 0;
  for (let i = 0; i < loop; i++) peak = Math.max(peak, Math.abs(data[i]));
  for (let i = 0; i < loop; i++) data[i] /= peak || 1;
  // The string ringing and dying away.
  data[loop] = 0.996 * 0.5 * data[0];
  for (let i = loop + 1; i < length; i++) data[i] = 0.996 * 0.5 * (data[i - loop] + data[i - loop - 1]);
  // Fade the very end, so a long low note does not stop with a click.
  const fade = Math.floor(rate * 0.1);
  for (let i = 0; i < fade; i++) data[length - 1 - i] *= i / fade;
  plucks.set(id, buffer);
  return buffer;
}

function guitar(ctx, out, key, when, loud) {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = pluck(ctx, key);
  // Each note eases in over a moment, so the guitar strums along gently and does not jab.
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(loud, when + 0.012);
  source.connect(gain).connect(out);
  source.start(when);
}

// Shaker: a tiny hiss.
const hisses = new Map();

function shaker(ctx, out, when, loud) {
  if (!hisses.has(ctx.sampleRate)) {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    hisses.set(ctx.sampleRate, buffer);
  }
  const source = ctx.createBufferSource();
  const bright = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = hisses.get(ctx.sampleRate);
  bright.type = 'highpass';
  bright.frequency.value = 4500;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(loud, when + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.07);
  source.connect(bright).connect(gain).connect(out);
  source.start(when);
  source.stop(when + 0.1);
}

// A soft hand drum, and a gentle wooden "tok". Both are pitched high enough for a phone's small speaker.
function thump(ctx, out, when, loud, from, to, lasts) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(from, when);
  osc.frequency.exponentialRampToValueAtTime(to, when + lasts * 0.7);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(loud, when + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + lasts);
  osc.connect(gain).connect(out);
  osc.start(when);
  osc.stop(when + lasts + 0.02);
}

// Plays everything that happens on one step of the tune (a step is half a beat).
export function playStep(ctx, out, step, when) {
  const bar = SONG[Math.floor(step / STEPS_PER_BAR) % SONG.length];
  const at = step % STEPS_PER_BAR;
  const onBeat = at % 2 === 0;

  if (bar.melody[at]) marimba(ctx, out, bar.melody[at], when, at === 0 ? 0.55 : 0.45);

  const string = bar.picking[at];
  const low = string === 0 || string === 4;
  guitar(ctx, out, bar.chord[string], when, low ? 0.16 : 0.12);

  shaker(ctx, out, when, onBeat ? 0.04 : 0.07);
  if (bar.drum) {
    if (at === 0 || at === 4) thump(ctx, out, when, 0.32, 210, 140, 0.16);
    if (at === 2 || at === 6) thump(ctx, out, when, 0.1, 760, 700, 0.06);
  }
}

// --- Playing it ---------------------------------------------------------------------------

const AHEAD = 0.25; // notes are lined up this many seconds before they sound
let wanted = false; // the music should be playing
let timer = null;
let out = null; // the music's own volume control
let outFor = null;
let step = 0;
let nextTime = 0;
let speed = 1;

function tick() {
  const ctx = audioContext();
  if (!ctx || ctx.state !== 'running') return;
  if (outFor !== ctx) {
    out = ctx.createGain();
    out.gain.value = 0.0001;
    // Everything goes through a filter that takes the sharp edge off, so it sits in the background.
    const mellow = ctx.createBiquadFilter();
    mellow.type = 'lowpass';
    mellow.frequency.value = 3200;
    out.connect(mellow).connect(ctx.destination);
    outFor = ctx;
  }
  out.gain.setTargetAtTime(LEVEL * (isSpeaking() ? WHILE_TALKING : 1), ctx.currentTime, 0.15);
  // After a pause (the game was in the background, say), carry on from now.
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.06;
  while (nextTime < ctx.currentTime + AHEAD) {
    playStep(ctx, out, step, nextTime);
    nextTime += 60 / (TEMPO * speed) / 2;
    step = (step + 1) % SONG_STEPS;
  }
}

function start() {
  if (timer || !wanted || document.hidden) return;
  timer = setInterval(tick, 50);
  tick();
}

function stop() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  const ctx = audioContext();
  if (out && ctx && outFor === ctx) out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
}

// Turns the music on or off.
export function setMusic(on) {
  wanted = on === true;
  if (wanted) start();
  else stop();
}

// Sound only starts after a touch, so this is called on every one.
export function wakeMusic() {
  start();
}

// 1 is the normal speed. An endless run turns it up as the belt gets faster.
export function setMusicSpeed(times) {
  speed = Math.min(FASTEST, Math.max(1, times || 1));
}

// Quiet while the game is in the background.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else start();
});
