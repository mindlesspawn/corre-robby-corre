// Every word the player sees or hears, in each language.
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
  hint: 'Toca la puerta correcta',
  noScores: 'Todavía no hay puntajes. ¡Sé el primero!',
  nameLabel: '¡Entraste a los mejores puntajes! Escribe tu nombre:',
  defaultName: 'Jugador',
  scoreBefore: '¡Acertaste ',
  scoreAfter: '!',
  allUnlocked: '¡Todos los personajes desbloqueados!',
  cannotShow: 'Lo sentimos, este dispositivo no puede mostrar el juego.',
  labelScore: 'Estrellas',
  labelSound: 'Activar o quitar el sonido',
  labelPause: 'Pausa',
  labelEasier: 'Más fácil',
  labelHarder: 'Más difícil',
  labelRepeat: 'Repetir la pregunta',
  points: (n) => (n === 1 ? '1 punto' : `${n} puntos`),
  bestRun: (n) => `Mejor carrera: ${n}`,
  toUnlock: (need, name) => `${need === 1 ? 'Falta' : 'Faltan'} ${need} ⭐ para desbloquear: ${name}`,
  lockedLabel: (name, cost) => `${name}, bloqueado. Necesita ${cost} puntos.`,
  unlocked: (name) => `¡Desbloqueaste: ${name}!`,
  overTitle: {
    amazing: '¡Increíble!',
    great: '¡Muy bien!',
    nice: '¡Buen trabajo!',
    zero: '¡Sigue intentando!',
  },

  // The games on the start screen.
  games: { numbers: 'Números', colors: 'Colores' },

  // The step picker on the start screen, for grown-ups.
  level: (n) => `Nivel ${n}`,
  levelName: (step) => {
    if (step.kind === 'same') return `oír el número y buscarlo, hasta ${step.max}`;
    if (step.kind === 'count') return `contar hasta ${step.max}`;
    if (step.kind === 'find') return `del número a los puntos, hasta ${step.max}`;
    if (step.kind === 'color') {
      return step.show ? `ver y encontrar ${step.colors.length} colores` : `escuchar y encontrar ${step.colors.length} colores`;
    }
    if (step.oneMore) return 'uno más';
    if (step.maxSum > 20) return 'sumas con números grandes';
    return `sumas hasta ${step.maxSum}`;
  },

  colorNames: {
    red: 'rojo',
    blue: 'azul',
    yellow: 'amarillo',
    green: 'verde',
    orange: 'naranja',
    purple: 'morado',
    pink: 'rosa',
  },

  // The things shown to count: [one, many]. All are "una ..." words, so the sentences below work.
  items: {
    apple: ['manzana', 'manzanas'],
    star: ['estrella', 'estrellas'],
    ball: ['pelota', 'pelotas'],
    flower: ['flor', 'flores'],
    strawberry: ['fresa', 'fresas'],
    butterfly: ['mariposa', 'mariposas'],
    frog: ['rana', 'ranas'],
  },

  // What the voice says. Numbers are written as digits; the voice reads them as words.
  say: {
    go: '¡Vamos!',
    same: (n, [one, many]) => (n === 1 ? `Una ${one}. ¿Dónde hay una?` : `${n} ${many}. ¿Dónde hay ${n}?`),
    count: ([, many]) => `¿Cuántas ${many} hay?`,
    find: (n) => `¿Dónde hay ${n}?`,
    add: (a, b) => `¿Cuánto es ${a} más ${b}?`,
    color: (name) => `Busca el color ${name}`,
    isCount: (n, [one, many]) => (n === 1 ? `Hay una ${one}` : `Hay ${n} ${many}`),
    isFind: (n) => `Aquí hay ${n}`,
    isAdd: (a, b, sum) => `${a} más ${b} son ${sum}`,
    isColor: (name) => `Este es el ${name}`,
    praise: ['¡Muy bien!', '¡Bravo!', '¡Eso es!', '¡Genial!', '¡Sí!', '¡Excelente!'],
    finish: (n) => (n === 1 ? '¡Ganaste una estrella!' : `¡Ganaste ${n} estrellas!`),
    finishZero: '¡Buen intento! Vamos otra vez.',
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
  hint: 'Tap the right door',
  noScores: 'No scores yet. Be the first!',
  nameLabel: 'You made the high scores! Type your name:',
  defaultName: 'Player',
  scoreBefore: 'You got ',
  scoreAfter: ' right!',
  allUnlocked: 'All characters unlocked!',
  cannotShow: 'Sorry, this device cannot show the game.',
  labelScore: 'Stars',
  labelSound: 'Sound on or off',
  labelPause: 'Pause',
  labelEasier: 'Easier',
  labelHarder: 'Harder',
  labelRepeat: 'Say the question again',
  points: (n) => (n === 1 ? '1 point' : `${n} points`),
  bestRun: (n) => `Best run: ${n}`,
  toUnlock: (need, name) => `${need} more ⭐ to unlock: ${name}`,
  lockedLabel: (name, cost) => `${name}, locked. Needs ${cost} points.`,
  unlocked: (name) => `You unlocked: ${name}!`,
  overTitle: {
    amazing: 'Amazing!',
    great: 'Great job!',
    nice: 'Good work!',
    zero: 'Keep trying!',
  },

  games: { numbers: 'Numbers', colors: 'Colors' },

  level: (n) => `Level ${n}`,
  levelName: (step) => {
    if (step.kind === 'same') return `hear the number and find it, up to ${step.max}`;
    if (step.kind === 'count') return `count up to ${step.max}`;
    if (step.kind === 'find') return `number to dots, up to ${step.max}`;
    if (step.kind === 'color') {
      return step.show ? `see and find ${step.colors.length} colors` : `listen and find ${step.colors.length} colors`;
    }
    if (step.oneMore) return 'one more';
    if (step.maxSum > 20) return 'sums with big numbers';
    return `sums up to ${step.maxSum}`;
  },

  colorNames: {
    red: 'red',
    blue: 'blue',
    yellow: 'yellow',
    green: 'green',
    orange: 'orange',
    purple: 'purple',
    pink: 'pink',
  },

  items: {
    apple: ['apple', 'apples'],
    star: ['star', 'stars'],
    ball: ['ball', 'balls'],
    flower: ['flower', 'flowers'],
    strawberry: ['strawberry', 'strawberries'],
    butterfly: ['butterfly', 'butterflies'],
    frog: ['frog', 'frogs'],
  },

  say: {
    go: "Let's go!",
    same: (n, [one, many]) => (n === 1 ? `1 ${one}. Where is 1 dot?` : `${n} ${many}. Where are ${n} dots?`),
    count: ([, many]) => `How many ${many}?`,
    find: (n) => (n === 1 ? 'Where is 1 dot?' : `Where are ${n} dots?`),
    add: (a, b) => `What is ${a} plus ${b}?`,
    color: (name) => `Find the color ${name}`,
    isCount: (n, [one, many]) => (n === 1 ? `There is 1 ${one}` : `There are ${n} ${many}`),
    isFind: (n) => (n === 1 ? 'Here is 1 dot' : `Here are ${n} dots`),
    isAdd: (a, b, sum) => `${a} plus ${b} is ${sum}`,
    isColor: (name) => `This one is ${name}`,
    praise: ['Great job!', 'Yes!', 'Well done!', 'Awesome!', 'You got it!', 'Super!'],
    finish: (n) => (n === 1 ? 'You got 1 star!' : `You got ${n} stars!`),
    finishZero: "Good try! Let's go again.",
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

// What the voice asks for a question, and what it says to show the right answer.
export function askText(question) {
  const { say } = t;
  if (question.kind === 'same') return say.same(question.answer, t.items[question.item]);
  if (question.kind === 'count') return say.count(t.items[question.item]);
  if (question.kind === 'find') return say.find(question.answer);
  if (question.kind === 'color') return say.color(t.colorNames[question.answer]);
  return say.add(question.a, question.b);
}

export function answerText(question) {
  const { say } = t;
  if (question.kind === 'same' || question.kind === 'count') return say.isCount(question.answer, t.items[question.item]);
  if (question.kind === 'find') return say.isFind(question.answer);
  if (question.kind === 'color') return say.isColor(t.colorNames[question.answer]);
  return say.isAdd(question.a, question.b, question.answer);
}
