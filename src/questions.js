// THE GAMES AND THEIR LEVELS
//
// GAMES lists each game the player can pick on the start screen. For every age (3, 4, 5,
// and 6 for six and older) a game has ten levels, easiest first. A level is one run of
// doors. Getting enough of them right (clearAt in config.js) clears the level and opens
// the next one, and each level adds a little: one more color, a bigger number, a harder
// pattern. What each age is given follows early-childhood sources, listed in the README.
//
// Kinds of question:
//   same     the banner shows a few things; find the door with the same number of dots
//   count    the banner shows a few things; find the door with the number that says how many
//   find     the banner shows a number; find the door with that many dots
//   more     find the door with the most dots ("fewer": the door with the least).
//            A "compare" level asks one or the other at random.
//   after    the banner counts 3, 4, 5 ... ; find the door with the number that comes next
//   add      the banner shows a sum; find the door with the answer
//   color    the banner shows or says a color; find the door of that color
//   thing    the banner shows or names a thing (a crown, a castle...); find its picture
//   shape    the banner shows or names a shape; find the door with that shape
//   pattern  the banner shows a repeating row (red, blue, red, blue...); find what comes next
//   mix      one of several kinds above, picked afresh for each question (a review level)
//
// To change a level, edit its line in the game's plan for that age.
// To add a game, add an entry to GAMES and its name to src/text.js.
// To add a new kind of question, add a maker below, then teach src/main.js how to show it
// and src/text.js how to say it.

import { CONFIG } from './config.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// The age groups on the start screen. 6 means six and older.
export const AGES = [3, 4, 5, 6];

// How many levels each game has for each age.
export const LEVELS = 10;

// --- What the games are made of ---------------------------------------------------------

// The colors, in the order they are brought in. Their looks are in src/config.js and
// their names in src/text.js.
const COLOR_IDS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown', 'black', 'white'];
// Colors that are easy to mix up, for the hardest listening levels.
const WARM = ['red', 'orange', 'pink'];
const COOL = ['blue', 'purple', 'green'];
const DARK = ['brown', 'black', 'purple'];
const LIGHT = ['white', 'yellow', 'pink'];

// Princess things, shown as little pictures. Their names in each language are in src/text.js.
export const THINGS = {
  crown: '👑',
  castle: '🏰',
  unicorn: '🦄',
  dress: '👗',
  ring: '💍',
  wand: '🪄',
  shoe: '👠',
  rose: '🌹',
  frog: '🐸',
  gem: '💎',
  fairy: '🧚',
  dragon: '🐉',
  key: '🔑',
};
const THING_IDS = Object.keys(THINGS);

// Shapes, as outlines inside a 100 x 100 box. Their names are in src/text.js.
const starPoints = Array.from({ length: 10 }, (_, i) => {
  const radius = i % 2 ? 19 : 46;
  const angle = ((-90 + i * 36) * Math.PI) / 180;
  return `${(50 + radius * Math.cos(angle)).toFixed(1)} ${(53 + radius * Math.sin(angle)).toFixed(1)}`;
});
export const SHAPES = {
  circle: 'M50 6a44 44 0 1 0 0.01 0z',
  square: 'M10 10h80v80h-80z',
  triangle: 'M50 8L95 90H5z',
  star: `M${starPoints.join('L')}z`,
  heart: 'M50 90C20 68 6 50 6 32a22.3 22.3 0 0 1 44-6a22.3 22.3 0 0 1 44 6c0 18-14 36-44 58z',
  rectangle: 'M5 27h90v46h-90z',
  oval: 'M4 50a46 29 0 1 0 92 0a46 29 0 1 0 -92 0z',
  diamond: 'M50 5L86 50L50 95L14 50z',
  hexagon: 'M95 50L72.5 89L27.5 89L5 50L27.5 11L72.5 11z',
};
const SHAPE_IDS = Object.keys(SHAPES);
// Shapes that are easy to mix up.
const ROUND = ['circle', 'oval', 'hexagon'];
const BOXY = ['square', 'rectangle', 'diamond'];

// --- Short ways to write a level --------------------------------------------------------

const same = (max) => ({ kind: 'same', max });
const find = (max) => ({ kind: 'find', max });
const more = (max, gap) => ({ kind: 'more', max, gap });
const fewer = (max, gap) => ({ kind: 'fewer', max, gap });
const compare = (max, gap) => ({ kind: 'compare', max, gap }); // gap: how far ahead the right door is
const count = (max, doors) => ({ kind: 'count', max, doors }); // doors 'both': numbers with their dots
const after = (max) => ({ kind: 'after', max });
const add = (maxSum, how = {}) => ({ kind: 'add', maxSum, ...how });
const withPictures = { pictures: true };

