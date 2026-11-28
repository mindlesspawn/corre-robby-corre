// Menus, buttons, saving, sounds, and the voice. The 3D game itself is in game.js.

// The rounded letters, bundled with the game so they also work with no internet.
import '@fontsource-variable/fredoka';
import './style.css';
import { COLORS, CONFIG } from './config.js';
import { CHARACTERS } from './characters.js';
import { Game } from './game.js';
import { renderThumbnails } from './looks.js';
import { faceParts, faceSpot } from './faces.js';
import { emojiPicture, preloadEmoji, withPictures, write } from './emoji.js';
import { AGES, FINGERS, GAMES, ITEMS, LEVELS, SHAPES, THINGS, gamesFor, stickerFor } from './questions.js';
import { store } from './storage.js';
import { setMuted, sfx, unlockAudio } from './audio.js';
import { setMusic, setMusicSpeed, setMusicVolume, wakeMusic } from './music.js';
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
  // The music switch and slider are on the start screen and on the pause screen.
  musicRows: [...document.querySelectorAll('.music-row')],
  musicButtons: [...document.querySelectorAll('.music-btn')],
  musicSliders: [...document.querySelectorAll('.music-slider')],
  languages: $('languages'),
  paces: $('paces'),
  voiceNote: $('voice-note'),
  title: $('title'),
  stats: $('stats'),
  characters: $('characters'),
  unlockNote: $('unlock-note'),
  games: $('games'),
  ages: $('ages'),
  levels: $('levels'),
  overLevel: $('over-level'),
  overSticker: $('over-sticker'),
  wow: $('wow'),
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

const SCREENS = ['language', 'start', 'settings', 'support', 'over', 'scores', 'pause'];

let game = null;
let thumbs = {};
let screen = 'start';
let lastScore = 0;
let runGame = CONFIG.game; // the game the current run is playing
let runLevel = 0; // the level the current run is playing (0 is the first)
let pickedLevel = null; // an earlier level tapped on the start screen, to play it again
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
  // Any emoji in the text is shown as its picture (see emoji.js).
  if (text !== undefined) node.append(...withPictures(text));
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
  write(el.unlockNote, nextLocked ? unlockMessage(nextLocked, totalPoints) : '');

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
          write(el.unlockNote, unlockMessage(def, store.get().totalPoints));
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
  const list = gamesFor(store.age());
  el.games.style.setProperty('--count', String(list.length));
  // Five games fit one row of narrow tiles; more than that go in rows of four.
  el.games.classList.toggle('five', list.length === 5);
  el.games.classList.toggle('many', list.length > 5);
  el.games.replaceChildren(
    ...list.map((id) => {
      const button = tag('button', 'game-btn');
      button.append(tag('span', 'game-icon', GAMES[id].icon), tag('span', '', t.games[id] ?? id));
      button.type = 'button';
      button.dataset.game = id;
      button.classList.toggle('selected', id === current);
      button.setAttribute('aria-pressed', String(id === current));
      button.addEventListener('click', () => {
        store.update({ game: id });
        pickedLevel = null;
        renderStart();
      });
      return button;
    }),
  );
}

// The age picker. Each age has its own steps in every game (see src/questions.js) and
// its own saved progress, so picking the age is all it takes to hand the game to another child.
function renderAges() {
  const current = store.age();
  el.ages.replaceChildren(
    ...AGES.map((age) => {
      const button = tag('button', 'age-btn', t.ages[age] ?? String(age));
      button.type = 'button';
      button.classList.toggle('selected', age === current);
      button.setAttribute('aria-pressed', String(age === current));
      button.addEventListener('click', () => {
        store.update({ age });
        pickedLevel = null;
        renderStart();
      });
      return button;
    }),
  );
}

// The level about to be played (0 is the first): the next one to clear, unless an
// earlier one was tapped. After all ten are cleared it is the last.
function currentLevel() {
  const next = Math.min(LEVELS - 1, store.cleared());
  return pickedLevel === null ? next : Math.min(pickedLevel, next);
}

// The ten levels of the chosen game: a sticker once cleared, the one about to be played
// lit, and grey until they open. A cleared level can be tapped to play it again.
function renderLevels() {
  const cleared = store.cleared();
  const current = currentLevel();
  const gameId = store.game();
  el.levels.replaceChildren(
    ...Array.from({ length: LEVELS }, (_, i) => {
      // A cleared level shows the sticker it earned, in place of its number.
      const button = tag('button', 'level-btn', i < cleared ? stickerFor(gameId, i) : String(i + 1));
      button.type = 'button';
      button.classList.toggle('done', i < cleared);
      button.classList.toggle('selected', i === current);
      button.disabled = i > cleared;
      button.setAttribute('aria-label', t.levelLabel(i + 1));
      button.setAttribute('aria-pressed', String(i === current));
      button.addEventListener('click', () => {
        pickedLevel = i;
        renderLevels();
      });
      return button;
    }),
  );
}

