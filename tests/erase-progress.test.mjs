// Erasing, from the grown-ups' page in the settings: each choice erases what it says and
// nothing else.

import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../src/storage.js';
import { AGES, GAME_IDS } from '../src/questions.js';

// Progress for two ages, a high score table, points, and settings that are not the defaults.
function playedGame() {
  const cleared = Object.fromEntries(AGES.map((age) => [age, Object.fromEntries(GAME_IDS.map((id) => [id, 0]))]));
  cleared[3][GAME_IDS[0]] = 4;
  cleared[3][GAME_IDS[1]] = 10;
  cleared[5][GAME_IDS[0]] = 2;
  store.update({
    cleared,
    totalPoints: 340,
    best: 31,
    highScores: [
      { name: 'Ana', score: 31, date: '' },
      { name: 'Leo', score: 12, date: '' },
    ],
    lastName: 'Ana',
    character: 'princess',
    tutorialAges: { 3: true },
    language: 'es',
    pace: 'slow',
    muted: true,
    age: 3,
    game: GAME_IDS[1],
  });
}

const levelsOf = (age) => Object.values(store.get().cleared[age]).reduce((sum, count) => sum + count, 0);

test('erasing one age leaves the other ages, the points and the high scores alone', () => {
  playedGame();
  store.eraseLevels([3]);
  assert.equal(levelsOf(3), 0);
  assert.equal(levelsOf(5), 2);
  assert.equal(store.cleared(), 0);
  assert.equal(store.get().totalPoints, 340);
  assert.equal(store.get().highScores.length, 2);
  assert.equal(store.get().tutorialAges[3], true);
  // Every game of the age is still there to be played, at zero.
  assert.deepEqual(Object.keys(store.get().cleared[3]).sort(), [...GAME_IDS].sort());
});

test('erasing every age clears all the levels and nothing else', () => {
  playedGame();
  store.eraseLevels();
  for (const age of AGES) assert.equal(levelsOf(age), 0);
  assert.equal(store.get().totalPoints, 340);
  assert.equal(store.get().best, 31);
  assert.equal(store.get().highScores.length, 2);
});

test('erasing the high scores empties the table and the best run, and keeps the levels', () => {
  playedGame();
  store.eraseHighScores();
  assert.deepEqual(store.get().highScores, []);
  assert.equal(store.get().best, 0);
  assert.equal(store.qualifies(1), true);
  assert.equal(levelsOf(3), 14);
  assert.equal(store.get().totalPoints, 340);
});

test('erasing everything starts over and keeps only the settings', () => {
  playedGame();
  store.eraseEverything();
  const state = store.get();
  for (const age of AGES) assert.equal(levelsOf(age), 0);
  assert.equal(state.totalPoints, 0);
  assert.equal(state.best, 0);
  assert.deepEqual(state.highScores, []);
  assert.equal(state.lastName, '');
  assert.equal(state.character, 'apple');
  assert.deepEqual(state.tutorialAges, {});
  assert.equal(state.language, 'es');
  assert.equal(state.pace, 'slow');
  assert.equal(state.muted, true);
  assert.equal(state.age, 3);
  assert.equal(state.game, GAME_IDS[1]);
});