// "see" shows the color, thing or shape and says its name: the child matches what they see.
// "hear" only says the name: the child has to know it. The number is how many are in play.
const colors = (n) => COLOR_IDS.slice(0, n);
const seeColors = (n) => ({ kind: 'color', colors: colors(n), show: true });
const hearColors = (n) => ({ kind: 'color', colors: Array.isArray(n) ? n : colors(n), show: false });
const seeThings = (n) => ({ kind: 'thing', pool: THING_IDS.slice(0, n), show: true });
const hearThings = (n) => ({ kind: 'thing', pool: THING_IDS.slice(0, n), show: false });
const seeShapes = (n) => ({ kind: 'shape', pool: SHAPE_IDS.slice(0, n), show: true });
const hearShapes = (n) => ({ kind: 'shape', pool: Array.isArray(n) ? n : SHAPE_IDS.slice(0, n), show: false });

// A repeating row. The letters say how it repeats: AB is red, blue, red, blue;
// AAB is red, red, blue, red, red, blue. The number is how many colors or shapes it draws from.
const colorRow = (unit, n) => ({ kind: 'pattern', unit, of: 'colors', pool: colors(n) });
const shapeRow = (unit, n) => ({ kind: 'pattern', unit, of: 'shapes', pool: SHAPE_IDS.slice(0, n) });

const mix = (...of) => ({ kind: 'mix', of });

// --- The games --------------------------------------------------------------------------