function renderStart() {
  const { totalPoints, best } = store.get();
  write(el.stats, best > 0 ? `⭐ ${t.points(totalPoints)} · ${t.bestRun(best)}` : `⭐ ${t.points(totalPoints)}`);
  // Points only matter while there is a character left to unlock, so the line is hidden otherwise.
  el.stats.hidden = CHARACTERS.every((def) => isUnlocked(def, totalPoints));
  renderCharacters();
  renderGames();
  renderAges();
  renderLevels();
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
    group.append(emojiPicture(ITEMS[item] ?? ITEMS.apple));
  }
  return group;
}

// A shape for the banner, drawn from the same outline the doors use.
// "face" gives it the same little face the doors have (left off the small ones in a row).
function shapePicture(id, face = false) {
  const space = 'http://www.w3.org/2000/svg';
  const make = (name, attributes) => {
    const node = document.createElementNS(space, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    return node;
  };
  const svg = make('svg', { viewBox: '0 0 100 100', class: 'shape' });
  svg.append(make('path', { d: SHAPES[id] ?? '' }));
  if (face && SHAPES[id]) {
    const spot = faceSpot(SHAPES[id]);
    const { eyes, pupils, smile } = faceParts(spot.x, spot.y, spot.r * 0.8);
    for (const eye of eyes) svg.append(make('circle', { class: 'eye', cx: eye.x, cy: eye.y, r: eye.r }));
    for (const pupil of pupils) svg.append(make('circle', { class: 'pupil', cx: pupil.x, cy: pupil.y, r: pupil.r }));
    const at = (angle) => `${smile.x + smile.r * Math.cos(angle)} ${smile.y + smile.r * Math.sin(angle)}`;
    svg.append(
      make('path', {
        class: 'smile',
        d: `M${at(smile.from)}A${smile.r} ${smile.r} 0 0 1 ${at(smile.to)}`,
        'stroke-width': smile.width,
      }),
    );
  }
  return svg;
}

// A big, bouncy word in rainbow letters with a burst of stars. It comes with spoken
// praise, with a special trick, and when a level is cleared, and it is over in a second.
// It only ever follows a right answer, so it marks the learning without competing with it:
// research on children's apps finds that effects tied to the task help, and extras that
// keep going or have nothing to do with it get in the way (see the README).
const WOW_COLORS = ['#e53935', '#fb8c00', '#fbc02d', '#43a047', '#1e88e5', '#8e24aa'];
let wowTimer = 0;

function wow(text, big = false) {
  const word = tag('span', 'wow-word');
  let colored = 0;
  for (const letter of text) {
    const span = tag('span', '', letter);
    if (letter.trim()) span.style.color = WOW_COLORS[colored++ % WOW_COLORS.length];
    word.append(span);
  }
  const count = big ? 14 : 8;
  const stars = Array.from({ length: count }, (_, i) => {
    const star = tag('span', 'wow-star', '⭐');
    star.style.setProperty('--turn', `${(360 / count) * i}deg`);
    return star;
  });
  el.wow.replaceChildren(...stars, word);
  el.wow.classList.toggle('big', big);
  el.wow.hidden = false;
  replay(el.wow, 'go');
  clearTimeout(wowTimer);
  wowTimer = setTimeout(() => {
    el.wow.hidden = true;
  }, big ? 1900 : 1300);
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
      parts.push(question.kind === 'thing' ? tag('span', 'picture', THINGS[question.answer]) : shapePicture(question.answer, true));
    } else {
      parts.push(tag('span', 'listen', '🔊'));
    }
  } else if (question.kind === 'after') {
    // "3, 4, 5, ?": the numbers leading up to the missing one.
    const row = tag('span', 'counting');
    for (let n = Math.max(1, question.n - 2); n <= question.n; n++) row.append(tag('span', '', String(n)));
    row.append(tag('span', solved ? 'answer' : 'missing', solved ? String(question.answer) : '?'));
    parts.push(row);
  } else if (question.kind === 'pattern') {
    const piece = (id) => {
      if (question.of === 'shapes') return shapePicture(id);
      const swatch = tag('span', 'swatch');
      swatch.style.background = COLORS[id];
      return swatch;
    };
    const row = tag('span', 'pattern');
    row.append(...question.sequence.map(piece));
    if (solved) {
      const next = piece(question.answer);
      next.classList.add('next');
      row.append(next);
    } else {
      row.append(tag('span', 'missing', '?'));
    }
    parts.push(row);
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
  runLevel = currentLevel();
  runResults = [];
  currentQuestion = null;
  game.setCharacter(currentCharacter());
  setMusicSpeed(1);
  el.score.textContent = '0';
  el.question.replaceChildren();
  el.question.className = 'question';
  el.ask.textContent = '';
  showProgress();
  el.hint.hidden = false;
  show('play');
  game.startRun({
    game: runGame,
    age: store.age(),
    level: runLevel,
    reached: store.cleared(runGame),
    pace: currentPace(),
    endless: runEndless,
  });
  // Nothing is spoken in an endless run: it has sounds only.
  if (runEndless) stopSpeaking();
  // Said inside the tap, which is what lets the voice work on iPhones and iPads.
  else speak(t.say.go);
}

