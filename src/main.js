// Menus, buttons, saving, sounds, and the voice. The 3D game itself is in game.js.

// The rounded letters, bundled with the game so they also work with no internet.
import '@fontsource-variable/fredoka';
import './style.css';
import { COLORS, CONFIG } from './config.js';
import { CHARACTERS } from './characters.js';
import { Game } from './game.js';
import { renderThumbnails } from './looks.js';
import { FINGERS, GAMES, GAME_IDS, ITEMS, SHAPES, THINGS, levelFromSkill } from './questions.js';
import { store } from './storage.js';
import { setMuted, sfx, unlockAudio } from './audio.js';
import {
  canSpeak,
  isSpeaking,
  onVoicesChanged,
  preloadSpeech,
  speechSeconds,
  setSpeechLanguage,
  setSpeechMuted,
  speak,
  stopSpeaking,
  voiceState,
} from './speech.js';
import { LANGUAGES, answerText, askText, getLanguage, nameOf, setLanguage, spokenAnswer, t } from './text.js';

const $ = (id) => document.getElementById(id);

const el = {
  canvas: $('scene'),
  hud: $('hud'),
  score: $('score'),
  scorePill: $('score').parentElement,
  question: $('question'),
  ask: $('ask'),
  progress: $('progress'),
  hint: $('hint'),
  mute: $('btn-mute'),
  muteStart: $('btn-mute-start'),
  languages: $('languages'),
  paces: $('paces'),
  voiceNote: $('voice-note'),
  title: $('title'),
  stats: $('stats'),
  characters: $('characters'),
  unlockNote: $('unlock-note'),
  games: $('games'),
  levelNote: $('level-note'),
  easier: $('btn-easier'),
  harder: $('btn-harder'),
  overTitle: $('over-title'),
  overStars: $('over-stars'),
  overScore: $('over-score'),
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
let runGame = CONFIG.game; // the game the current run is playing
let runResults = []; // right and wrong so far in this run
let runEndless = false; // true while playing (or having just played) an endless run
let currentQuestion = null;

const pick = (list) => list[Math.floor(Math.random() * list.length)];

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

function tag(name, className, text) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// --- Start screen --------------------------------------------------------------

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

function renderCharacters() {
  const { totalPoints } = store.get();
  const current = currentCharacter();

  const nextLocked = CHARACTERS.filter((def) => !isUnlocked(def, totalPoints)).sort(
    (a, b) => a.unlockAt - b.unlockAt,
  )[0];
  // With nothing left to unlock, the line about unlocking is hidden.
  el.unlockNote.hidden = !nextLocked;
  el.unlockNote.textContent = nextLocked ? unlockMessage(nextLocked, totalPoints) : '';

  el.characters.replaceChildren(
    ...CHARACTERS.map((def) => {
      const unlocked = isUnlocked(def, totalPoints);
      const card = tag('button', 'character');
      card.type = 'button';
      card.dataset.id = def.id;
      if (!unlocked) card.classList.add('locked');
      if (def === current) card.classList.add('selected');
      card.setAttribute('aria-pressed', String(def === current));
      card.setAttribute('aria-label', unlocked ? nameOf(def) : t.lockedLabel(nameOf(def), def.unlockAt));

      if (thumbs[def.id]) {
        const img = tag('img');
        img.src = thumbs[def.id];
        img.alt = '';
        card.append(img);
      }
      card.append(tag('span', '', unlocked ? nameOf(def) : `🔒 ${def.unlockAt} ⭐`));

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

// The game picker: numbers, colors, and whatever is added to src/questions.js.
function renderGames() {
  const current = store.game();
  el.games.replaceChildren(
    ...GAME_IDS.map((id) => {
      const button = tag('button', 'game-btn');
      button.append(tag('span', 'game-icon', GAMES[id].icon), tag('span', '', t.games[id] ?? id));
      button.type = 'button';
      button.dataset.game = id;
      button.classList.toggle('selected', id === current);
      button.setAttribute('aria-pressed', String(id === current));
      button.addEventListener('click', () => {
        store.update({ game: id });
        renderStart();
      });
      return button;
    }),
  );
}

// The step picker, for grown-ups: shows where the child is and lets you move them.
function renderLevel() {
  const id = store.game();
  const levels = GAMES[id].levels;
  const level = levelFromSkill(store.skill(id), id);
  const step = levels[level];
  // Steps for older children are marked, so a grown-up knows playing alone will not reach them.
  el.levelNote.textContent = `${t.level(level + 1)} · ${t.levelName(step)}${step.grownUp ? ` · ${t.advanced}` : ''}`;
  el.easier.disabled = level === 0;
  el.harder.disabled = level === levels.length - 1;
}

function stepLevel(change) {
  const id = store.game();
  const top = GAMES[id].levels.length - 1;
  const level = Math.min(top, Math.max(0, levelFromSkill(store.skill(id), id) + change));
  store.setSkill(id, level * CONFIG.answersPerLevel);
  renderLevel();
}

function renderStart() {
  const { totalPoints, best } = store.get();
  el.stats.textContent = best > 0 ? `⭐ ${t.points(totalPoints)} · ${t.bestRun(best)}` : `⭐ ${t.points(totalPoints)}`;
  renderCharacters();
  renderGames();
  renderLevel();
  renderPaces();
  renderVoiceNote();
}

const currentPace = () => (CONFIG.paces[store.get().pace] ? store.get().pace : CONFIG.pace);

// The belt speed picker.
function renderPaces() {
  const chosen = currentPace();
  el.paces.replaceChildren(
    ...Object.keys(CONFIG.paces).map((id) => {
      const button = tag('button', 'lang-btn', t.paces[id] ?? id);
      button.type = 'button';
      button.dataset.pace = id;
      button.classList.toggle('selected', id === chosen);
      button.setAttribute('aria-pressed', String(id === chosen));
      button.addEventListener('click', () => {
        store.update({ pace: id });
        renderPaces();
      });
      return button;
    }),
  );
}

// Says so, in writing, when this device cannot speak the chosen language.
function renderVoiceNote() {
  const state = voiceState();
  const silent = state === 'none' || state === 'unsupported';
  el.voiceNote.hidden = !silent || store.get().muted;
  el.voiceNote.textContent = t.noVoice;
}

// --- The question banner ---------------------------------------------------------

// Pictures of hands holding up fingers: one hand up to five, then a full hand and the rest.
const handPicture = (fingers) => `./art/hands/${fingers}.png`;

function hands(count) {
  const group = tag('span', 'hands');
  const shown = count > 5 ? [5, count - 5] : [count];
  for (const fingers of shown) {
    const img = tag('img', 'hand');
    img.src = handPicture(fingers);
    img.alt = '';
    img.draggable = false;
    group.append(img);
  }
  return group;
}

// A row of little things to count, five to a line.
function things(count, item = 'apple') {
  if (item === FINGERS) return hands(count);
  const group = tag('span', count > 5 ? 'apples many' : 'apples');
  for (let i = 0; i < count; i++) {
    if (i > 0 && i % 5 === 0) group.append(tag('br'));
    group.append(ITEMS[item] ?? ITEMS.apple);
  }
  return group;
}

// A shape for the banner, drawn from the same outline the doors use.
function shapePicture(id) {
  const space = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(space, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'shape');
  const outline = document.createElementNS(space, 'path');
  outline.setAttribute('d', SHAPES[id] ?? '');
  svg.append(outline);
  return svg;
}

// Shows a question in the banner. "solved" adds the answer.
function showQuestion(question, solved = false) {
  const answer = () => tag('span', 'answer', String(question.answer));
  const parts = [];

  if (question.kind === 'find') {
    parts.push(tag('span', solved ? 'numeral answer' : 'numeral', String(question.answer)));
  } else if (question.kind === 'same' || question.kind === 'count') {
    parts.push(things(question.answer, question.item));
    if (solved) parts.push(' = ', answer());
  } else if (question.kind === 'thing' || question.kind === 'shape') {
    // Listening steps hide the picture until it is answered, unless the voice is off.
    if (solved || question.show || !canSpeak()) {
      parts.push(question.kind === 'thing' ? tag('span', 'picture', THINGS[question.answer]) : shapePicture(question.answer));
    } else {
      parts.push(tag('span', 'listen', '🔊'));
    }
  } else if (question.kind === 'more' || question.kind === 'fewer') {
    parts.push(tag('span', 'word', question.kind === 'more' ? t.wordMore : t.wordFewer));
  } else if (question.kind === 'color') {
    // Listening steps hide the color until it is answered, unless the voice is off.
    if (solved || question.show || !canSpeak()) {
      const swatch = tag('span', 'swatch');
      swatch.style.background = COLORS[question.answer];
      parts.push(swatch);
    } else {
      parts.push(tag('span', 'listen', '🔊'));
    }
  } else {
    if (question.pictures) {
      const pictures = tag('span', 'sum-pictures');
      pictures.append(things(question.a), tag('span', 'plus', '+'), things(question.b));
      parts.push(pictures);
    }
    const sum = tag('span', 'sum');
    sum.append(`${question.a} + ${question.b} = `, solved ? answer() : '?');
    parts.push(sum);
  }
  el.question.replaceChildren(...parts);
  // Underneath, the same thing in words: the question, then the answer.
  el.ask.textContent = solved ? answerText(question) : askText(question);
}

// Tells the game how much of the top of the screen the question area can take up,
// so the view is framed with the doors below it. Measured with the tallest question there is.
function measureQuestionArea() {
  if (!game) return;
  const wasHidden = el.hud.hidden;
  const keep = { nodes: [...el.question.childNodes], ask: el.ask.textContent, className: el.question.className };
  el.hud.style.visibility = 'hidden';
  el.hud.hidden = false;

  // Only things over the middle of the screen can cover the doors.
  const middle = window.innerWidth * 0.4;
  let bottom = 0;
  const tallest = [
    { kind: 'add', a: 4, b: 1, answer: 5, pictures: true },
    { kind: 'count', item: FINGERS, answer: 10 },
  ];
  for (const sample of tallest) {
    showQuestion(sample);
    el.question.className = 'question';
    el.ask.textContent = t.say.isCount(10, t.items.butterfly);
    for (const node of [el.question, el.ask, el.progress]) {
      const box = node.getBoundingClientRect();
      if (box.width > 0 && box.right > middle) bottom = Math.max(bottom, box.bottom);
    }
  }

  el.question.replaceChildren(...keep.nodes);
  el.question.className = keep.className;
  el.ask.textContent = keep.ask;
  el.hud.hidden = wasHidden;
  el.hud.style.visibility = '';
  game.setTopClear(bottom / window.innerHeight);
}

// One dot per door: gold for right, grey for missed, a ring around the one coming.
function showProgress() {
  [...el.progress.children].forEach((dot, i) => {
    dot.className = i < runResults.length ? (runResults[i] ? 'hit' : 'miss') : i === runResults.length ? 'now' : '';
  });
}

// --- A run -----------------------------------------------------------------------

// endless: true for the mode that gets faster and faster and goes on the high score table.
function startRun(endless = false) {
  runEndless = endless === true;
  el.progress.hidden = runEndless; // an endless run has no fixed number of doors to count off
  runGame = store.game();
  runResults = [];
  currentQuestion = null;
  game.setCharacter(currentCharacter());
  el.score.textContent = '0';
  el.question.replaceChildren();
  el.question.className = 'question';
  el.ask.textContent = '';
  showProgress();
  el.hint.hidden = false;
  show('play');
  game.startRun({ game: runGame, skill: store.skill(runGame), pace: currentPace(), endless: runEndless });
  // Nothing is spoken in an endless run: it has sounds only.
  if (runEndless) stopSpeaking();
  // Said inside the tap, which is what lets the voice work on iPhones and iPads.
  else speak(t.say.go);
}

// Adds a run's points and progress to the saved totals. Returns what changed.
function bankRun(score, skill) {
  const before = store.get();
  const totalPoints = before.totalPoints + score;
  const unlocked = CHARACTERS.filter((def) => def.unlockAt > before.totalPoints && def.unlockAt <= totalPoints);
  const newest = unlocked[unlocked.length - 1];
  store.update({
    totalPoints,
    // "Best" is the best endless run. An endless run does not move a child up or down the steps.
    best: runEndless ? Math.max(before.best, score) : before.best,
    skills: runEndless ? before.skills : { ...before.skills, [runGame]: Math.max(0, Math.floor(skill)) },
    // A newly unlocked character is picked straight away. It can be changed on the start screen.
    ...(newest ? { character: newest.id } : {}),
  });
  return { newest, lastName: before.lastName };
}

function goHome() {
  stopSpeaking();
  // Leaving a run early still keeps the points and progress earned so far.
  if (screen === 'pause') bankRun(game.score, game.skill);
  game.toIdle();
  game.setCharacter(currentCharacter());
  renderStart();
  show('start');
}

function pauseRun() {
  if (screen === 'play' && game.pause()) {
    stopSpeaking();
    show('pause');
  }
}

const gameEvents = {
  onQuestion(question) {
    currentQuestion = question;
    showQuestion(question);
    el.question.className = 'question';
    replay(el.question, 'new');
    showProgress();
    // An endless run has sounds but no talking.
    if (runEndless) return;
    speak(askText(question), { queue: true });
    // Fetch what might be said next, so it comes without a pause.
    preloadSpeech([spokenAnswer(question), answerText(question), ...t.say.praise]);
  },

  onAnswer(info) {
    el.hint.hidden = true;
    el.score.textContent = String(info.score);
    runResults = info.results;
    showProgress();

    // Show the answer, so the right one is always seen.
    showQuestion(info.question, true);
    el.question.className = `question ${info.correct ? 'right' : 'wrong'}`;

    if (info.correct) {
      // A special trick gets its own, brighter sound in place of the usual chime.
      if (info.trick) sfx.trick();
      else sfx.correct();
      replay(el.scorePill, 'pop');
      // Spoken praise comes with every other right answer and with every trick,
      // so the voice is not talking all the time.
      if (!info.endless && (info.trick || info.score % 2 === 1)) speak(pick(t.say.praise));
    } else {
      sfx.wrong();
      if (!info.endless) speak(spokenAnswer(info.question));
    }
  },

  // The game asks these two things so it can wait for the voice and leave time to think.
  isSpeaking,
  questionSeconds: (question) => speechSeconds(askText(question)),

  onMove() {
    el.hint.hidden = true;
    sfx.move();
  },

  onFinishing({ score, endless }) {
    currentQuestion = null;
    if (endless) {
      // The right answer stays on show, and the fanfare waits for the bump sound to finish.
      setTimeout(() => sfx.fanfare(), 450);
      return;
    }
    el.question.replaceChildren();
    el.ask.textContent = '';
    sfx.fanfare();
    speak(score > 0 ? t.say.finish(score) : t.say.finishZero);
  },

  onRunEnd(result) {
    finishRun(result);
  },
};

function friendlyTitle(score, total, endless) {
  if (endless) {
    if (score >= 30) return t.overTitle.amazing;
    if (score >= 12) return t.overTitle.great;
    return score >= 1 ? t.overTitle.nice : t.overTitle.zero;
  }
  if (score >= total * 0.9) return t.overTitle.amazing;
  if (score >= total * 0.6) return t.overTitle.great;
  if (score >= 1) return t.overTitle.nice;
  return t.overTitle.zero;
}

function finishRun({ score, total, skill, endless }) {
  lastScore = score;
  const { newest, lastName } = bankRun(score, skill);

  el.overTitle.textContent = friendlyTitle(score, total, endless);
  el.overScore.textContent = String(score);
  el.overStars.hidden = endless; // the row of ten stars only makes sense for a run of ten doors
  el.overStars.replaceChildren(
    ...Array.from({ length: total }, (_, i) => {
      const star = tag('span', i < score ? 'earned' : '', '⭐');
      star.style.animationDelay = `${0.25 + i * 0.09}s`; // earned stars pop in one after another
      return star;
    }),
  );

  el.overUnlock.hidden = !newest;
  if (newest) {
    el.overUnlockImg.hidden = !thumbs[newest.id];
    if (thumbs[newest.id]) el.overUnlockImg.src = thumbs[newest.id];
    el.overUnlockText.textContent = t.unlocked(nameOf(newest));
  }

  // Only endless runs go on the high score table.
  const madeTheTable = endless && store.qualifies(score);
  el.nameForm.hidden = !madeTheTable;
  el.overButtons.hidden = madeTheTable;
  if (madeTheTable) el.nameInput.value = lastName;

  show('over');
  if (newest) sfx.unlock();
}

// --- High scores ------------------------------------------------------------------

function showScores(highlight = -1) {
  const list = store.get().highScores;
  el.scoreEmpty.hidden = list.length > 0;
  el.scoreList.hidden = list.length === 0;
  el.scoreList.replaceChildren(
    ...list.map((row, i) => {
      const item = tag('li', i === highlight ? 'mine' : '');
      // Medals for the top three, numbers after that.
      const rank = ['🥇', '🥈', '🥉'][i] ?? String(i + 1);
      item.append(tag('span', 'rank', rank), tag('span', 'name', row.name), tag('span', '', `⭐ ${row.score}`));
      return item;
    }),
  );
  show('scores');
}

// --- Language ------------------------------------------------------------------------

// Fills in every fixed word on the page from src/text.js.
function applyWords() {
  document.documentElement.lang = getLanguage() === 'es' ? 'es-MX' : getLanguage();
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
      const button = tag('button', 'lang-btn', label);
      button.type = 'button';
      button.dataset.lang = code;
      button.lang = code;
      button.addEventListener('click', () => {
        setLanguage(code);
        setSpeechLanguage(code);
        store.update({ language: code });
        applyWords();
        applyMute();
        renderStart();
        measureQuestionArea();
      });
      return button;
    }),
  );
}

// --- Sound ---------------------------------------------------------------------------

// The sound button turns off both the sound effects and the voice.
function applyMute() {
  const { muted } = store.get();
  setMuted(muted);
  setSpeechMuted(muted);
  el.mute.textContent = muted ? '🔇' : '🔊';
  el.muteStart.textContent = muted ? t.soundOff : t.soundOn;
}

function toggleMute() {
  store.update({ muted: !store.get().muted });
  applyMute();
  renderVoiceNote();
}

// --- Wiring ----------------------------------------------------------------------------

function wireButtons() {
  $('btn-play').addEventListener('click', () => startRun(false));
  $('btn-endless').addEventListener('click', () => startRun(true));
  // "Play again" repeats whichever kind of run was just played.
  $('btn-again').addEventListener('click', () => startRun(runEndless));
  $('btn-scores-play').addEventListener('click', () => startRun(runEndless));
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
  el.easier.addEventListener('click', () => stepLevel(-1));
  el.harder.addEventListener('click', () => stepLevel(1));

  // Tapping the question says it again.
  el.question.addEventListener('click', () => {
    if (currentQuestion) speak(askText(currentQuestion));
  });

  el.nameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const place = store.addHighScore(el.nameInput.value, lastScore);
    el.nameInput.blur();
    showScores(place);
  });
  // iOS can leave the page scrolled after the keyboard closes.
  el.nameInput.addEventListener('blur', () => window.scrollTo(0, 0));

  // Every button makes a small click sound, except the question, which talks instead.
  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('button');
    if (button && button !== el.question) sfx.tap();
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

  const refit = () => {
    game.resize();
    measureQuestionArea();
  };
  window.addEventListener('resize', refit);
  window.addEventListener('orientationchange', () => setTimeout(refit, 250));
}

async function init() {
  // The title is the same in every language.
  document.title = CONFIG.title;
  // One piece per word, so each word gets its own color.
  el.title.replaceChildren(...CONFIG.title.split(' ').map((word) => tag('span', '', word)));
  el.title.setAttribute('aria-label', CONFIG.title);
  el.nameInput.maxLength = CONFIG.nameMaxLength;
  el.progress.replaceChildren(...Array.from({ length: CONFIG.doorsPerRun }, () => tag('i')));

  // Fetch the hand pictures now, so they are ready when a question needs them.
  for (let fingers = 1; fingers <= 5; fingers++) new Image().src = handPicture(fingers);

  await store.init();
  setLanguage(store.get().language || CONFIG.language);
  setSpeechLanguage(getLanguage());
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
  measureQuestionArea();
  // The list of voices can arrive late; when it does, check again whether the game can talk.
  onVoicesChanged(renderVoiceNote);
  // The letters can arrive late too, and change how tall the question area is.
  document.fonts?.load('700 40px "Fredoka Variable"').then(measureQuestionArea, () => {});

  // A handle for the automatic test player. Only present while developing.
  if (import.meta.env.DEV) window.__game = game;
}

init();