export const GAMES = {
  // The order follows early-childhood teaching guidance (sources are in the README):
  // small amounts by sight first, then comparing, and written numbers only after that,
  // arriving together with their dots. Sums stay small and are shown with pictures.
  numbers: {
    icon: '🔢',
    plans: {
      // Amounts up to 3 seen at a glance, and more and fewer with very different amounts.
      3: [
        same(3),
        more(5, 2),
        find(3),
        mix(same(3), find(3)),
        more(6, 3),
        fewer(6, 3),
        compare(6, 3),
        same(4),
        find(4),
        mix(same(4), find(4), compare(6, 3)),
      ],
      // Amounts up to 5, close amounts, and written numbers up to 5, first with their dots.
      4: [
        same(5),
        find(5),
        compare(5, 2),
        compare(5, 1),
        count(3, 'both'),
        count(5, 'both'),
        mix(count(5, 'both'), find(5)),
        count(5),
        compare(6, 1),
        mix(count(5), compare(6, 1), same(5)),
      ],
      // Counting to 10, what number comes next, bigger amounts, and sums shown with pictures.
      5: [
        count(6),
        count(8),
        count(10),
        after(5),
        after(10),
        compare(10, 2),
        add(5, { oneMore: true, pictures: true }), // 2 + 1, shown with apples
        add(5, withPictures),
        add(10, withPictures),
        mix(count(10), after(10), add(10, withPictures)),
      ],
      // Sums written only as numbers, up to two digits.
      6: [
        add(5),
        add(10),
        mix(add(10), after(10)),
        add(15),
        add(20),
        add(30, { bigFirst: true }), // 23 + 4
        add(50, { bigFirst: true }),
        add(99, { bigFirst: true }),
        add(60, { twoDigit: true }), // 23 + 15
        add(99, { twoDigit: true }),
      ],
    },
  },

  colors: {
    icon: '🎨',
    plans: {
      3: [
        seeColors(3),
        seeColors(4),
        seeColors(5),
        seeColors(6),
        seeColors(7),
        hearColors(3),
        mix(seeColors(7), hearColors(3)),
        hearColors(4),
        mix(seeColors(7), hearColors(4)),
        hearColors(5),
      ],
      4: [
        seeColors(7),
        hearColors(3),
        hearColors(4),
        hearColors(5),
        hearColors(6),
        mix(seeColors(7), hearColors(6)),
        hearColors(7),
        hearColors(WARM),
        hearColors(COOL),
        mix(hearColors(7), hearColors(WARM), hearColors(COOL)),
      ],
      5: [
        hearColors(5),
        hearColors(7),
        seeColors(10),
        hearColors(8),
        hearColors(9),
        hearColors(10),
        hearColors(WARM),
        hearColors(COOL),
        hearColors(DARK),
        mix(hearColors(10), hearColors(WARM), hearColors(COOL), hearColors(DARK)),
      ],
      6: [
        hearColors(7),
        hearColors(8),
        hearColors(9),
        hearColors(10),
        hearColors(WARM),
        hearColors(COOL),
        hearColors(DARK),
        hearColors(LIGHT),
        mix(hearColors(WARM), hearColors(COOL), hearColors(DARK), hearColors(LIGHT)),
        mix(hearColors(10), hearColors(WARM), hearColors(COOL), hearColors(DARK), hearColors(LIGHT)),
      ],
    },
  },

  // Finding princess things by sight, then by name. Aimed at a three year old.
  princess: {
    icon: '👑',
    plans: {
      3: [
        seeThings(3),
        seeThings(4),
        seeThings(5),
        hearThings(3),
        seeThings(6),
        mix(seeThings(6), hearThings(3)),
        seeThings(9),
        hearThings(4),
        mix(seeThings(9), hearThings(4)),
        hearThings(5),
      ],
      4: [
        seeThings(9),
        hearThings(4),
        hearThings(5),
        hearThings(6),
        mix(seeThings(9), hearThings(6)),
        hearThings(7),
        hearThings(8),
        seeThings(13),
        hearThings(9),
        mix(seeThings(13), hearThings(9)),
      ],
      5: [
        seeThings(13),
        hearThings(6),
        hearThings(7),
        hearThings(8),
        hearThings(9),
        hearThings(10),
        hearThings(11),
        hearThings(12),
        hearThings(13),
        mix(seeThings(13), hearThings(13)),
      ],
      6: [
        seeThings(13),
        hearThings(7),
        hearThings(8),
        hearThings(9),
        hearThings(10),
        hearThings(11),
        hearThings(12),
        hearThings(13),
        hearThings(13),
        hearThings(13),
      ],
    },
  },

  // Circle, square and triangle come first: those are the shapes expected at three to four.
  shapes: {
    icon: '🔷',
    plans: {
      3: [
        seeShapes(3),
        hearShapes(3),
        seeShapes(4),
        seeShapes(5),
        mix(seeShapes(5), hearShapes(3)),
        hearShapes(4),
        seeShapes(6),
        mix(seeShapes(6), hearShapes(4)),
        hearShapes(5),
        mix(seeShapes(6), hearShapes(5)),
      ],
      4: [
        seeShapes(5),
        hearShapes(4),
        hearShapes(5),
        seeShapes(7),
        hearShapes(6),
        mix(seeShapes(7), hearShapes(6)),
        hearShapes(7),
        seeShapes(9),
        hearShapes(8),
        mix(seeShapes(9), hearShapes(8)),
      ],
      5: [
        seeShapes(9),
        hearShapes(5),
        hearShapes(6),
        hearShapes(7),
        hearShapes(8),
        hearShapes(9),
        hearShapes(ROUND),
        hearShapes(BOXY),
        mix(hearShapes(ROUND), hearShapes(BOXY)),
        mix(hearShapes(9), hearShapes(ROUND), hearShapes(BOXY)),
      ],
      6: [
        seeShapes(9),
        hearShapes(6),
        hearShapes(7),
        hearShapes(8),
        hearShapes(9),
        hearShapes(ROUND),
        hearShapes(BOXY),
        mix(hearShapes(ROUND), hearShapes(BOXY)),
        hearShapes(9),
        mix(hearShapes(9), hearShapes(ROUND), hearShapes(BOXY)),
      ],
    },
  },

  // What comes next in a repeating row. Research from Vanderbilt University found that
  // knowing patterns at four and five goes with doing well in maths years later. Children
  // just starting pre-school found patterns very hard, so there is no plan for age 3.
  patterns: {
    icon: '🧩',
    plans: {
      4: [
        colorRow('AB', 3),
        colorRow('AB', 5),
        shapeRow('AB', 3),
        mix(colorRow('AB', 7), shapeRow('AB', 5)),
        colorRow('AAB', 5),
        colorRow('ABB', 5),
        shapeRow('AAB', 5),
        shapeRow('ABB', 5),
        mix(colorRow('AAB', 7), colorRow('ABB', 7)),
        mix(colorRow('AB', 7), shapeRow('AB', 5), colorRow('AAB', 7), shapeRow('ABB', 5)),
      ],
      5: [
        colorRow('AB', 7),
        shapeRow('AB', 5),
        colorRow('AAB', 7),
        colorRow('ABB', 7),
        shapeRow('AAB', 5),
        shapeRow('ABB', 5),
        colorRow('ABC', 7),
        shapeRow('ABC', 5),
        colorRow('AABB', 7),
        mix(colorRow('ABC', 7), shapeRow('ABC', 5), colorRow('AABB', 7), colorRow('AAB', 7)),
      ],
      6: [
        colorRow('AAB', 7),
        shapeRow('ABB', 9),
        colorRow('ABC', 10),
        shapeRow('ABC', 9),
        colorRow('AABB', 10),
        shapeRow('AABB', 9),
        colorRow('AABC', 10),
        shapeRow('ABBC', 9),
        colorRow('ABAC', 10),
        mix(colorRow('AABC', 10), shapeRow('ABBC', 9), colorRow('ABAC', 10), shapeRow('AABB', 9)),
      ],
    },
  },
};

