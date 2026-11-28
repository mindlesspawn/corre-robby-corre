// THE LITTLE PICTURES
//
// The game's files name its small pictures with emoji ('👑', '🐶', '⭐'), because that
// is the easiest way to write them down. But an emoji is never drawn with the device's
// own emoji font: that would show Apple's artwork on an iPhone, Google's on Android and
// Microsoft's on Windows. Each one is shown as a picture file from Google's Noto Emoji,
// which comes with the game in public/art/emoji (its licence is in that folder), so the
// game looks the same everywhere.
//
// After writing a new emoji anywhere in the game, run "node scripts/fetch-emoji.mjs" to
// fetch its picture. Only if a picture is missing or fails to load does the device's own
// emoji show in its place.

// One emoji: a flag (two regional letters), or a picture with anything joined to it.
const EMOJI =
  /\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier})?(?:\u{200D}\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier})?)*/gu;

// Where an emoji's picture is. Noto Emoji names its files by the emoji's code points in
// hex, joined by "_", leaving out the "show as a picture" mark (FE0F): 👑 is emoji_u1f451.
export function emojiFile(emoji) {
  const points = [...emoji].map((char) => char.codePointAt(0)).filter((point) => point !== 0xfe0f);
  return `./art/emoji/emoji_u${points.map((point) => point.toString(16).padStart(4, '0')).join('_')}.svg`;
}

function missing(emoji) {
  if (import.meta.env?.DEV) console.warn(`No picture for ${emoji}: run "node scripts/fetch-emoji.mjs"`);
}

// An emoji as a picture, for the page. It is as big as a letter of the text around it,
// so the size of the text sets the size of the picture, as it did for the emoji itself.
export function emojiPicture(emoji) {
  const img = document.createElement('img');
  img.className = 'emoji';
  img.alt = emoji;
  img.draggable = false;
  img.decoding = 'sync'; // shown with the text it sits in, not a moment later
  // If the picture cannot be shown, the device's own emoji takes its place.
  img.addEventListener(
    'error',
    () => {
      missing(emoji);
      img.replaceWith(emoji);
    },
    { once: true },
  );
  img.src = emojiFile(emoji);
  return img;
}

// A piece of text cut into words and pictures, ready for element.append(...).
export function withPictures(text) {
  const string = String(text);
  const parts = [];
  let from = 0;
  for (const match of string.matchAll(EMOJI)) {
    if (match.index > from) parts.push(string.slice(from, match.index));
    parts.push(emojiPicture(match[0]));
    from = match.index + match[0].length;
  }
  if (from < string.length) parts.push(string.slice(from));
  return parts;
}

// Puts text into an element, with every emoji in it shown as its picture.
export function write(element, text) {
  element.replaceChildren(...withPictures(text ?? ''));
}

// --- Pictures for drawing on a canvas (the door signs) -----------------------------------

const loaded = new Map(); // emoji -> { img, state: 'loading' | 'ready' | 'failed', waiting: [] }

function load(emoji) {
  let entry = loaded.get(emoji);
  if (entry) return entry;
  entry = { img: new Image(), state: 'loading', waiting: [] };
  loaded.set(emoji, entry);
  const settle = (state) => () => {
    entry.state = state;
    if (state === 'failed') missing(emoji);
    for (const tell of entry.waiting.splice(0)) tell();
  };
  entry.img.addEventListener('load', settle('ready'), { once: true });
  entry.img.addEventListener('error', settle('failed'), { once: true });
  entry.img.src = emojiFile(emoji);
  return entry;
}

// Fetches pictures ahead of time, so they are ready before a run needs them.
export function preloadEmoji(list) {
  for (const emoji of list) load(emoji);
}

// The picture of an emoji, for drawing on a canvas. Gives { img } once the picture is
// ready, { failed: true } if it could not be loaded, and otherwise nothing yet: "later"
// is then called when it is known, so the drawing can be done again.
export function emojiImage(emoji, later) {
  const entry = load(emoji);
  if (entry.state === 'ready') return { img: entry.img };
  if (entry.state === 'failed') return { failed: true };
  if (later) entry.waiting.push(later);
  return null;
}