// Adds a run's points and progress to the saved totals. Returns what changed.
function bankRun(score) {
  const before = store.get();
  const totalPoints = before.totalPoints + score;
  const unlocked = CHARACTERS.filter((def) => def.unlockAt > before.totalPoints && def.unlockAt <= totalPoints);
  const newest = unlocked[unlocked.length - 1];
  store.update({
    totalPoints,
    // "Best" is the best endless run. An endless run does not move a child up or down the steps.
    best: runEndless ? Math.max(before.best, score) : before.best,
    // A newly unlocked character is picked straight away. It can be changed on the start screen.
    ...(newest ? { character: newest.id } : {}),
  });
  return { newest, lastName: before.lastName };
}

function goHome() {
  stopSpeaking();
  el.wow.hidden = true;
  setMusicSpeed(1);
  // Leaving a run early still keeps the points and progress earned so far.
  if (screen === 'pause') bankRun(game.score);
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
    // An endless run has sounds but no talking, and its music speeds up with the belt.
    if (runEndless) {
      setMusicSpeed(Math.sqrt(CONFIG.paces[currentPace()].travel / game.row.travelTime));
      return;
    }
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
      if (!info.endless && (info.trick || info.score % 2 === 1)) {
        const praise = pick(t.say.praise);
        speak(praise);
        wow(praise, info.trick);
      }
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
    setMusicSpeed(1);
    if (endless) {
      // The right answer stays on show, and the fanfare waits for the bump sound to finish.
      setTimeout(() => sfx.fanfare(), 450);
      return;
    }
    el.question.replaceChildren();
    el.ask.textContent = '';
    sfx.fanfare();
    // Clearing a level is the big moment.
    if (score >= CONFIG.clearAt) wow(t.levelDone(runLevel + 1), true);
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

function finishRun({ score, total, endless }) {
  lastScore = score;
  const { newest, lastName } = bankRun(score);

  // Enough right answers clear the level and open the next one. Playing a cleared level
  // again changes nothing, and an endless run is not a level.
  const cleared = store.cleared(runGame);
  const passed = !endless && score >= CONFIG.clearAt;
  if (passed && runLevel === cleared) store.setCleared(runGame, cleared + 1);
  pickedLevel = null;
  el.wow.hidden = true;
  el.overLevel.hidden = endless;
  $('btn-over-scores').hidden = !endless; // the high score table is for endless runs
  el.overLevel.classList.toggle('passed', passed);
  if (passed) write(el.overLevel, store.cleared(runGame) >= LEVELS ? t.allCleared : t.levelCleared(runLevel + 1));
  else write(el.overLevel, t.levelAgain(runLevel + 1, CONFIG.clearAt));
  // A child who has cleared all ten levels of a game is moved on to the next game that
  // still has levels to clear, so the big button always leads somewhere new.
  if (!endless && store.cleared(runGame) >= LEVELS) {
    const list = gamesFor(store.age());
    const from = list.indexOf(runGame);
    const next = [...list.slice(from + 1), ...list.slice(0, from)].find((id) => store.cleared(id) < LEVELS);
    if (next) store.update({ game: next });
  }
  // The big button shows what it will start: the game's picture and the level's number.
  $('btn-again').replaceChildren(
    ...(endless
      ? [tag('span', 'next-icon', '♾️')]
      : [tag('span', 'next-icon', GAMES[store.game()].icon), tag('span', 'next-level', String(currentLevel() + 1))]),
  );
  // A cleared level earns its sticker.
  el.overSticker.hidden = !passed;
  write(el.overSticker, passed ? stickerFor(runGame, runLevel) : '');

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
  if (newest || passed) sfx.unlock();
}

// --- Support ------------------------------------------------------------------------

// The places a grown-up can leave a tip, from src/config.js. Only https addresses count.
const supportLinks = () =>
  (CONFIG.support ?? []).filter((link) => typeof link?.url === 'string' && link.url.startsWith('https://'));

// The support button is only on the settings screen when there is somewhere for it to go.
function renderSupportButton() {
  $('btn-support').hidden = supportLinks().length === 0;
}

// The support page takes money matters out of a child's reach twice over: it is on the
// settings screen, and it opens with a times-table question a small child cannot answer.
// A wrong answer goes back to the settings screen.
function openSupport() {
  const [a, b] = [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)];
  const right = a * b;
  const answers = new Set([right]);
  for (const other of [right + a, right - b, right + 10, right - 7, right + 3]) {
    if (answers.size < 4 && other > 0) answers.add(other);
  }
  $('gate-ask').textContent = t.gateAsk(a, b);
  $('gate-answers').replaceChildren(
    ...[...answers]
      .sort(() => Math.random() - 0.5)
      .map((value) => {
        const button = tag('button', 'small-btn', String(value));
        button.type = 'button';
        button.addEventListener('click', () => {
          if (value !== right) {
            show('settings');
            return;
          }
          $('support-gate').hidden = true;
          $('support-page').hidden = false;
        });
        return button;
      }),
  );
  $('support-links').replaceChildren(
    ...supportLinks().map((link) => {
      const anchor = tag('a', 'big-btn support-link', `${link.icon ? `${link.icon} ` : ''}${link.name ?? ''}`);
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      return anchor;
    }),
  );
  $('support-gate').hidden = false;
  $('support-page').hidden = true;
  show('support');
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
  for (const node of document.querySelectorAll('[data-t]')) write(node, t[node.dataset.t]);
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
      button.addEventListener('click', () => chooseLanguage(code));
      return button;
    }),
  );
}