export const GAME_IDS = Object.keys(GAMES);

export const ageOrDefault = (age) => (AGES.includes(age) ? age : AGES.includes(CONFIG.age) ? CONFIG.age : AGES[0]);

// The games a child of that age can pick.
export const gamesFor = (age) => GAME_IDS.filter((id) => GAMES[id].plans[ageOrDefault(age)]);

export function gameOrDefault(id, age) {
  const list = gamesFor(age);
  return list.includes(id) ? id : list.includes(CONFIG.game) ? CONFIG.game : list[0];
}

// --- Making a question ------------------------------------------------------------------

const range = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

// Two wrong answers close to the right one, never below 1.
function nearby(answer, offsets, max = Infinity) {
  const candidates = offsets.map((o) => answer + o).filter((v) => v >= 1 && v <= max);
  return shuffle(candidates).slice(0, 2);
}

// The little things shown to count. Their names in each language are in src/text.js.
export const ITEMS = {
  apple: '🍎',
  star: '⭐',
  ball: '⚽',
  flower: '🌸',
  strawberry: '🍓',
  butterfly: '🦋',
  frog: '🐸',
};
const ITEM_IDS = Object.keys(ITEMS);

// Fingers are shown as pictures of hands (public/art/hands) instead of a row of little things.
// FINGER_SHARE is how often a counting question uses them: 0 never, 1 always.
export const FINGERS = 'fingers';
const FINGER_SHARE = 0.35;
const anyItem = () => (Math.random() < FINGER_SHARE ? FINGERS : ITEM_IDS[rand(0, ITEM_IDS.length - 1)]);

// A small number, and two other small numbers to put on the wrong doors.
function amount(max) {
  const answer = rand(1, max);
  const wrong =
    max <= 5
      ? shuffle(range(1, max).filter((n) => n !== answer)).slice(0, 2)
      : nearby(answer, [-2, -1, 1, 2], max);
  return { answer, wrong };
}

// Things in the banner, dots on the doors.
function makeSame({ max }) {
  const { answer, wrong } = amount(max);
  return { kind: 'same', text: `same ${answer}`, item: anyItem(), doors: 'dots', answer, wrong };
}

// Things in the banner, numbers on the doors (doors: 'both' adds the dots under each number).
function makeCount({ max, doors }) {
  const { answer, wrong } = amount(max);
  return { kind: 'count', text: `count ${answer}`, item: anyItem(), doors, answer, wrong };
}

// Three doors of dots: pick the one with the most (or the fewest).
// "gap" is how far ahead the right door must be, so early levels are easy to see.
function makeCompare({ kind: asked, max, gap = 1 }) {
  // A "compare" level asks for more half the time and fewer the other half.
  const kind = asked === 'compare' ? (Math.random() < 0.5 ? 'more' : 'fewer') : asked;
  let amounts = kind === 'more' ? [1, 2, max] : [1, max - 1, max];
  for (let tries = 0; tries < 200; tries++) {
    const three = shuffle(range(1, max)).slice(0, 3).sort((a, b) => a - b);
    const lead = kind === 'more' ? three[2] - three[1] : three[1] - three[0];
    if (lead >= gap) {
      amounts = three;
      break;
    }
  }
  const answer = kind === 'more' ? amounts[2] : amounts[0];
  return {
    kind,
    text: `${kind} ${amounts.join(' ')}`,
    doors: 'dots',
    answer,
    wrong: amounts.filter((n) => n !== answer),
  };
}

