// The ElevenLabs recording is bundled with the game, so playback never contacts
// ElevenLabs. See public/music/README.md for the musical brief and source.
// A media element streams the long track without decoding it all into phone memory.

import { audioContext, audioOutput } from './audio.js';
import { AUDIO_DEFAULTS } from './audio-settings.js';
import { isSpeaking } from './speech.js';
import * as fallback from './music-fallback.js';

const TRACK = './music/sunny-steps.mp3';
const LOUDEST = 0.5; // the recording is mastered to -20 LUFS before this control
const WHILE_TALKING = 0.2;
const FASTEST = 1.18; // a little more momentum, with the original pitch preserved

let wanted = false;
let volume = AUDIO_DEFAULTS.musicVolume;
let speed = 1;
let player = null;
let out = null;
let timer = null;
let starting = false;
let usingFallback = false;

function shouldPlay() {
  return wanted && volume > 0 && !document.hidden;
}

function useFallback() {
  usingFallback = true;
  player?.pause();
  if (timer !== null) clearInterval(timer);
  timer = null;
  fallback.setMusicVolume(volume);
  fallback.setMusicSpeed(speed);
  fallback.setMusic(shouldPlay());
}

function tick() {
  const ctx = audioContext();
  if (!out || !ctx || ctx.state !== 'running') return;
  const speaking = isSpeaking();
  const level = shouldPlay() ? LOUDEST * volume ** 2 * (speaking ? WHILE_TALKING : 1) : 0;
  // Duck promptly for a question, then recover slowly so each word does not pump.
  out.gain.setTargetAtTime(level, ctx.currentTime, speaking ? 0.06 : 0.35);
  // Ease tempo changes rather than jumping when a correct answer speeds up the belt.
  if (player && Math.abs(player.playbackRate - speed) > 0.001) {
    player.playbackRate += (speed - player.playbackRate) * 0.12;
  }
}

function prepare(ctx) {
  if (player) return;
  player = new Audio();
  player.preload = 'none';
  player.loop = true;
  player.preservesPitch = true;
  player.webkitPreservesPitch = true;
  player.setAttribute('playsinline', '');
  player.playbackRate = speed;
  out = ctx.createGain();
  out.gain.value = 0;
  ctx.createMediaElementSource(player).connect(out).connect(audioOutput());
  player.addEventListener('error', useFallback);
  player.src = TRACK;
}

function start() {
  if (!shouldPlay()) return;
  if (usingFallback) {
    fallback.setMusic(true);
    return;
  }
  const ctx = audioContext();
  if (!ctx) return; // wait for the game's first touch to unlock audio
  try {
    prepare(ctx);
    if (timer === null) timer = setInterval(tick, 50);
    tick();
    if (!player.paused || starting) return;
    starting = true;
    // Call play inside the gesture even if the shared context is still resuming.
    player.play().then(() => {
      if (!shouldPlay() || usingFallback) player.pause();
    }).catch((error) => {
      // A blocked gesture or a pause during loading can be retried on the next tap.
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') useFallback();
    }).finally(() => { starting = false; });
  } catch {
    starting = false;
    useFallback();
  }
}

function stop() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  player?.pause(); // retain the position, including when switching apps
  const ctx = audioContext();
  if (out && ctx) {
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setValueAtTime(0, ctx.currentTime);
  }
  fallback.setMusic(false);
}

export function setMusic(on) {
  wanted = on === true;
  if (shouldPlay()) start();
  else stop();
}

export function setMusicVolume(value) {
  volume = Math.min(1, Math.max(0, Number(value) || 0));
  fallback.setMusicVolume(volume);
  if (!shouldPlay()) stop();
  else start();
}

export function wakeMusic() {
  start();
}

export function setMusicSpeed(times) {
  const pace = Math.min(1.9, Math.max(1, Number(times) || 1));
  speed = 1 + ((pace - 1) / 0.9) * (FASTEST - 1);
  fallback.setMusicSpeed(speed);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else start();
});
