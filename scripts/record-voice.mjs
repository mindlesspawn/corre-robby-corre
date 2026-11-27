// Records the game's spoken lines as audio clips, using OpenAI text-to-speech.
//
// The list of lines is built from the game's own words (src/text.js), so every clip
// matches what the game asks for, letter for letter. Clips that already exist are skipped,
// so after changing a few words you only pay for the new lines.
//
//   node scripts/record-voice.mjs --key-file "C:/path/to/.env"
//   node scripts/record-voice.mjs --language en --key-file "C:/path/to/.env"
//
// Options:
//   --language <code>  es (Spanish, the default) or en (English)
//   --key-file <path>  a file with a line OPENAI_API_KEY=...  (or set OPENAI_API_KEY yourself)
//   --limit <n>        only record the first n missing clips (for a trial run)
//   --check            also listen back: transcribe the clips and compare them with the text
//   --list             just print the lines and stop
//
// The key is only ever sent to OpenAI. It is never printed or written anywhere.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COLORS } from '../src/config.js';
import { FINGERS, ITEMS, SHAPES, THINGS } from '../src/questions.js';
import { answerText, askText, setLanguage, spokenAnswer, t } from '../src/text.js';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

const VOICE = 'coral';
const BACKUP_VOICE = 'nova';
const MODELS = ['gpt-4o-mini-tts', 'tts-1-hd', 'tts-1'];

// What changes from one language to the next.
const VOICES = {
  es: {
    // How the voice should sound. Only the newer models listen to this.
    style:
      'Habla en español de México con voz cálida, alegre y muy clara, sin prisa, ' +
      'como una maestra de preescolar que le habla con cariño a un niño de tres años.',
    // Tells the listeners what kind of sentences to expect when they check the clips.
    hint:
      'Frases cortas en español de México para niños pequeños. ' +
      'Hay cuatro flores. ¿Dónde hay tres? Uno, dos, tres. Hay diez manzanas. Aquí hay más. Busca la corona.',
    // Words the listeners may write differently from the game: number words, "+",
    // and the different ways of writing the sound "hay".
    sameWord: {
      un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
      hai: 'hay', ai: 'hay', ay: 'hay',
    },
    plus: 'mas',
  },
  en: {
    style:
      'Speak in American English with a warm, cheerful and very clear voice, unhurried, ' +
      'like a preschool teacher talking kindly to a three-year-old child.',
    hint:
      'Short sentences in English for small children. ' +
      'There are four flowers. Where are three dots? One, two, three. There are ten apples. ' +
      'This one has more. Find the crown.',
    sameWord: {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      colour: 'color',
    },
    plus: 'plus',
  },
};

const LANGUAGE = option('--language') ?? 'es';
if (!VOICES[LANGUAGE]) throw new Error(`No voice is set up for "${LANGUAGE}". Choose one of: ${Object.keys(VOICES).join(', ')}.`);
const { style: STYLE, hint: HINT, sameWord: SAME_WORD, plus: PLUS } = VOICES[LANGUAGE];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clipFolder = path.join(root, 'public', 'voice', LANGUAGE);
const listFile = path.join(root, 'src', 'voice', `${LANGUAGE}.json`);

// --- Every line the game can say in this language -----------------------------------

