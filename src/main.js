// Menus, buttons, saving, and sounds. The 3D game itself is in game.js.

import './style.css';
import { CONFIG } from './config.js';
import { CHARACTERS } from './characters.js';
import { Game } from './game.js';
import { renderThumbnails } from './looks.js';
import { store } from './storage.js';
import { setMuted, sfx, unlockAudio } from './audio.js';
import { LANGUAGES, getLanguage, nameOf, setLanguage, t } from './text.js';

const $ = (id) => document.getElementById(id);

const el = {
  canvas: $('scene'),
  hud: $('hud'),
  score: $('score'),
  scorePill: $('score').parentElement,
  question: $('question'),
  catchup: $('catchup'),
  catchupDots: $('catchup-dots'),
  hint: $('hint'),
  mute: $('btn-mute'),
  muteStart: $('btn-mute-start'),
  languages: $('languages'),
  title: $('title'),
  stats: $('stats'),
  characters: $('characters'),
  unlockNote: $('unlock-note'),
  overTitle: $('over-title'),
  overScore: $('over-score'),
  overBest: $('over-best'),
  overUnlock: $('over-unlock'),
  overUnlockImg: $('over-unlock-img'),
  overUnlockText: $('over-unlock-text'),
  overButtons: $('over-buttons'),
  nameForm: $('name-form'),
  nameInput: $('name-input'),
  scoreList: $('score-list'),
  scoreEmpty: $('score-empty'),
};

const SCREENS = ['start', 'over', 'scores', 'pause'];

let game = null;
let thumbs = {};
let screen = 'start';
let lastScore = 0;

// --- Screens -----------------------------------------------------------------

function show(name) {
  for (const id of SCREENS) $(`screen-${id}`).hidden = id !== name;
  el.hud.hidden = name !== 'play' && name !== 'pause';
  screen = name;
}

function replay(element, className) {
  element.classList.remove(className);
  void element.offsetWidth; // restarts the animation
  element.classList.add(className);
}

// --- Characters ----------------------------------------------------------------

const isUnlocked = (def, totalPoints) => totalPoints >= def.unlockAt;

function currentCharacter() {
  const { character, totalPoints } = store.get();
  const saved = CHARACTERS.find((def) => def.id === character);
  if (saved && isUnlocked(saved, totalPoints)) return saved;
  return CHARACTERS.find((def) => isUnlocked(def, totalPoints)) ?? CHARACTERS[0];
}

function unlockMessage(def, totalPoints) {
  return t.toUnlock(def.unlockAt - totalPoints, nameOf(def));
}

function renderStart() {
  const { totalPoints, best } = store.get();
  const current = currentCharacter();

  el.stats.textContent = best > 0 ? `⭐ ${t.points(totalPoints)} · ${t.bestRun(best)}` : `⭐ ${t.points(totalPoints)}`;

  const nextLocked = CHARACTERS.filter((def) => !isUnlocked(def, totalPoints)).sort(
    (a, b) => a.unlockAt - b.unlockAt,
  )[0];
  el.unlockNote.textContent = nextLocked ? unlockMessage(nextLocked, totalPoints) : t.allUnlocked;

  el.characters.replaceChildren(
    ...CHARACTERS.map((def) => {
      const unlocked = isUnlocked(def, totalPoints);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'character';
      card.dataset.id = def.id;
      if (!unlocked) card.classList.add('locked');
      if (def === current) card.classList.add('selected');
      card.setAttribute('aria-pressed', String(def === current));
      card.setAttribute('aria-label', unlocked ? nameOf(def) : t.lockedLabel(nameOf(def), def.unlockAt));

      if (thumbs[def.id]) {
        const img = document.createElement('img');
        img.src = thumbs[def.id];
        img.alt = '';
        card.append(img);
      }
      const label = document.createElement('span');
      label.textContent = unlocked ? nameOf(def) : `🔒 ${def.unlockAt} ⭐`;
      card.append(label);

      card.addEventListener('click', () => {
        if (!unlocked) {
          replay(card, 'nudge');
          el.unlockNote.textContent = unlockMessage(def, store.get().totalPoints);
          return;
        }
        store.update({ character: def.id });
        game.setCharacter(def);
        renderStart();
      });
      return card;
    }),
  );
}

// --- A run -----------------------------------------------------------------------

function setCatchUp(visible, streak) {
  el.catchup.hidden = !visible;
  [...el.catchupDots.children].forEach((dot, i) => dot.classList.toggle('on', i < streak));
}

