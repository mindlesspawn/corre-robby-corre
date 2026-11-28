// Fetches the little pictures the game shows in place of emoji.
//
// The game never draws an emoji with the device's own emoji font: that would be Apple's
// artwork on an iPhone, Google's on Android and Microsoft's on Windows. Every emoji in
// the game's files is shown as a picture from Google's Noto Emoji, which is openly
// licensed (see public/art/emoji/README.md), so the game looks the same everywhere.
//
// Run this after adding an emoji to src/questions.js, src/text.js, src/main.js or
// index.html:
//
//   node scripts/fetch-emoji.mjs
//
// It reads those files, lists every emoji in them, and downloads the pictures that are
// not yet in public/art/emoji. Pictures no longer used are listed, and removed when
// run with --prune. Nothing else is changed.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The exact release of Noto Emoji the pictures come from.
const RELEASE = 'v2026-09-24-unicode18_0';
const SOURCE = `https://raw.githubusercontent.com/googlefonts/noto-emoji/${RELEASE}`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const folder = join(root, 'public', 'art', 'emoji');

// One emoji: a flag (two regional letters), or a picture with anything joined to it.
const EMOJI =
  /\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier})?(?:\u{200D}\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier})?)*/gu;

// The same rule as src/emoji.js: the code points in hex, joined by "_", with the
// "show as a picture" mark (FE0F) left out. This is how Noto Emoji names its files.
function nameOf(emoji) {
  const points = [...emoji].map((char) => char.codePointAt(0)).filter((point) => point !== 0xfe0f);
  return `emoji_u${points.map((point) => point.toString(16).padStart(4, '0')).join('_')}`;
}

const isFlag = (name) => /^emoji_u1f1[ef][0-9a-f]_1f1[ef][0-9a-f]$/.test(name);

async function filesToRead() {
  const src = join(root, 'src');
  const scripts = (await readdir(src)).filter((file) => file.endsWith('.js')).map((file) => join(src, file));
  return [join(root, 'index.html'), ...scripts];
}

const wanted = new Map(); // file name -> the emoji it shows, for the report
for (const file of await filesToRead()) {
  const text = await readFile(file, 'utf8');
  for (const emoji of text.match(EMOJI) ?? []) wanted.set(nameOf(emoji), emoji);
}

await mkdir(folder, { recursive: true });
const have = new Set((await readdir(folder)).filter((file) => file.endsWith('.svg')).map((file) => file.slice(0, -4)));

async function download(path) {
  const response = await fetch(path.startsWith('https://') ? path : `${SOURCE}/${path}`);
  if (!response.ok) throw new Error(`${response.status} for ${path}`);
  return Buffer.from(await response.arrayBuffer());
}

let fetched = 0;
const missing = [];
for (const [name, emoji] of wanted) {
  if (have.has(name)) continue;
  const path = isFlag(name) ? `third_party/region-flags/waved-svg/${name}.svg` : `2D/svg/${name}.svg`;
  try {
    await writeFile(join(folder, `${name}.svg`), await download(path));
    fetched++;
  } catch (error) {
    missing.push(`${emoji} ${name} (${error.message})`);
  }
}

// The licences travel with the pictures (public/art/emoji/README.md says which is which).
for (const [path, file] of [
  ['2D/svg/LICENSE', 'LICENSE.txt'],
  ['https://www.apache.org/licenses/LICENSE-2.0.txt', 'LICENSE-Apache-2.0.txt'],
  ['LICENSE', 'LICENSE-OFL-1.1.txt'],
  ['third_party/region-flags/LICENSE', 'LICENSE-flags.txt'],
]) {
  if (!existsSync(join(folder, file))) await writeFile(join(folder, file), await download(path));
}

const unused = [...have].filter((name) => !wanted.has(name));
if (process.argv.includes('--prune')) for (const name of unused) await rm(join(folder, `${name}.svg`));

console.log(`${wanted.size} emoji in use, ${fetched} downloaded from Noto Emoji ${RELEASE}.`);
if (unused.length) console.log(`${process.argv.includes('--prune') ? 'Removed' : 'No longer used (run with --prune to remove)'}: ${unused.join(', ')}`);
if (missing.length) {
  console.log(`Not in Noto Emoji, so these would fall back to the device's own emoji:\n  ${missing.join('\n  ')}`);
  process.exitCode = 1;
}
