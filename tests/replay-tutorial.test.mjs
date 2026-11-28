import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { CONFIG } from '../src/config.js';

function practiceGame() {
  const game = Object.create(Game.prototype);
  const voice = { busy: true };
  Object.assign(game, {
    mode: 'running', age: 3, pace: CONFIG.paces.normal, endless: false,
    runnerZ: 0, character: { front: 0.5 }, lane: 1, speed: 4,
    inputLocked: false, gapTimer: 0, doorsDone: 0, score: 0,
    row: { state: 'approach', z: -2, age: 1, locked: false,
      question: { kind: 'color', choices: ['red', 'green', 'blue'], correctIndex: 2 } },
    events: { isSpeaking: () => voice.busy, questionSeconds: () => 2 },
    placeRow() {}, answeredRight() { this.score++; },
    answeredWrong() { this.row.state = 'pushing'; },
  });
  const advance = (seconds) => {
    for (let left = seconds; left > 0.00001; left -= 0.01) game.updateRow(Math.min(0.01, left));
  };
  return { game, voice, advance };
}

test('replay holds the same doors for speech, allows movement, then grants a fresh thinking window', () => {
  const { game, voice, advance } = practiceGame();
  const question = game.row.question;
  assert.equal(game.replayQuestion(), true);
  advance(2);
  assert.equal(game.row.z, -2);
  assert.equal(game.row.locked, false);
  assert.equal(game.setLane(2), true);
  voice.busy = false;
  advance(0.01);
  advance(game.thinkingTime(question) - 0.5);
  assert.equal(game.row.locked, false);
  assert.equal(game.score, 0);
  advance(0.5);
  assert.equal(game.row.locked, true);
  assert.equal(game.score, 1);
  assert.equal(game.row.question, question);
  assert.equal(game.row.replaySpeed, null, 'passing doors must return to normal speed');
});

test('another late replay renews the window without changing the question or scoring', () => {
  const { game, voice, advance } = practiceGame();
  voice.busy = false;
  game.replayQuestion();
  advance(0.2 + game.thinkingTime(game.row.question) - 0.7);
  const position = game.row.z;
  game.replayQuestion();
  voice.busy = true;
  advance(1);
  assert.equal(game.row.z, position);
  voice.busy = false;
  advance(game.thinkingTime(game.row.question) - 0.5);
  assert.equal(game.row.locked, false);
  assert.equal(game.doorsDone, 0);
  assert.equal(game.score, 0);
});

test('replay retains extra counting time and younger children get more time', () => {
  const { game } = practiceGame();
  const counting = { kind: 'count', answer: 5, doors: 'dots', choices: [3, 4, 5] };
  const three = game.thinkingTime(counting);
  assert.ok(three > game.thinkingTime(game.row.question) + 6);
  game.age = 4;
  assert.ok(three > game.thinkingTime(counting));
});

test('replay cannot change answered, paused, or endless rounds', () => {
  for (const patch of [{ endless: true }, { mode: 'paused' }, { mode: 'tutorial' }]) {
    const { game } = practiceGame();
    Object.assign(game, patch);
    assert.equal(game.replayQuestion(), false);
    assert.equal(game.speed, 4);
  }
  const { game } = practiceGame();
  game.row.locked = true;
  assert.equal(game.replayQuestion(), false);
  game.row.locked = false;
  game.row.state = 'passing';
  assert.equal(game.replayQuestion(), false);
});

test('a stuck voice has a bounded wait and a muted voice still grants fresh time', () => {
  const { game, advance } = practiceGame();
  game.replayQuestion();
  advance(2 + CONFIG.maxWaitForVoice + 0.1);
  assert.equal(game.row.replayHold, false);
  assert.equal(game.row.locked, false);
  const silent = practiceGame();
  silent.voice.busy = false;
  silent.game.replayQuestion();
  silent.advance(0.2);
  assert.equal(silent.game.row.replayHold, false);
  silent.advance(silent.game.thinkingTime(silent.game.row.question) - 0.6);
  assert.equal(silent.game.row.locked, false);
});

test('practice advances only after a real lane-changing tap and swipe; arrows also work', () => {
  for (const keyboard of [false, true]) {
    const { game } = practiceGame();
    game.mode = 'tutorial';
    game.tutorialStep = 'tap';
    const steps = [];
    game.events.onTutorialStep = (step) => steps.push(step);
    assert.equal(game.setLane(1), false);
    game.moveLane(-1); // a swipe before the tap lesson does not skip it
    assert.equal(game.tutorialStep, 'tap');
    game.setLane(2, keyboard ? 'keyboard' : 'tap');
    assert.equal(game.tutorialStep, 'swipe');
    game.setLane(1, 'tap'); // tapping is still permitted during the swipe lesson
    assert.equal(game.tutorialStep, 'swipe');
    game.moveLane(-1, keyboard ? 'keyboard' : 'swipe');
    assert.deepEqual(steps, ['swipe', 'done']);
    assert.equal(game.score, 0);
    assert.equal(game.doorsDone, 0);
    assert.equal(game.pause(), true);
    assert.equal(game.setLane(2), false);
    game.resume();
    assert.equal(game.mode, 'tutorial');
  }
});
