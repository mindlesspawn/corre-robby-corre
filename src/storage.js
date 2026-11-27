// Everything the game remembers between sessions goes through this file.
//
// readRaw() and writeRaw() are the only two functions that touch the device. On the
// website they use the browser's storage; inside the iOS app they use the phone's own.

import { CONFIG } from './config.js';
import { AGES, GAME_IDS, LEVELS, ageOrDefault, gameOrDefault } from './questions.js';
import { t } from './text.js';

const KEY = 'number-run-save-v1';

// Raised when the rules of a run change so much that old scores no longer compare,
// or simply to wipe the high score table everywhere (each device clears it on its next visit).
// Older saves keep their points and characters but start a fresh high score table.
const RULES = 4;

const DEFAULTS = {
  rules: RULES,
  totalPoints: 0, // points across all games, used for unlocks
  best: 0, // best single run
  highScores: [], // [{ name, score, date }]
  lastName: '', // remembered so it does not have to be typed again
  character: 'apple',
  muted: false,
  music: true, // the quiet tune in the background
  musicVolume: 0.65, // where the music slider sits, from 0 to 1
  language: '', // empty means: use the starting language from config.js
  pace: '', // belt speed: 'slow', 'normal' or 'fast'; empty means the starting speed from config.js
  game: '', // empty means: use the starting game from config.js
  age: 0, // the age picked on the start screen: 3, 4, 5 or 6 (six and older); 0 means the one in config.js
  cleared: {}, // how many levels are cleared in each game, kept apart for each age: { 3: { numbers: 4 } }
};

// Inside the iOS app the save goes into the phone's own settings store, which iOS keeps
// for as long as the app is installed. (It can clear a web page's storage when space is
// short.) On the website nothing changes: the save stays in the browser.
const inApp = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;
let phoneStore = null;
async function nativeStore() {
  phoneStore ??= (await import('@capacitor/preferences')).Preferences;
  return phoneStore;
}

async function readRaw() {
  try {
    if (inApp()) return (await (await nativeStore()).get({ key: KEY })).value;
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

async function writeRaw(text) {
  try {
    if (inApp()) {
      await (await nativeStore()).set({ key: KEY, value: text });
      return;
    }
    window.localStorage.setItem(KEY, text);
  } catch {
    // Saving can fail in private browsing. The game still works, it just forgets.
  }
}

const wholeNumber = (value) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);

export function cleanName(name) {
  const tidy = String(name ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, CONFIG.nameMaxLength);
  return tidy || t.defaultName;
}

function cleanScores(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((row) => row && typeof row === 'object')
    .map((row) => ({
      name: cleanName(row.name),
      score: wholeNumber(row.score),
      date: typeof row.date === 'string' ? row.date : '',
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, CONFIG.highScoreSlots);
}

function cleanCleared(saved) {
  const cleared = {};
  for (const age of AGES) {
    cleared[age] = {};
    for (const id of GAME_IDS) cleared[age][id] = Math.min(LEVELS, wholeNumber(saved?.[age]?.[id]));
  }
  return cleared;
}

let state = { ...DEFAULTS, cleared: cleanCleared({}) };

export const store = {
  async init() {
    const raw = await readRaw();
    if (!raw) return state;
    try {
      const saved = JSON.parse(raw);
      const sameRules = saved.rules === RULES;
      state = {
        rules: RULES,
        totalPoints: wholeNumber(saved.totalPoints),
        best: sameRules ? wholeNumber(saved.best) : 0,
        highScores: sameRules ? cleanScores(saved.highScores) : [],
        lastName: typeof saved.lastName === 'string' ? saved.lastName.slice(0, CONFIG.nameMaxLength) : '',
        character: typeof saved.character === 'string' ? saved.character : DEFAULTS.character,
        muted: saved.muted === true,
        music: saved.music !== false,
        musicVolume:
          Number.isFinite(saved.musicVolume) && saved.musicVolume >= 0 && saved.musicVolume <= 1
            ? saved.musicVolume
            : DEFAULTS.musicVolume,
        pace: typeof saved.pace === 'string' ? saved.pace : '',
        language: typeof saved.language === 'string' ? saved.language : '',
        game: typeof saved.game === 'string' ? saved.game : '',
        age: AGES.includes(saved.age) ? saved.age : 0,
        cleared: cleanCleared(saved.cleared),
      };
    } catch {
      state = { ...DEFAULTS, cleared: cleanCleared({}) };
    }
    return state;
  },

  get() {
    return state;
  },

  update(patch) {
    state = { ...state, ...patch };
    writeRaw(JSON.stringify(state));
    return state;
  },

  // The game being played, and the child's progress in it.
  game() {
    return gameOrDefault(state.game, this.age());
  },

  // The age picked on the start screen. Each age has its own levels and its own progress,
  // so two children of different ages can share a device.
  age() {
    return ageOrDefault(state.age);
  },

  // How many levels of a game are cleared, for the age that is picked.
  cleared(gameId = this.game()) {
    return state.cleared[this.age()]?.[gameId] ?? 0;
  },

  setCleared(gameId, count) {
    const age = this.age();
    const levels = Math.min(LEVELS, wholeNumber(count));
    this.update({ cleared: { ...state.cleared, [age]: { ...state.cleared[age], [gameId]: levels } } });
  },

  // True when a score earns a place in the high score table.
  qualifies(score) {
    if (score < 1) return false;
    const list = state.highScores;
    return list.length < CONFIG.highScoreSlots || score > list[list.length - 1].score;
  },

  // Adds a score and returns its position in the table (0 = top).
  addHighScore(name, score) {
    const entry = { name: cleanName(name), score: wholeNumber(score), date: new Date().toISOString() };
    const list = [...state.highScores];
    // Goes below older scores of the same value.
    let index = list.findIndex((row) => row.score < entry.score);
    if (index === -1) index = list.length;
    list.splice(index, 0, entry);
    this.update({ highScores: list.slice(0, CONFIG.highScoreSlots), lastName: entry.name });
    return index;
  },
};
