// The spoken voice.
//
// The lines are recorded clips (public/voice/es and public/voice/en), so the game says the
// same thing in the same voice on every device. They are made by scripts/record-voice.mjs.
// Anything without a clip (very large sums) falls back to the voice built into the phone,
// tablet, or computer. If the device has no voice for that language either, the game stays
// quiet for those lines.

import { playVoiceClip, preloadVoiceClip, stopVoiceClip, voiceBusy } from './audio.js';
import englishClips from './voice/en.json';
import spanishClips from './voice/es.json';

// Which recorded clip says each line, and how long it lasts: { language: { 'the line': ['file.mp3', seconds] } }
const CLIPS = { es: spanishClips, en: englishClips };

const PREFERRED = {
  es: ['es-MX', 'es-US', 'es-419', 'es-ES'],
  en: ['en-US', 'en-GB'],
};

let language = 'es';
let muted = false;
let voice = null;
let current = null; // holds on to the line being said; some browsers drop it otherwise

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);
const tidy = (code) => String(code).replace('_', '-').toLowerCase();

function clipFor(text) {
  const clip = CLIPS[language]?.[text];
  return clip ? `./voice/${language}/${clip[0]}` : null;
}

// Roughly how many seconds a line takes to say. 0 if the game cannot say it.
export function speechSeconds(text) {
  if (!text || muted) return 0;
  const clip = CLIPS[language]?.[text];
  if (clip) return clip[1];
  const state = voiceState();
  return state === 'ok' || state === 'loading' ? 0.5 + text.length * 0.085 : 0;
}

// True while the game is talking.
export function isSpeaking() {
  if (voiceBusy()) return true;
  const engine = synth();
  return Boolean(engine && (engine.speaking || engine.pending));
}

// True when this language has recorded clips.
export function hasRecordedVoice() {
  return Object.keys(CLIPS[language] ?? {}).length > 0;
}

function pickVoice() {
  const engine = synth();
  if (!engine) return;
  const wanted = PREFERRED[language] ?? [language];
  const rank = (v) => {
    const place = wanted.findIndex((code) => tidy(code) === tidy(v.lang));
    return place === -1 ? wanted.length : place;
  };
  const matches = engine.getVoices().filter((v) => tidy(v.lang).startsWith(language));
  matches.sort((a, b) => rank(a) - rank(b));
  voice = matches[0] ?? null;
}

// Voices load a moment after the page does, so pick again when they arrive.
synth()?.addEventListener?.('voiceschanged', pickVoice);

// Runs a function each time the list of voices changes (it arrives late on some devices).
export function onVoicesChanged(callback) {
  synth()?.addEventListener?.('voiceschanged', () => {
    pickVoice();
    callback();
  });
}

export function setSpeechLanguage(code) {
  language = code;
  pickVoice();
}

export function setSpeechMuted(value) {
  muted = value;
  if (value) stopSpeaking();
}

export function stopSpeaking() {
  stopVoiceClip();
  synth()?.cancel();
}

// Whether the game can speak the chosen language on this device:
//   'ok'           it has recorded clips, or the device has a voice for it
//   'loading'      the device's list of voices has not arrived yet (it probably can)
//   'none'         the device has voices, but none for this language
//   'unsupported'  the browser cannot speak at all
export function voiceState() {
  if (hasRecordedVoice()) return 'ok';
  const engine = synth();
  if (!engine) return 'unsupported';
  if (!voice) pickVoice();
  if (voice) return 'ok';
  return engine.getVoices().length === 0 ? 'loading' : 'none';
}

// True when the game can actually say things out loud right now.
export function canSpeak() {
  const state = voiceState();
  return !muted && (state === 'ok' || state === 'loading');
}

// Fetches clips ahead of time, so they start without a pause when they are needed.
export function preloadSpeech(lines) {
  for (const text of lines) {
    const clip = clipFor(text);
    if (clip) preloadVoiceClip(clip);
  }
}

// The device's own voice, for lines that have no clip.
function speakWithDevice(text, queue) {
  const engine = synth();
  if (!engine) return;
  if (!voice) pickVoice();
  // Never read one language aloud with another language's voice.
  if (!voice && engine.getVoices().length > 0) return;

  const line = new SpeechSynthesisUtterance(text);
  line.lang = voice?.lang ?? PREFERRED[language]?.[0] ?? language;
  if (voice) line.voice = voice;
  line.rate = 0.9; // a little slower, for small listeners
  line.pitch = 1.15;
  current = line;

  const say = () => {
    if (muted || current !== line) return;
    try {
      engine.resume?.(); // iPhones can leave the voice paused after switching apps
      engine.speak(line);
    } catch {
      // Some browsers refuse speech before the first touch. The next line will work.
    }
  };

  const busy = engine.speaking || engine.pending;
  if (!busy || (queue && !engine.pending)) {
    // Nothing to interrupt (or happy to wait): say it straight away. Saying it inside
    // the tap is what unlocks the voice on iPhones and iPads.
    say();
    return;
  }
  // Interrupt. Some browsers lose a line spoken straight after a cancel, so wait a beat.
  engine.cancel();
  setTimeout(say, 80);
}

// Says something. Normally it interrupts whatever is being said.
// With { queue: true } it waits for the line being said to finish.
export function speak(text, { queue = false } = {}) {
  if (!text || muted) return;

  const clip = clipFor(text);
  // If the clip cannot be played after all, the device's own voice says the line instead.
  if (clip && playVoiceClip(clip, { queue, onFail: () => speakWithDevice(text, queue) })) {
    synth()?.cancel();
    return;
  }

  if (!queue) stopVoiceClip();
  speakWithDevice(text, queue);
}