function startRun() {
  game.setCharacter(currentCharacter());
  el.score.textContent = '0';
  el.question.textContent = '';
  el.question.className = 'question';
  setCatchUp(false, 0);
  el.hint.hidden = false;
  show('play');
  game.startRun();
}

// Adds a run's points to the saved totals. Returns what changed.
function bankRun(score) {
  const before = store.get();
  const totalPoints = before.totalPoints + score;
  const unlocked = CHARACTERS.filter((def) => def.unlockAt > before.totalPoints && def.unlockAt <= totalPoints);
  const newest = unlocked[unlocked.length - 1];
  store.update({
    totalPoints,
    best: Math.max(before.best, score),
    // A newly unlocked character is picked straight away. It can be changed on the start screen.
    ...(newest ? { character: newest.id } : {}),
  });
  return { newBest: score > before.best, newest, lastName: before.lastName };
}

function goHome() {
  // Leaving a run early still keeps the points earned so far.
  if (screen === 'pause' && game.score > 0) bankRun(game.score);
  game.toIdle();
  game.setCharacter(currentCharacter());
  renderStart();
  show('start');
}

function pauseRun() {
  if (screen === 'play' && game.pause()) show('pause');
}

const gameEvents = {
  onQuestion(question) {
    el.question.textContent = `${question.text} = ?`;
    el.question.className = 'question';
    replay(el.question, 'new');
  },

  onAnswer(info) {
    el.hint.hidden = true;
    el.score.textContent = String(info.score);

    // Show the finished sum, so the right answer is always seen.
    const answer = document.createElement('span');
    answer.className = 'answer';
    answer.textContent = String(info.question.answer);
    el.question.replaceChildren(`${info.question.text} = `, answer);
    el.question.className = `question ${info.correct ? 'right' : 'wrong'}`;

    if (info.correct) {
      sfx.correct();
      replay(el.scorePill, 'pop');
      if (info.caughtUp) setTimeout(() => sfx.catchUp(), 280);
    } else {
      sfx.wrong();
    }
    setCatchUp(info.pushedBack && !info.fatal, info.streak);
  },

  onMove() {
    el.hint.hidden = true;
    sfx.move();
  },

  onGameOver(score) {
    finishRun(score);
  },
};

function friendlyTitle(score, newBest) {
  if (newBest && score > 0) return t.overTitle.newBest;
  if (score >= 20) return t.overTitle.amazing;
  if (score >= 8) return t.overTitle.great;
  if (score >= 1) return t.overTitle.nice;
  return t.overTitle.zero;
}

function finishRun(score) {
  lastScore = score;
  const { newBest, newest, lastName } = bankRun(score);

  el.overTitle.textContent = friendlyTitle(score, newBest);
  el.overScore.textContent = String(score);
  el.overBest.textContent = newBest && score > 0 ? t.bestYet : t.bestRun(store.get().best);

  el.overUnlock.hidden = !newest;
  if (newest) {
    el.overUnlockImg.hidden = !thumbs[newest.id];
    if (thumbs[newest.id]) el.overUnlockImg.src = thumbs[newest.id];
    el.overUnlockText.textContent = t.unlocked(nameOf(newest));
  }

  const madeTheTable = store.qualifies(score);
  el.nameForm.hidden = !madeTheTable;
  el.overButtons.hidden = madeTheTable;
  if (madeTheTable) el.nameInput.value = lastName;

  show('over');
  if (newest) sfx.unlock();
  else sfx.over();
}

// --- High scores ------------------------------------------------------------------

function showScores(highlight = -1) {
  const list = store.get().highScores;
  el.scoreEmpty.hidden = list.length > 0;
  el.scoreList.hidden = list.length === 0;
  el.scoreList.replaceChildren(
    ...list.map((row, i) => {
      const item = document.createElement('li');
      if (i === highlight) item.classList.add('mine');
      const rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = String(i + 1);
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = row.name;
      const points = document.createElement('span');
      points.textContent = `⭐ ${row.score}`;
      item.append(rank, name, points);
      return item;
    }),
  );
  show('scores');
}

// --- Language ------------------------------------------------------------------------

// Fills in every fixed word on the page from src/text.js.
function applyWords() {
  document.documentElement.lang = getLanguage();
  for (const node of document.querySelectorAll('[data-t]')) node.textContent = t[node.dataset.t];
  for (const node of document.querySelectorAll('[data-t-label]')) {
    node.setAttribute('aria-label', t[node.dataset.tLabel]);
  }
  for (const button of el.languages.children) {
    const chosen = button.dataset.lang === getLanguage();
    button.classList.toggle('selected', chosen);
    button.setAttribute('aria-pressed', String(chosen));
  }
}

