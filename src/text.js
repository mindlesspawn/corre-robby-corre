// Every word the player sees or hears, in each language.
// The game starts in the language set in src/config.js (CONFIG.language).
// The player can switch on the start screen, and the choice is remembered on that device.
// To add a language, copy one block, translate it, and add it to TEXT and LANGUAGES at the bottom.

import { CONFIG } from './config.js';

const es = {
  play: 'Jugar',
  endless: '♾️ Sin fin',
  playAgain: 'Jugar otra vez',
  scoresButton: '🏆 Récords',
  scoresTitle: '🏆 Récords de Sin fin',
  home: 'Inicio',
  save: 'Guardar',
  paused: 'En pausa',
  resume: 'Seguir',
  hint: 'Toca la puerta correcta',
  noScores: 'Todavía no hay puntajes. ¡Sé el primero!',
  nameLabel: '¡Entraste a los mejores puntajes! Escribe tu nombre:',
  defaultName: 'Jugador',
  scoreBefore: '¡Acertaste ',
  scoreAfter: '!',
  allUnlocked: '¡Todos los personajes desbloqueados!',
  cannotShow: 'Lo sentimos, este dispositivo no puede mostrar el juego.',
  noVoice: 'Este dispositivo no tiene voz en español, así que no habla. Las preguntas salen escritas.',
  labelScore: 'Estrellas',
  labelSound: 'Activar o quitar el sonido',
  labelMusic: 'Poner o quitar la música',
  labelMusicVolume: 'Volumen de la música',
  labelPause: 'Pausa',
  labelEasier: 'Más fácil',
  labelHarder: 'Más difícil',
  labelRepeat: 'Repetir la pregunta',
  paces: { slow: '🐢 Lento', normal: 'Normal', fast: '🐇 Rápido' },
  points: (n) => (n === 1 ? '1 punto' : `${n} puntos`),
  bestRun: (n) => `Récord sin fin: ${n}`,
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
  games: { numbers: 'Números', colors: 'Colores', princess: 'Princesa', shapes: 'Figuras' },

  // The step picker on the start screen, for grown-ups.
  level: (n) => `Nivel ${n}`,
  levelName: (step) => {
    if (step.kind === 'same') return `oír el número y buscarlo, hasta ${step.max}`;
    if (step.kind === 'count') return step.doors === 'both' ? `contar hasta ${step.max}, número con puntos` : `contar hasta ${step.max}`;
    if (step.kind === 'find') return `del número a los puntos, hasta ${step.max}`;
    if (step.kind === 'compare') return step.gap > 1 ? 'dónde hay más o menos (fácil)' : `dónde hay más o menos, hasta ${step.max}`;
    if (step.kind === 'more') return step.gap > 1 ? 'dónde hay más (fácil)' : `dónde hay más, hasta ${step.max}`;
    if (step.kind === 'fewer') return `dónde hay menos, hasta ${step.max}`;
    if (step.kind === 'color') {
      return step.show ? `ver y encontrar ${step.colors.length} colores` : `escuchar y encontrar ${step.colors.length} colores`;
    }
    if (step.kind === 'thing') return `${step.show ? 'ver' : 'escuchar'} y encontrar ${step.pool.length} cosas`;
    if (step.kind === 'shape') return `${step.show ? 'ver' : 'escuchar'} y encontrar ${step.pool.length} figuras`;
    if (step.oneMore) return 'uno más';
    if (step.maxSum > 20) return 'sumas con números grandes';
    return step.pictures ? `sumas hasta ${step.maxSum}, con dibujos` : `sumas hasta ${step.maxSum}`;
  },
  advanced: 'para niños mayores',
  wordMore: 'más',
  wordFewer: 'menos',

  colorNames: {
    red: 'rojo',
    blue: 'azul',
    yellow: 'amarillo',
    green: 'verde',
    orange: 'naranja',
    purple: 'morado',
    pink: 'rosa',
  },

  // The things shown to count: [one, many, 'f' for "una ..." words or 'm' for "un ..." words].
  items: {
    apple: ['manzana', 'manzanas', 'f'],
    star: ['estrella', 'estrellas', 'f'],
    ball: ['pelota', 'pelotas', 'f'],
    flower: ['flor', 'flores', 'f'],
    strawberry: ['fresa', 'fresas', 'f'],
    butterfly: ['mariposa', 'mariposas', 'f'],
    frog: ['rana', 'ranas', 'f'],
    fingers: ['dedo', 'dedos', 'm'],
  },

  // Princess things and shapes, each with its "el" or "la".
  nouns: {
    crown: ['la', 'corona'],
    castle: ['el', 'castillo'],
    unicorn: ['el', 'unicornio'],
    dress: ['el', 'vestido'],
    ring: ['el', 'anillo'],
    wand: ['la', 'varita'],
    shoe: ['el', 'zapato'],
    rose: ['la', 'rosa'],
    frog: ['la', 'rana'],
    circle: ['el', 'círculo'],
    square: ['el', 'cuadrado'],
    triangle: ['el', 'triángulo'],
    star: ['la', 'estrella'],
    heart: ['el', 'corazón'],
  },

  // What the voice says. Numbers are written as digits; the voice reads them as words.
  say: {
    go: '¡Vamos!',
    findIt: ([article, noun]) => `Busca ${article} ${noun}`,
    hereIs: ([article, noun]) => `Aquí está ${article} ${noun}`,
    same: (n, [one, many, g]) =>
      n === 1
        ? `${g === 'm' ? 'Un' : 'Una'} ${one}. ¿Dónde hay ${g === 'm' ? 'uno' : 'una'}?`
        : `${n} ${many}. ¿Dónde hay ${n}?`,
    count: ([, many, g]) => `¿${g === 'm' ? 'Cuántos' : 'Cuántas'} ${many} hay?`,
    find: (n) => `¿Dónde hay ${n}?`,
    more: '¿Dónde hay más?',
    fewer: '¿Dónde hay menos?',
    isMore: (n) => `Aquí hay más. Hay ${n}.`,
    isFewer: (n) => `Aquí hay menos. Hay ${n}.`,
    add: (a, b) => `¿Cuánto es ${a} más ${b}?`,
    color: (name) => `Busca el color ${name}`,
    isCount: (n, [one, many, g]) => (n === 1 ? `Hay ${g === 'm' ? 'un' : 'una'} ${one}` : `Hay ${n} ${many}`),
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
  endless: '♾️ Endless',
  playAgain: 'Play again',
  scoresButton: '🏆 High scores',
  scoresTitle: '🏆 Endless high scores',
  home: 'Home',
  save: 'Save',
  paused: 'Paused',
  resume: 'Keep going',
  hint: 'Tap the right door',
  noScores: 'No scores yet. Be the first!',
  nameLabel: 'You made the high scores! Type your name:',
  defaultName: 'Player',
  scoreBefore: 'You got ',
  scoreAfter: ' right!',
  allUnlocked: 'All characters unlocked!',
  cannotShow: 'Sorry, this device cannot show the game.',
  noVoice: 'This device has no English voice, so it will not talk. The questions are shown in writing.',
  labelScore: 'Stars',
  labelSound: 'Sound on or off',
  labelMusic: 'Music on or off',
  labelMusicVolume: 'Music volume',
  labelPause: 'Pause',
  labelEasier: 'Easier',
  labelHarder: 'Harder',
  labelRepeat: 'Say the question again',
  paces: { slow: '🐢 Slow', normal: 'Normal', fast: '🐇 Fast' },
  points: (n) => (n === 1 ? '1 point' : `${n} points`),
  bestRun: (n) => `Endless best: ${n}`,
  toUnlock: (need, name) => `${need} more ⭐ to unlock: ${name}`,
  lockedLabel: (name, cost) => `${name}, locked. Needs ${cost} points.`,
  unlocked: (name) => `You unlocked: ${name}!`,
  overTitle: {
    amazing: 'Amazing!',
    great: 'Great job!',
    nice: 'Good work!',
    zero: 'Keep trying!',
  },

  games: { numbers: 'Numbers', colors: 'Colors', princess: 'Princess', shapes: 'Shapes' },

  level: (n) => `Level ${n}`,
  levelName: (step) => {
    if (step.kind === 'same') return `hear the number and find it, up to ${step.max}`;
    if (step.kind === 'count') return step.doors === 'both' ? `count up to ${step.max}, number with dots` : `count up to ${step.max}`;
    if (step.kind === 'find') return `number to dots, up to ${step.max}`;
    if (step.kind === 'compare') return step.gap > 1 ? 'which has more or fewer (easy)' : `which has more or fewer, up to ${step.max}`;
    if (step.kind === 'more') return step.gap > 1 ? 'which has more (easy)' : `which has more, up to ${step.max}`;
    if (step.kind === 'fewer') return `which has fewer, up to ${step.max}`;
    if (step.kind === 'color') {
      return step.show ? `see and find ${step.colors.length} colors` : `listen and find ${step.colors.length} colors`;
    }
    if (step.kind === 'thing') return `${step.show ? 'see' : 'listen'} and find ${step.pool.length} things`;
    if (step.kind === 'shape') return `${step.show ? 'see' : 'listen'} and find ${step.pool.length} shapes`;
    if (step.oneMore) return 'one more';
    if (step.maxSum > 20) return 'sums with big numbers';
    return step.pictures ? `sums up to ${step.maxSum}, with pictures` : `sums up to ${step.maxSum}`;
  },
  advanced: 'for older children',
  wordMore: 'more',
  wordFewer: 'fewer',

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
    fingers: ['finger', 'fingers'],
  },

  nouns: {
    crown: ['the', 'crown'],
    castle: ['the', 'castle'],
    unicorn: ['the', 'unicorn'],
    dress: ['the', 'dress'],
    ring: ['the', 'ring'],
    wand: ['the', 'wand'],
    shoe: ['the', 'shoe'],
    rose: ['the', 'rose'],
    frog: ['the', 'frog'],
    circle: ['the', 'circle'],
    square: ['the', 'square'],
    triangle: ['the', 'triangle'],
    star: ['the', 'star'],
    heart: ['the', 'heart'],
  },

  say: {
    go: "Let's go!",
    findIt: ([article, noun]) => `Find ${article} ${noun}`,
    hereIs: ([article, noun]) => `Here is ${article} ${noun}`,
    same: (n, [one, many]) => (n === 1 ? `1 ${one}. Where is 1 dot?` : `${n} ${many}. Where are ${n} dots?`),
    count: ([, many]) => `How many ${many}?`,
    find: (n) => (n === 1 ? 'Where is 1 dot?' : `Where are ${n} dots?`),
    more: 'Which door has more?',
    fewer: 'Which door has fewer?',
    isMore: (n) => `This one has more. It has ${n}.`,
    isFewer: (n) => `This one has fewer. It has ${n}.`,
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
  if (question.kind === 'more') return say.more;
  if (question.kind === 'fewer') return say.fewer;
  if (question.kind === 'color') return say.color(t.colorNames[question.answer]);
  if (question.kind === 'thing' || question.kind === 'shape') return say.findIt(t.nouns[question.answer]);
  return say.add(question.a, question.b);
}

export function answerText(question) {
  const { say } = t;
  if (question.kind === 'same' || question.kind === 'count') return say.isCount(question.answer, t.items[question.item]);
  if (question.kind === 'find') return say.isFind(question.answer);
  if (question.kind === 'more') return say.isMore(question.answer);
  if (question.kind === 'fewer') return say.isFewer(question.answer);
  if (question.kind === 'color') return say.isColor(t.colorNames[question.answer]);
  if (question.kind === 'thing' || question.kind === 'shape') return say.hereIs(t.nouns[question.answer]);
  return say.isAdd(question.a, question.b, question.answer);
}

// What the voice says after a wrong answer. For small amounts it counts them out first
// ("1, 2, 3. Hay 3 flores."), the way a teacher would, so the last number is heard as the total.
export function spokenAnswer(question) {
  const counted = question.kind === 'same' || question.kind === 'count';
  if (counted && question.answer >= 2 && question.answer <= 5) {
    const counting = Array.from({ length: question.answer }, (_, i) => i + 1).join(', ');
    return `${counting}. ${answerText(question)}`;
  }
  return answerText(question);
}
