// Everything the game remembers between sessions goes through this file.
//
// readRaw() and writeRaw() are the only two functions that touch the device.
// For the iOS app, swap their insides for native storage and nothing else changes.

import { CONFIG } from './config.js';
import { GAME_IDS, gameOrDefault } from './questions.js';
import { t } from './text.js';

const KEY = 'number-run-save-v1';

// Raised when the rules of a run change so much that old scores no longer compare.
// Older saves keep their points and characters but start a fresh high score table.
const RULES = 2;

const DEFAULTS = {
  rules: RULES,
  totalPoints: 0, // points across all games, used for unlocks
  best: 0, // best single run
  highScores: [], // [{ name, score, date }]
  lastName: '', // remembered so it does not have to be typed again
  character: 'apple',
  muted: false,
  language: '', // empty means: use the starting language from config.js
  pace: '', // belt speed: 'slow', 'normal' or 'fast'; empty means the starting speed from config.js
  game: '', // empty means: use the starting game from config.js
  skills: {}, // progress up each game's ladder: { numbers: 12, colors: 3 }
};

async function readRaw() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

async function writeRaw(text) {
  try {
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

function cleanSkills(saved) {
  const skills = {};
  for (const id of GAME_IDS) skills[id] = wholeNumber(saved?.[id]);
  return skills;
}

let state = { ...DEFAULTS, skills: cleanSkills({}) };

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
        pace: typeof saved.pace === 'string' ? saved.pace : '',
        language: typeof saved.language === 'string' ? saved.language : '',
        game: typeof saved.game === 'string' ? saved.game : '',
        skills: cleanSkills(saved.skills),
      };
    } catch {
      state = { ...DEFAULTS, skills: cleanSkills({}) };
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
    return gameOrDefault(state.game);
  },

  skill(gameId = this.game()) {
    return state.skills[gameId] ?? 0;
  },

  setSkill(gameId, value) {
    this.update({ skills: { ...state.skills, [gameId]: wholeNumber(value) } });
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
