// The spoken voice. It uses the voice built into the phone, tablet, or computer,
// so there are no recordings to make. If the device has no voice for the chosen
// language, the game stays quiet and says so on the start screen.

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
  if (value) synth()?.cancel();
}

export function stopSpeaking() {
  synth()?.cancel();
}

// Whether this device can speak the chosen language:
//   'ok'           it has a voice for it
//   'loading'      the list of voices has not arrived yet (it probably can)
//   'none'         it has voices, but none for this language
//   'unsupported'  the browser cannot speak at all
export function voiceState() {
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

// Says something. Normally it interrupts whatever is being said.
// With { queue: true } it waits its turn, unless a line is already waiting.
export function speak(text, { queue = false } = {}) {
  const engine = synth();
  if (!engine || !text || !canSpeak()) return;

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