function buildLanguageButtons() {
  el.languages.replaceChildren(
    ...LANGUAGES.map(({ code, label }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lang-btn';
      button.dataset.lang = code;
      button.lang = code;
      button.textContent = label;
      button.addEventListener('click', () => {
        setLanguage(code);
        store.update({ language: code });
        applyWords();
        applyMute();
        renderStart();
      });
      return button;
    }),
  );
}

// --- Sound ---------------------------------------------------------------------------

function applyMute() {
  const { muted } = store.get();
  setMuted(muted);
  el.mute.textContent = muted ? '🔇' : '🔊';
  el.muteStart.textContent = muted ? t.soundOff : t.soundOn;
}

function toggleMute() {
  store.update({ muted: !store.get().muted });
  applyMute();
}

// --- Wiring ----------------------------------------------------------------------------

function wireButtons() {
  $('btn-play').addEventListener('click', startRun);
  $('btn-again').addEventListener('click', startRun);
  $('btn-scores-play').addEventListener('click', startRun);
  $('btn-scores').addEventListener('click', () => showScores());
  $('btn-over-scores').addEventListener('click', () => showScores());
  $('btn-home').addEventListener('click', goHome);
  $('btn-scores-home').addEventListener('click', goHome);
  $('btn-pause-home').addEventListener('click', goHome);
  $('btn-pause').addEventListener('click', pauseRun);
  $('btn-resume').addEventListener('click', () => {
    show('play');
    game.resume();
  });
  el.mute.addEventListener('click', toggleMute);
  el.muteStart.addEventListener('click', toggleMute);

  el.nameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const place = store.addHighScore(el.nameInput.value, lastScore);
    el.nameInput.blur();
    showScores(place);
  });
  // iOS can leave the page scrolled after the keyboard closes.
  el.nameInput.addEventListener('blur', () => window.scrollTo(0, 0));

  // Every button makes a small click sound.
  document.addEventListener('click', (event) => {
    if (event.target.closest?.('button')) sfx.tap();
  });
}

function wireTouch() {
  // iOS only plays sound after a touch, so wake the sound on every one.
  for (const type of ['pointerdown', 'pointerup', 'touchend', 'click']) {
    document.addEventListener(type, unlockAudio, { capture: true, passive: true });
  }

  // Tap a lane to go there, or swipe left or right to move one lane.
  let press = null;
  el.canvas.addEventListener('pointerdown', (event) => {
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, swiped: false };
  });
  el.canvas.addEventListener('pointermove', (event) => {
    if (!press || event.pointerId !== press.id || press.swiped) return;
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      press.swiped = true;
      if (screen === 'play') game.moveLane(Math.sign(dx));
    }
  });
  el.canvas.addEventListener('pointerup', (event) => {
    if (!press || event.pointerId !== press.id) return;
    const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    if (!press.swiped && moved < 22 && screen === 'play') game.tapAt(press.x, press.y);
    press = null;
  });
  el.canvas.addEventListener('pointercancel', () => {
    press = null;
  });

  // Arrow keys, for trying the game on a computer.
  window.addEventListener('keydown', (event) => {
    if (screen !== 'play') return;
    if (event.key === 'ArrowLeft') game.moveLane(-1);
    if (event.key === 'ArrowRight') game.moveLane(1);
  });

  // Keep the page from zooming, scrolling, or popping up menus under small fingers.
  document.addEventListener('gesturestart', (event) => event.preventDefault());
  document.addEventListener('contextmenu', (event) => event.preventDefault());

  // Pause when the game is put in the background.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseRun();
  });

  window.addEventListener('resize', () => game.resize());
  window.addEventListener('orientationchange', () => setTimeout(() => game.resize(), 250));
}

async function init() {
  // The title is the same in every language.
  document.title = CONFIG.title;
  el.title.textContent = CONFIG.title;
  el.nameInput.maxLength = CONFIG.nameMaxLength;
  el.catchupDots.replaceChildren(...Array.from({ length: CONFIG.recoverStreak }, () => document.createElement('i')));

  await store.init();
  setLanguage(store.get().language || CONFIG.language);
  buildLanguageButtons();
  applyWords();
  thumbs = renderThumbnails(CHARACTERS);

  try {
    game = new Game(el.canvas, gameEvents);
  } catch (error) {
    console.error(error);
    el.stats.textContent = t.cannotShow;
    $('btn-play').hidden = true;
    return;
  }
  game.setCharacter(currentCharacter());

  wireButtons();
  wireTouch();
  applyMute();
  renderStart();
  show('start');

  // A handle for the automatic test player. Only present while developing.
  if (import.meta.env.DEV) window.__game = game;
}

init();