// Switches the whole game, words and voice, to a language and remembers it.
function chooseLanguage(code) {
  setLanguage(code);
  setSpeechLanguage(code);
  store.update({ language: code });
  applyWords();
  applyMute();
  renderStart();
  measureQuestionArea();
}

// The first-time screen: one big button for each language, with its flag. The language
// of the phone or tablet goes first. Picking one says "let us go" in that language and
// opens the start screen.
function buildLanguagePick() {
  const device = (navigator.language ?? '').toLowerCase().slice(0, 2);
  const order = [...LANGUAGES].sort((a, b) => Number(b.code === device) - Number(a.code === device));
  $('language-pick').replaceChildren(
    ...order.map(({ code, label, flag }) => {
      const button = tag('button', 'language-btn');
      button.append(tag('span', 'flag', flag));
      button.append(tag('span', '', label));
      button.type = 'button';
      button.lang = code;
      button.addEventListener('click', () => {
        chooseLanguage(code);
        show('start');
        speak(t.say.go);
      });
      return button;
    }),
  );
}

// --- Sound ---------------------------------------------------------------------------

// The sound button turns off everything: sound effects, voice, and music.
// The music button and the music slider change only the music.
function applyMute() {
  const { muted, music, musicVolume } = store.get();
  const playing = music && !muted && musicVolume > 0;
  setMuted(muted);
  setSpeechMuted(muted);
  setMusicVolume(musicVolume);
  setMusic(playing);
  write(el.mute, muted ? '🔇' : '🔊');
  write(el.muteStart, muted ? t.soundOff : t.soundOn);
  el.muteStart.classList.toggle('off', muted);
  el.muteStart.setAttribute('aria-pressed', String(!muted));
  for (const row of el.musicRows) row.classList.toggle('off', !playing);
  for (const button of el.musicButtons) {
    button.classList.toggle('off', !playing);
    button.setAttribute('aria-pressed', String(playing));
  }
  for (const slider of el.musicSliders) {
    slider.value = String(Math.round(musicVolume * 100));
    slider.style.setProperty('--v', String(musicVolume));
  }
}

function toggleMute() {
  store.update({ muted: !store.get().muted });
  applyMute();
  renderVoiceNote();
}

