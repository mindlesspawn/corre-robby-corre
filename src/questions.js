// THE GAMES AND THEIR LEARNING STEPS
//
// GAMES lists each game the player can pick on the start screen. A game is a ladder
// of steps ("levels"), easiest first. Each right answer moves a child a little way up
// the ladder and each wrong answer a little way down (see answersPerLevel in config.js),
// so every game settles at whatever is just hard enough. Progress is saved per game.
//
// Each game also says which of its steps belong to each age ("ages"). The start screen
// has one button per age, and a child only plays the steps for the age that is picked.
//
// Kinds of question:
//   same   the banner shows a few things; find the door with the same number of dots
//   count  the banner shows a few things; find the door with the number that says how many
//   find   the banner shows a number; find the door with that many dots
//   more   find the door with the most dots ("fewer": the door with the least).
//          A "compare" step asks one or the other at random.
//   add    the banner shows a sum; find the door with the answer
//   color  the banner shows or says a color; find the door of that color
//   thing  the banner shows or names a thing (a crown, a castle...); find its picture
//   shape  the banner shows or names a shape; find the door with that shape
//
// To add a step, add a line to a game's levels, then check the numbers in its "ages".
// To add a game, add an entry to GAMES and its name to src/text.js.
// To add a new kind of question (shapes, letters...), add a maker below, then teach
// src/main.js how to show it and src/text.js how to say it.

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

const FIRST_COLORS = ['red', 'blue', 'yellow'];
const MORE_COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
const ALL_COLORS = [...MORE_COLORS, 'pink'];

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
};
const ALL_THINGS = Object.keys(THINGS);
const FIRST_THINGS = ALL_THINGS.slice(0, 3);
const MORE_THINGS = ALL_THINGS.slice(0, 6);

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
};
const ALL_SHAPES = Object.keys(SHAPES);
const FIRST_SHAPES = ALL_SHAPES.slice(0, 3);

// The age groups on the start screen. 6 means six and older.
export const AGES = [3, 4, 5, 6];

export const GAMES = {
  // The order follows early-childhood teaching guidance (sources are in the README):
  // small amounts by sight first, then comparing, and written numbers only after that,
  // arriving together with their dots. Sums stay small and are shown with pictures.
  numbers: {
    icon: '🔢',
    levels: [
      { kind: 'same', max: 3 }, // 0: three stars, said aloud -> the door with three dots
      { kind: 'find', max: 3 }, // 1: "three", said and shown -> the door with three dots
      { kind: 'compare', max: 6, gap: 3 }, // 2: which door has more, or fewer? very different amounts
      { kind: 'same', max: 5 }, // 3
      { kind: 'find', max: 5 }, // 4
      { kind: 'compare', max: 5, gap: 1 }, // 5: close amounts
      { kind: 'count', max: 3, doors: 'both' }, // 6: written numbers arrive, each with its dots
      { kind: 'count', max: 5, doors: 'both' }, // 7
      { kind: 'count', max: 5 }, // 8: the number on its own
      { kind: 'count', max: 7 }, // 9
      { kind: 'count', max: 10 }, // 10
      { kind: 'add', oneMore: true, maxSum: 5, pictures: true }, // 11: 2 + 1, shown with apples
      { kind: 'add', maxSum: 5, pictures: true }, // 12
      { kind: 'add', maxSum: 10, pictures: true }, // 13
      { kind: 'add', maxSum: 10 }, // 14: sums written only as numbers
      { kind: 'add', maxSum: 20 }, // 15
      { kind: 'add', maxSum: 50, bigFirst: true }, // 16: 23 + 4
      { kind: 'add', maxSum: 99, twoDigit: true }, // 17: 23 + 45
    ],
    // Which steps each age plays: [first, last]. The reasons and sources are in the README.
    ages: {
      3: [0, 2], // amounts up to 3 by sight; more and fewer with very different amounts
      4: [3, 8], // amounts up to 5, close amounts, written numbers up to 5
      5: [9, 13], // counting to 10, sums up to 10 with pictures
      6: [14, 17], // sums written as numbers, up to two digits
    },
  },

  colors: {
    icon: '🎨',
    levels: [
      // "show: true" shows the color and says its name. The child matches what they see.
      { kind: 'color', colors: FIRST_COLORS, show: true }, // 0
      { kind: 'color', colors: MORE_COLORS, show: true }, // 1
      // "show: false" only says the name. The child has to know the color.
      { kind: 'color', colors: FIRST_COLORS, show: false }, // 2
      { kind: 'color', colors: MORE_COLORS, show: false }, // 3
      { kind: 'color', colors: ALL_COLORS, show: false }, // 4
    ],
    ages: { 3: [0, 2], 4: [2, 3], 5: [3, 4], 6: [4, 4] },
  },

  // Finding princess things by sight, then by name. Aimed at a three year old.
  princess: {
    icon: '👑',
    levels: [
      { kind: 'thing', pool: FIRST_THINGS, show: true }, // 0
      { kind: 'thing', pool: MORE_THINGS, show: true }, // 1
      { kind: 'thing', pool: FIRST_THINGS, show: false }, // 2
      { kind: 'thing', pool: MORE_THINGS, show: false }, // 3
      { kind: 'thing', pool: ALL_THINGS, show: false }, // 4
    ],
    ages: { 3: [0, 2], 4: [2, 3], 5: [3, 4], 6: [4, 4] },
  },

  // Circle, square and triangle come first: those are the shapes expected at three to four.
  shapes: {
    icon: '🔷',
    levels: [
      { kind: 'shape', pool: FIRST_SHAPES, show: true }, // 0
      { kind: 'shape', pool: FIRST_SHAPES, show: false }, // 1
      { kind: 'shape', pool: ALL_SHAPES, show: true }, // 2
      { kind: 'shape', pool: ALL_SHAPES, show: false }, // 3
    ],
    ages: { 3: [0, 1], 4: [1, 3], 5: [2, 3], 6: [3, 3] },
  },
};