function allLines() {
  setLanguage(LANGUAGE);
  const lines = new Set();
  const add = (text) => text && lines.add(text);

  add(t.say.go);
  t.say.praise.forEach(add);
  add(t.say.finishZero);
  for (let n = 1; n <= 10; n++) add(t.say.finish(n));

  // Counting: things and fingers
  for (const item of [...Object.keys(ITEMS), FINGERS]) {
    add(askText({ kind: 'count', item, answer: 1 }));
    for (let n = 1; n <= 10; n++) {
      const question = { kind: 'count', item, answer: n };
      add(answerText(question));
      add(spokenAnswer(question));
      if (n <= 5) add(askText({ kind: 'same', item, answer: n }));
    }
  }

  // A number to dots, and more or fewer
  for (let n = 1; n <= 10; n++) {
    add(askText({ kind: 'find', answer: n }));
    add(answerText({ kind: 'find', answer: n }));
  }
  add(askText({ kind: 'more', answer: 1 }));
  add(askText({ kind: 'fewer', answer: 1 }));
  for (let n = 1; n <= 6; n++) {
    add(answerText({ kind: 'more', answer: n }));
    add(answerText({ kind: 'fewer', answer: n }));
  }

  // Sums up to 10. Bigger sums are left to the device's own voice.
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; a + b <= 10; b++) {
      const question = { kind: 'add', a, b, answer: a + b };
      add(askText(question));
      add(answerText(question));
    }
  }

  for (const color of Object.keys(COLORS)) {
    add(askText({ kind: 'color', answer: color }));
    add(answerText({ kind: 'color', answer: color }));
  }
  for (const thing of Object.keys(THINGS)) {
    add(askText({ kind: 'thing', answer: thing }));
    add(answerText({ kind: 'thing', answer: thing }));
  }
  for (const shape of Object.keys(SHAPES)) {
    add(askText({ kind: 'shape', answer: shape }));
    add(answerText({ kind: 'shape', answer: shape }));
  }

  return [...lines].sort((a, b) => a.localeCompare(b, LANGUAGE));
}

const clipName = (text) => `${createHash('sha1').update(`${LANGUAGE}:${text}`).digest('hex').slice(0, 12)}.mp3`;

// --- The key ------------------------------------------------------------------------

function readKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
  const keyFile = option('--key-file');
  if (!keyFile) throw new Error('No key. Pass --key-file <path to a .env file> or set OPENAI_API_KEY.');
  const line = fs
    .readFileSync(keyFile, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith('OPENAI_API_KEY='));
  const key = line?.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
  if (!key) throw new Error('That file has no OPENAI_API_KEY line.');
  return key;
}

// --- Talking to OpenAI --------------------------------------------------------------

