// Trims the quiet from the start and the end of the recorded voice clips.
//
// The text-to-speech service often leaves a second or two of near silence after a line,
// and up to a second before it. The game waits for a clip to end before it moves on, so
// that dead air shows up as a pause where nothing happens. This cuts each clip back to a
// short, even margin: at most 0.2 seconds before the voice and 0.5 seconds after it.
// Clips that are already that tight are left alone.
//
//   node scripts/trim-voice.mjs --language en          trim the English clips
//   node scripts/trim-voice.mjs --language en --dry    only report what would be cut
//
// Afterwards run the recorder once more (it needs no key when every line has a clip), so
// the lengths in src/voice/<language>.json match the files:
//
//   node scripts/record-voice.mjs --language en
//
// How it works. An MP3 file is a row of small frames, each a fixed slice of time, and a
// file may be cut between frames without decoding it. Every frame says how loud it is
// (its "global gain"). In these clips the quiet between words sits around 115 and speech
// around 130 to 157, with very little in between, so a frame at 124 or more counts as
// voice. Nothing inside the voice is ever cut: only whole frames before the first voiced
// frame and after the last one.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const language = option('--language') ?? 'es';
const dry = args.includes('--dry');

const VOICED = 124; // a frame this loud or louder is voice
const EMPTY = 210; // the gain an encoder writes for a frame with nothing in it
const KEEP_BEFORE = 0.2; // seconds of quiet kept before the voice
const KEEP_AFTER = 0.5; // seconds of quiet kept after it

const BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

// Reads the frames of an MP3 file. Returns null if the file is not laid out the simple way
// this script expects (frames from the first byte to the last, nothing else), so that such
// a file is left untouched instead of being damaged.
function readFrames(data) {
  const list = [];
  let at = 0;
  while (at < data.length) {
    if (at + 4 > data.length || data[at] !== 0xff || (data[at + 1] & 0xe0) !== 0xe0) return null;
    const version = (data[at + 1] >> 3) & 3; // 3 is MPEG 1, 2 is MPEG 2, 0 is MPEG 2.5
    const layer = (data[at + 1] >> 1) & 3; // 1 is layer III
    const checksum = (data[at + 1] & 1) === 0;
    const bitrate = BITRATES[version === 3 ? 1 : 2][data[at + 2] >> 4];
    const rate = RATES[version]?.[(data[at + 2] >> 2) & 3];
    const padding = (data[at + 2] >> 1) & 1;
    const mono = data[at + 3] >> 6 === 3;
    if (layer !== 1 || !bitrate || !rate) return null;
    const samples = version === 3 ? 1152 : 576;
    const size = Math.floor(((samples / 8) * bitrate * 1000) / rate) + padding;
    if (at + size > data.length) return null;

    // The loudness of the frame: the largest global gain among its parts.
    let bit = (at + 4 + (checksum ? 2 : 0)) * 8 + (version === 3 ? (mono ? 18 : 20) : mono ? 9 : 10);
    const read = (count) => {
      let value = 0;
      for (let i = 0; i < count; i++, bit++) value = (value << 1) | ((data[bit >> 3] >> (7 - (bit & 7))) & 1);
      return value;
    };
    let gain = 0;
    const parts = (version === 3 ? 2 : 1) * (mono ? 1 : 2);
    for (let part = 0; part < parts; part++) {
      bit += 21; // the two numbers before the gain
      gain = Math.max(gain, read(8));
      bit += version === 3 ? 30 : 34; // the rest of this part
    }
    list.push({ at, size, seconds: samples / rate, gain });
    at += size;
  }
  return list;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = path.join(root, 'public', 'voice', language);
const names = fs.readdirSync(folder).filter((name) => name.endsWith('.mp3'));

let trimmed = 0;
let skipped = 0;
let before = 0;
let after = 0;
for (const name of names) {
  const file = path.join(folder, name);
  const data = fs.readFileSync(file);
  const frames = readFrames(data);
  const voiced = (frame) => frame.gain >= VOICED && frame.gain !== EMPTY;
  const first = frames?.findIndex(voiced) ?? -1;
  if (first < 0) {
    skipped += 1;
    console.log(`  left alone (${frames ? 'no voice found' : 'unexpected layout'}): ${name}`);
    continue;
  }
  const last = frames.findLastIndex(voiced);
  const each = frames[0].seconds;
  const from = Math.max(0, first - Math.round(KEEP_BEFORE / each));
  const to = Math.min(frames.length, last + 1 + Math.round(KEEP_AFTER / each));
  before += frames.length * each;
  after += (to - from) * each;
  if (from === 0 && to === frames.length) continue;
  trimmed += 1;
  if (!dry) fs.writeFileSync(file, data.subarray(frames[from].at, to < frames.length ? frames[to].at : data.length));
}

console.log(
  `${names.length} clips in "${language}": ${trimmed} ${dry ? 'would be' : 'were'} trimmed, ${skipped} left alone. ` +
    `${before.toFixed(0)} seconds ${dry ? 'would become' : 'became'} ${after.toFixed(0)}.`,
);