// A number in the banner, dots on the doors.
function makeFind({ max }) {
  const { answer, wrong } = amount(max);
  return { kind: 'find', text: `find ${answer}`, doors: 'dots', answer, wrong };
}

// The banner counts up to a number ("3, 4, 5, ?"); numbers on the doors.
function makeAfter({ max }) {
  const n = rand(1, max - 1);
  const answer = n + 1;
  return { kind: 'after', text: `after ${n}`, n, answer, wrong: nearby(answer, [-2, -1, 1, 2]) };
}

function addends({ maxSum, oneMore, bigFirst, twoDigit }) {
  if (oneMore) return [rand(1, maxSum - 1), 1];
  if (twoDigit) {
    const a = rand(10, maxSum - 10);
    return shuffle([a, rand(10, maxSum - a)]);
  }
  if (bigFirst) return [rand(10, maxSum - 9), rand(1, 9)];
  if (maxSum > 10) {
    const a = rand(3, 10);
    return shuffle([a, rand(2, Math.min(10, maxSum - a))]);
  }
  const a = rand(1, maxSum - 1);
  return shuffle([a, rand(1, maxSum - a)]);
}

function makeAdd(level) {
  const [a, b] = addends(level);
  const answer = a + b;
  const offsets = level.maxSum > 20 ? [-10, -2, -1, 1, 2, 10] : [-2, -1, 1, 2];
  return {
    kind: 'add',
    text: `${a} + ${b}`,
    a,
    b,
    answer,
    pictures: level.pictures === true,
    wrong: nearby(answer, offsets),
  };
}

function makeColor({ colors: pool, show }) {
  const [answer, ...others] = shuffle(pool);
  return { kind: 'color', text: `color ${answer}`, answer, show: show !== false, paint: true, wrong: others.slice(0, 2) };
}

// One thing or shape to find among three. "show" shows it; without it, only its name is said.
function makePick({ kind, pool, show }) {
  const [answer, ...others] = shuffle(pool);
  return {
    kind,
    text: `${kind} ${answer}`,
    doors: kind === 'thing' ? 'things' : 'shapes',
    answer,
    show: show !== false,
    wrong: others.slice(0, 2),
  };
}

// A repeating row with its next piece missing. The row is long enough to see it repeat,
// and short enough to fit in the banner. The wrong doors are the other pieces of the row,
// which are the tempting mistakes.
function makePattern({ unit, of, pool }) {
  const letters = [...new Set(unit)];
  const picked = shuffle(pool);
  const core = [...unit].map((letter) => picked[letters.indexOf(letter)]);
  const shown = rand(unit.length + 2, Math.min(7, unit.length * 2 + 1));
  const sequence = Array.from({ length: shown }, (_, i) => core[i % unit.length]);
  const answer = core[shown % unit.length];
  const others = [...picked.slice(0, letters.length).filter((piece) => piece !== answer), ...picked.slice(letters.length)];
  return {
    kind: 'pattern',
    text: `pattern ${sequence.join(' ')}`,
    of,
    sequence,
    answer,
    doors: of === 'shapes' ? 'shapes' : undefined,
    paint: of === 'colors', // the doors themselves are the colors
    wrong: others.slice(0, 2),
  };
}

const MAKERS = {
  thing: makePick,
  shape: makePick,
  same: makeSame,
  count: makeCount,
  find: makeFind,
  compare: makeCompare,
  more: makeCompare,
  fewer: makeCompare,
  after: makeAfter,
  add: makeAdd,
  color: makeColor,
  pattern: makePattern,
};

function makeFrom(spec) {
  let level = spec;
  while (level.kind === 'mix') level = level.of[rand(0, level.of.length - 1)];
  const q = MAKERS[level.kind](level);
  if (!q.kind) q.kind = level.kind;
  return q;
}

// Builds the next question for a level (0 is the first), with the three door choices
// already shuffled. previousText avoids asking the same thing twice in a row.
export function makeQuestion(gameId, age, levelIndex, previousText = '') {
  const who = ageOrDefault(age);
  const plan = GAMES[gameOrDefault(gameId, who)].plans[who];
  const spec = plan[Math.min(plan.length - 1, Math.max(0, levelIndex))];
  let q = makeFrom(spec);
  for (let tries = 0; tries < 8 && q.text === previousText; tries++) q = makeFrom(spec);

  const choices = shuffle([q.answer, ...q.wrong]);
  const { wrong, ...question } = q;
  return { ...question, choices, correctIndex: choices.indexOf(q.answer) };
}