let key = '';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, init, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${key}`, ...(init.headers ?? {}) },
    });
    if (response.ok) return response;
    const detail = (await response.text()).slice(0, 300);
    const retry = response.status === 429 || response.status >= 500;
    if (!retry || attempt >= tries) {
      const error = new Error(`OpenAI said ${response.status}: ${detail}`);
      error.status = response.status;
      throw error;
    }
    await wait(1500 * attempt);
  }
}

async function recordOne(text, model, voice) {
  const body = { model, voice, input: text, response_format: 'mp3' };
  if (model.startsWith('gpt-')) body.instructions = STYLE;
  const response = await request('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return Buffer.from(await response.arrayBuffer());
}

// Finds a model and voice this account can use, by trying one line.
async function chooseVoice(sample) {
  let lastError;
  for (const model of MODELS) {
    for (const voice of [VOICE, BACKUP_VOICE]) {
      try {
        const audio = await recordOne(sample, model, voice);
        return { model, voice, audio };
      } catch (error) {
        lastError = error;
        if (error.status === 401) throw new Error('OpenAI rejected the key (401).');
      }
    }
  }
  throw lastError;
}

// Listening back. Very short clips are easy to mishear, and the listener sometimes writes
// one language's sounds in another language's spelling, so each clip gets two listeners and
// a hint about what kind of sentences to expect.
const LISTENERS = ['gpt-4o-mini-transcribe', 'whisper-1'];

async function transcribe(file, model) {
  const form = new FormData();
  form.append('model', model);
  form.append('language', LANGUAGE);
  form.append('prompt', HINT);
  form.append('file', new Blob([fs.readFileSync(file)], { type: 'audio/mpeg' }), path.basename(file));
  const response = await request('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', body: form });
  return (await response.json()).text ?? '';
}

// Returns what was heard if no listener heard the right words, or '' if one did.
async function mishearing(text, file) {
  const heard = [];
  for (const model of LISTENERS) {
    try {
      const result = await transcribe(file, model);
      if (plain(result) === plain(text)) return '';
      heard.push(result);
    } catch (error) {
      heard.push(`(could not listen: ${error.message.slice(0, 60)})`);
    }
  }
  return heard.join('  |  ');
}

// Makes two pieces of text comparable: no accents or punctuation, number words as digits,
// "+" as its word, and words that can be written two ways treated as the same.
function plain(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\+/g, ` ${PLUS} `)
    .replace(/'/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => SAME_WORD[word] ?? word)
    .join(' ');
}

async function inBatches(items, size, work) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(work));
  }
}

// --- Main ---------------------------------------------------------------------------

const lines = allLines();
const characters = lines.reduce((sum, text) => sum + text.length, 0);
console.log(`${lines.length} lines in "${LANGUAGE}", ${characters} characters in all.`);

if (flag('--list')) {
  lines.forEach((text) => console.log(`  ${text}`));
  process.exit(0);
}

const needsKey = flag('--check') || lines.some((text) => !fs.existsSync(path.join(clipFolder, clipName(text))));
if (needsKey) key = readKey();
fs.mkdirSync(clipFolder, { recursive: true });
fs.mkdirSync(path.dirname(listFile), { recursive: true });

const limit = Number(option('--limit')) || Infinity;
const missing = lines.filter((text) => !fs.existsSync(path.join(clipFolder, clipName(text)))).slice(0, limit);
console.log(`${lines.length - lines.filter((text) => !fs.existsSync(path.join(clipFolder, clipName(text)))).length} already recorded, recording ${missing.length} now.`);

let failed = 0;
if (missing.length) {
  const first = missing[0];
  const { model, voice, audio } = await chooseVoice(first);
  fs.writeFileSync(path.join(clipFolder, clipName(first)), audio);
  console.log(`Using model "${model}" with voice "${voice}".`);

  let done = 1;
  await inBatches(missing.slice(1), 5, async (text) => {
    try {
      fs.writeFileSync(path.join(clipFolder, clipName(text)), await recordOne(text, model, voice));
    } catch (error) {
      failed += 1;
      console.log(`  could not record "${text}": ${error.message.slice(0, 120)}`);
    }
    done += 1;
    if (done % 40 === 0) console.log(`  ${done} of ${missing.length}...`);
  });
}

// The list the game reads: each line, the clip that says it, and how many seconds it lasts.
const recorded = {};
let bytes = 0;
for (const text of lines) {
  const file = path.join(clipFolder, clipName(text));
  if (!fs.existsSync(file)) continue;
  // The clips are 128 kbit/s MP3, so their size gives their length: 16,000 bytes a second.
  recorded[text] = [clipName(text), Number((fs.statSync(file).size / 16000).toFixed(2))];
  bytes += fs.statSync(file).size;
}
fs.writeFileSync(listFile, `${JSON.stringify(recorded, null, 2)}\n`);
console.log(`${Object.keys(recorded).length} of ${lines.length} lines have a clip (${(bytes / 1024 / 1024).toFixed(1)} MB). ${failed} failed.`);

// --check listens back to the clips just recorded (--check-all: to every clip).
// --fix records a clip again, up to three times, when no listener heard the right words.
if (flag('--check')) {
  const toCheck = Object.keys(recorded).filter((text) => missing.includes(text) || flag('--check-all'));
  console.log(`Listening back to ${toCheck.length} clips...`);
  let doubtful = [];
  await inBatches(toCheck, 5, async (text) => {
    const heard = await mishearing(text, path.join(clipFolder, recorded[text][0]));
    if (heard) doubtful.push({ text, heard });
  });
  console.log(`First pass: ${toCheck.length - doubtful.length} of ${toCheck.length} were heard word for word.`);

  if (flag('--fix') && doubtful.length) {
    const { model, voice } = await chooseVoice(doubtful[0].text);
    for (let round = 1; round <= 3 && doubtful.length; round++) {
      const still = [];
      await inBatches(doubtful, 5, async ({ text }) => {
        const file = path.join(clipFolder, recorded[text][0]);
        fs.writeFileSync(file, await recordOne(text, model, voice));
        const heard = await mishearing(text, file);
        if (heard) still.push({ text, heard });
      });
      console.log(`Recorded ${doubtful.length} again (round ${round}): ${doubtful.length - still.length} now heard correctly.`);
      doubtful = still;
    }
  }

  for (const { text, heard } of doubtful) console.log(`  wanted: ${text}\n  heard:  ${heard}`);
  console.log(`RESULT: ${toCheck.length - doubtful.length} of ${toCheck.length} clips heard word for word; ${doubtful.length} still in doubt.`);
}