function toggleMusic() {
  const { muted, music, musicVolume } = store.get();
  const playing = music && !muted && musicVolume > 0;
  // Asking for music while all sound is off turns the sound back on too,
  // and a slider left at zero goes back to where it started.
  if (playing) store.update({ music: false });
  else store.update({ muted: false, music: true, musicVolume: musicVolume > 0 ? musicVolume : 0.65 });
  applyMute();
  renderVoiceNote();
}

// Sliding to zero turns the music off. Sliding up from anywhere turns it on.
function slideMusic(slider) {
  const musicVolume = Math.min(1, Math.max(0, Number(slider.value) / 100 || 0));
  if (musicVolume > 0) store.update({ muted: false, music: true, musicVolume });
  else store.update({ music: false, musicVolume: 0 });
  applyMute();
  renderVoiceNote();
}

// --- Wiring ----------------------------------------------------------------------------

function wireButtons() {
  $('btn-play').addEventListener('click', () => startRun(false));
  $('btn-endless').addEventListener('click', () => startRun(true));
  // "Play again" repeats whichever kind of run was just played.
  $('btn-again').addEventListener('click', () => startRun(runEndless));
  $('btn-scores-play').addEventListener('click', () => startRun(true));
  $('btn-scores').addEventListener('click', () => showScores());
  $('btn-settings').addEventListener('click', () => {
    renderSupportButton();
    show('settings');
  });
  $('btn-support').addEventListener('click', openSupport);
  $('btn-gate-back').addEventListener('click', () => show('settings'));
  $('btn-support-back').addEventListener('click', () => show('settings'));
  $('btn-settings-done').addEventListener('click', () => {
    renderStart();
    show('start');
  });
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
  for (const button of el.musicButtons) button.addEventListener('click', toggleMusic);
  for (const slider of el.musicSliders) {
    slider.addEventListener('input', () => slideMusic(slider));
    // Let go of the slider afterwards, so the arrow keys go back to moving the runner.
    slider.addEventListener('change', () => slider.blur());
  }

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
  // iOS only plays sound after a touch, so wake the sound, and the music, on every one.
  const wake = () => {
    unlockAudio();
    wakeMusic();
  };
  for (const type of ['pointerdown', 'pointerup', 'touchend', 'click']) {
    document.addEventListener(type, wake, { capture: true, passive: true });
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

  // A phone is played upright. Held sideways, the game pauses and shows a phone turning
  // back up. A tablet (anything at least 540 points on its short side) may be held either
  // way. The screen's own size is used, not the window's, so a keyboard opening does not
  // look like the phone being turned.
  // (A browser that does not report its screen falls back to the size of the window.)
  const shortSide = Math.min(window.screen.width, window.screen.height) || Math.min(window.innerWidth, window.innerHeight);
  const isPhone = shortSide < 540;
  const sideways = window.matchMedia('(orientation: landscape)');
  const checkTurn = () => {
    const type = window.screen.orientation?.type;
    const turned = isPhone && (type ? type.startsWith('landscape') : sideways.matches);
    $('rotate').hidden = !turned;
    if (turned) pauseRun();
  };
  sideways.addEventListener?.('change', checkTurn);
  window.screen.orientation?.addEventListener?.('change', checkTurn);
  checkTurn();
  // Where the device lets a page hold its direction (an installed app on Android), hold it.
  if (isPhone) window.screen.orientation?.lock?.('portrait')?.catch?.(() => {});

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
  // The same for the little pictures on the doors and in the banner (see emoji.js).
  preloadEmoji([...Object.values(THINGS), ...Object.values(ITEMS), '⭐', '🔊']);

  await store.init();
  // With no language picked yet, the game opens on the screen for picking one.
  const pickedLanguage = store.get().language;
  setLanguage(pickedLanguage || CONFIG.language);
  setSpeechLanguage(getLanguage());
  buildLanguageButtons();
  buildLanguagePick();
  applyWords();
  // The buttons that are a picture and no words (the gear, the house, the music note).
  for (const node of document.querySelectorAll('[data-emoji]')) write(node, node.dataset.emoji);
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
  show(pickedLanguage ? 'start' : 'language');
  measureQuestionArea();
  // The list of voices can arrive late; when it does, check again whether the game can talk.
  onVoicesChanged(renderVoiceNote);
  // The letters can arrive late too, and change how tall the question area is.
  document.fonts?.load('700 40px "Fredoka Variable"').then(measureQuestionArea, () => {});

  // A handle for the automatic test player. Only present while developing.
  if (import.meta.env.DEV) window.__game = game;
}

init();
