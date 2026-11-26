// Every word the player sees, in each language.
// The game starts in the language set in src/config.js (CONFIG.language).
// The player can switch on the start screen, and the choice is remembered on that device.
// To add a language, copy one block, translate it, and add it to TEXT and LANGUAGES at the bottom.

import { CONFIG } from './config.js';

const es = {
  play: 'Jugar',
  playAgain: 'Jugar otra vez',
  scoresButton: '🏆 Récords',
  scoresTitle: '🏆 Mejores puntajes',
  home: 'Inicio',
  save: 'Guardar',
  paused: 'En pausa',
  resume: 'Seguir',
  soundOn: '🔊 Con sonido',
  soundOff: '🔇 Sin sonido',
  hint: 'Toca la puerta con la respuesta correcta',
  catchUp: '¡Avanza!',
  noScores: 'Todavía no hay puntajes. ¡Sé el primero!',
  nameLabel: '¡Entraste a los mejores puntajes! Escribe tu nombre:',
  defaultName: 'Jugador',
  scoreBefore: '¡Acertaste ',
  scoreAfter: '!',
  bestYet: '¡Es tu mejor carrera!',
  allUnlocked: '¡Todos los personajes desbloqueados!',
  cannotShow: 'Lo sentimos, este dispositivo no puede mostrar el juego.',
  labelScore: 'Puntos',
  labelSound: 'Activar o quitar el sonido',
  labelPause: 'Pausa',
  points: (n) => (n === 1 ? '1 punto' : `${n} puntos`),
  bestRun: (n) => `Mejor carrera: ${n}`,
  toUnlock: (need, name) => `${need === 1 ? 'Falta' : 'Faltan'} ${need} ⭐ para desbloquear: ${name}`,
  lockedLabel: (name, cost) => `${name}, bloqueado. Necesita ${cost} puntos.`,
  unlocked: (name) => `¡Desbloqueaste: ${name}!`,
  overTitle: {
    newBest: '¡Nuevo récord!',
    amazing: '¡Increíble!',
    great: '¡Qué buena carrera!',
    nice: '¡Buen intento!',
    zero: '¡Sigue intentando!',
  },
};

const en = {
  play: 'Play',
  playAgain: 'Play again',
  scoresButton: '🏆 High scores',
  scoresTitle: '🏆 High scores',
  home: 'Home',
  save: 'Save',
  paused: 'Paused',
  resume: 'Keep going',
  soundOn: '🔊 Sound on',
  soundOff: '🔇 Sound off',
  hint: 'Tap the door with the right answer',
  catchUp: 'Catch up!',
  noScores: 'No scores yet. Be the first!',
  nameLabel: 'You made the high scores! Type your name:',
  defaultName: 'Player',
  scoreBefore: 'You got ',
  scoreAfter: ' right!',
  bestYet: 'That is your best run yet!',
  allUnlocked: 'All characters unlocked!',
  cannotShow: 'Sorry, this device cannot show the game.',
  labelScore: 'Score',
  labelSound: 'Sound on or off',
  labelPause: 'Pause',
  points: (n) => (n === 1 ? '1 point' : `${n} points`),
  bestRun: (n) => `Best run: ${n}`,
  toUnlock: (need, name) => `${need} more ⭐ to unlock: ${name}`,
  lockedLabel: (name, cost) => `${name}, locked. Needs ${cost} points.`,
  unlocked: (name) => `You unlocked: ${name}!`,
  overTitle: {
    newBest: 'New best!',
    amazing: 'Amazing!',
    great: 'Great running!',
    nice: 'Nice try!',
    zero: 'Good try!',
  },
};

const TEXT = { es, en };

// The choices shown on the start screen, each named in its own language.
export const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

let current = TEXT[CONFIG.language] ? CONFIG.language : 'es';

// The words in use right now. setLanguage() swaps them in place,
// so every file that imported "t" sees the new language at once.
export const t = { ...TEXT[current] };

export function getLanguage() {
  return current;
}

export function setLanguage(code) {
  if (!TEXT[code]) return current;
  current = code;
  Object.assign(t, TEXT[code]);
  return current;
}

// A character's name can be one word for every language ('Apple')
// or one per language ({ es: 'Manzana', en: 'Apple' }).
export function nameOf(def) {
  if (typeof def.name === 'string') return def.name;
  return def.name?.[current] ?? Object.values(def.name ?? {})[0] ?? def.id;
}
