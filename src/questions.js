// THE GAMES AND THEIR LEARNING STEPS
//
// GAMES lists each game the player can pick on the start screen. A game is a ladder
// of steps ("levels"), easiest first. Each right answer moves a child a little way up
// the ladder and each wrong answer a little way down (see answersPerLevel in config.js),
// so every game settles at whatever is just hard enough. Progress is saved per game.
//
// Kinds of question:
//   same   the banner shows a few things; find the door with the same number of dots
//   count  the banner shows a few things; find the door with the number that says how many
//   find   the banner shows a number; find the door with that many dots
//   add    the banner shows a sum; find the door with the answer
//   color  the banner shows or says a color; find the door of that color
//
// To add a step, add a line to a game's levels.
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

export const GAMES = {
  numbers: {
    icon: '🔢',
    levels: [
      { kind: 'same', max: 3 }, // three stars -> the door with three dots
      { kind: 'count', max: 3 }, // three stars -> the door that says 3
      { kind: 'find', max: 3 }, // the number 3 -> the door with three dots
      { kind: 'same', max: 5 },
      { kind: 'count', max: 5 },
      { kind: 'find', max: 5 },
      { kind: 'count', max: 10 },
      { kind: 'find', max: 10 },
      { kind: 'add', oneMore: true, maxSum: 5, pictures: true }, // 2 + 1, shown with apples
      { kind: 'add', maxSum: 5, pictures: true },
      { kind: 'add', maxSum: 10 },
      { kind: 'add', maxSum: 20 },
      { kind: 'add', maxSum: 50, bigFirst: true }, // 23 + 4
      { kind: 'add', maxSum: 99, twoDigit: true }, // 23 + 45
    ],
  },

  colors: {
    icon: '🎨',
    levels: [
      // "show: true" shows the color and says its name. The child matches what they see.
      { kind: 'color', colors: FIRST_COLORS, show: true },
      { kind: 'color', colors: MORE_COLORS, show: true },
      // "show: false" only says the name. The child has to know the color.
      { kind: 'color', colors: FIRST_COLORS, show: false },
      { kind: 'color', colors: MORE_COLORS, show: false },
      { kind: 'color', colors: ALL_COLORS, show: false },
    ],
  },
};

export const GAME_IDS = Object.keys(GAMES);

export const gameOrDefault = (id) => (GAMES[id] ? id : GAMES[CONFIG.game] ? CONFIG.game : GAME_IDS[0]);

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
const anyItem = () => ITEM_IDS[rand(0, ITEM_IDS.length - 1)];

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

// Things in the banner, numbers on the doors.
function makeCount({ max }) {
  const { answer, wrong } = amount(max);
  return { kind: 'count', text: `count ${answer}`, item: anyItem(), answer, wrong };
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

const MAKERS = { same: makeSame, count: makeCount, find: makeFind, add: makeAdd, color: makeColor };

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

  const choices = shuffle([q.answer, ...q.wrong]);
  const { wrong, ...question } = q;
  return { ...question, choices, correctIndex: choices.indexOf(q.answer) };
}
