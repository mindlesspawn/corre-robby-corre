// The spoken voice. It uses the voice built into the phone, tablet, or computer,
// so there are no recordings to make. If the device has no voice for the chosen
// language, the game simply stays quiet.

const PREFERRED = {
  es: ['es-MX', 'es-US', 'es-419', 'es-ES'],
  en: ['en-US', 'en-GB'],
};

let language = 'es';
let muted = false;
let voice = null;

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);
const tidy = (code) => String(code).replace('_', '-').toLowerCase();

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

export function setSpeechLanguage(code) {
  language = code;
  pickVoice();
}

export function setSpeechMuted(value) {
  muted = value;
  if (value) synth()?.cancel();
}

export function stopSpeaking() {
  synth()?.cancel();
}

// True when the game can actually say things out loud right now.
export function canSpeak() {
  const engine = synth();
  if (!engine || muted) return false;
  if (!voice) pickVoice();
  // No voice list yet (still loading) counts as "probably"; a list without our language does not.
  return Boolean(voice) || engine.getVoices().length === 0;
}

// Says something. Normally it interrupts whatever is being said.
// With { queue: true } it waits its turn, unless a line is already waiting.
export function speak(text, { queue = false } = {}) {
  const engine = synth();
  if (!engine || !text || !canSpeak()) return;
  if (!queue || engine.pending) engine.cancel();

  const line = new SpeechSynthesisUtterance(text);
  line.lang = voice?.lang ?? PREFERRED[language]?.[0] ?? language;
  if (voice) line.voice = voice;
  line.rate = 0.9; // a little slower, for small listeners
  line.pitch = 1.15;
  try {
    engine.speak(line);
  } catch {
    // Some browsers refuse speech before the first touch. The next line will work.
  }
}