export const GAME_IDS = Object.keys(GAMES);

export const gameOrDefault = (id) => (GAMES[id] ? id : GAMES[CONFIG.game] ? CONFIG.game : GAME_IDS[0]);

export const ageOrDefault = (age) => (AGES.includes(age) ? age : AGES.includes(CONFIG.age) ? CONFIG.age : AGES[0]);

// The lowest and highest progress number a child of that age can have in a game.
export function skillRange(gameId, age) {
  const [first, last] = GAMES[gameOrDefault(gameId)].ages[ageOrDefault(age)];
  return [first * CONFIG.answersPerLevel, (last + 1) * CONFIG.answersPerLevel - 1];
}

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
// "gap" is how far ahead the right door must be, so early steps are easy to see.
function makeCompare({ kind: asked, max, gap = 1 }) {
  // A "compare" step asks for more half the time and fewer the other half.
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

function addends(level) {
  if (level.oneMore) return [rand(1, level.maxSum - 1), 1];
  if (level.twoDigit) {
    const a = rand(10, 60);
    return shuffle([a, rand(10, 99 - a)]);
  }
  if (level.bigFirst) return [rand(10, 40), rand(1, 9)];
  if (level.maxSum > 10) return [rand(3, 10), rand(3, 10)];
  const a = rand(1, level.maxSum - 1);
  return shuffle([a, rand(1, level.maxSum - a)]);
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

function makeColor({ colors, show }) {
  const [answer, ...others] = shuffle(colors);
  return { kind: 'color', text: `color ${answer}`, answer, show: show !== false, wrong: others.slice(0, 2) };
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

const MAKERS = {
  thing: makePick,
  shape: makePick,
  same: makeSame,
  count: makeCount,
  find: makeFind,
  compare: makeCompare,
  more: makeCompare,
  fewer: makeCompare,
  add: makeAdd,
  color: makeColor,
};

// Which step a child is on, from their saved progress number for that game.
export function levelFromSkill(skill, gameId) {
  const top = GAMES[gameOrDefault(gameId)].levels.length - 1;
  return Math.min(top, Math.max(0, Math.floor((skill || 0) / CONFIG.answersPerLevel)));
}

// Builds the next question, with the three door choices already shuffled.
// previousText avoids asking the same thing twice in a row.
export function makeQuestion(gameId, levelIndex, previousText = '') {
  const levels = GAMES[gameOrDefault(gameId)].levels;
  const level = levels[Math.min(levels.length - 1, Math.max(0, levelIndex))];
  const make = MAKERS[level.kind];
  let q = make(level);
  for (let tries = 0; tries < 8 && q.text === previousText; tries++) q = make(level);
  if (!q.kind) q.kind = level.kind;

  const choices = shuffle([q.answer, ...q.wrong]);
  const { wrong, ...question } = q;
  return { ...question, choices, correctIndex: choices.indexOf(q.answer) };
}
