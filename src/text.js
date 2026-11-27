// Every word the player sees or hears, in each language.
// The first time, the game asks which language to use. The choice is remembered on that
// device and can be changed on the settings screen.
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
  labelSettings: 'Ajustes',
  labelRotate: 'Pon el teléfono derecho para jugar',
  settingsTitle: '⚙️ Ajustes',
  settingSpeed: 'Velocidad',
  settingSound: 'Sonido',
  settingMusic: 'Música',
  settingLanguage: 'Idioma',
  soundOn: '🔊 Con sonido',
  soundOff: '🔇 Sin sonido',
  done: 'Listo',
  labelSound: 'Activar o quitar el sonido',
  labelMusic: 'Poner o quitar la música',
  labelMusicVolume: 'Volumen de la música',
  labelPause: 'Pausa',
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
  games: { numbers: 'Números', colors: 'Colores', princess: 'Princesa', shapes: 'Figuras', patterns: 'Patrones' },

  // The age buttons on the start screen.
  ages: { 3: '3 años', 4: '4 años', 5: '5 años', 6: '6+ años' },
  labelAge: 'Edad',

  // The ten levels of the chosen game.
  labelLevels: 'Niveles',
  levelLabel: (n) => `Nivel ${n}`,
  levelDone: (n) => `¡Nivel ${n}!`,
  levelCleared: (n) => `⭐ ¡Pasaste el nivel ${n}!`,
  levelAgain: (n, need) => `Nivel ${n}: con ${need} ⭐ pasas al siguiente`,
  allCleared: '🏆 ¡Pasaste los 10 niveles!',
  advancedTitle: 'Para adultos o niños avanzados',

  // The support page, for grown-ups.
  supportButton: '❤️ Apoyar el juego',
  supportTitle: '❤️ Apoya el juego',
  supportText:
    'Este juego es gratis y no tiene anuncios, y así se va a quedar. Si a tu familia le gusta y quieres ayudar a que siga creciendo, puedes dejar una propina. Es totalmente opcional.',
  supportThanks: '¡Gracias!',
  gateTitle: 'Solo para adultos',
  gateAsk: (a, b) => `¿Cuánto es ${a} × ${b}?`,
  back: 'Volver',
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
    brown: 'café',
    black: 'negro',
    white: 'blanco',
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
    gem: ['la', 'joya'],
    fairy: ['el', 'hada'],
    dragon: ['el', 'dragón'],
    key: ['la', 'llave'],
    circle: ['el', 'círculo'],
    square: ['el', 'cuadrado'],
    triangle: ['el', 'triángulo'],
    star: ['la', 'estrella'],
    heart: ['el', 'corazón'],
    rectangle: ['el', 'rectángulo'],
    oval: ['el', 'óvalo'],
    diamond: ['el', 'rombo'],
    hexagon: ['el', 'hexágono'],
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
    after: (n) => `¿Qué número sigue después del ${n}?`,
    isAfter: (n, next) => `Después del ${n} sigue el ${next}`,
    next: '¿Qué sigue?',
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
  labelSettings: 'Settings',
  labelRotate: 'Turn the phone upright to play',
  settingsTitle: '⚙️ Settings',
  settingSpeed: 'Speed',
  settingSound: 'Sound',
  settingMusic: 'Music',
  settingLanguage: 'Language',
  soundOn: '🔊 Sound on',
  soundOff: '🔇 Sound off',
  done: 'Done',
  labelSound: 'Sound on or off',
  labelMusic: 'Music on or off',
  labelMusicVolume: 'Music volume',
  labelPause: 'Pause',
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

  games: { numbers: 'Numbers', colors: 'Colors', princess: 'Princess', shapes: 'Shapes', patterns: 'Patterns' },

  ages: { 3: 'Age 3', 4: 'Age 4', 5: 'Age 5', 6: 'Age 6+' },
  labelAge: 'Age',

  labelLevels: 'Levels',
  levelLabel: (n) => `Level ${n}`,
  levelDone: (n) => `Level ${n}!`,
  levelCleared: (n) => `⭐ You cleared level ${n}!`,
  levelAgain: (n, need) => `Level ${n}: get ${need} ⭐ to move on`,
  allCleared: '🏆 You cleared all 10 levels!',
  advancedTitle: 'For grown-ups or advanced kids',

  supportButton: '❤️ Support the game',
  supportTitle: '❤️ Support the game',
  supportText:
    'This game is free and has no ads, and it will stay that way. If your family enjoys it and you would like to help it grow, you can leave a tip. It is completely optional.',
  supportThanks: 'Thank you!',
  gateTitle: 'Grown-ups only',
  gateAsk: (a, b) => `What is ${a} × ${b}?`,
  back: 'Back',
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
    brown: 'brown',
    black: 'black',
    white: 'white',
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
    gem: ['the', 'gem'],
    fairy: ['the', 'fairy'],
    dragon: ['the', 'dragon'],
    key: ['the', 'key'],
    circle: ['the', 'circle'],
    square: ['the', 'square'],
    triangle: ['the', 'triangle'],
    star: ['the', 'star'],
    heart: ['the', 'heart'],
    rectangle: ['the', 'rectangle'],
    oval: ['the', 'oval'],
    diamond: ['the', 'diamond'],
    hexagon: ['the', 'hexagon'],
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
    after: (n) => `What number comes after ${n}?`,
    isAfter: (n, next) => `After ${n} comes ${next}`,
    next: 'What comes next?',
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

// The languages to choose from, each named in its own language, with the flag of the
// country its voice comes from (the pictures a child can pick by).
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇲🇽' },
];

let current = TEXT[CONFIG.language] ? CONFIG.language : 'en';

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
  if (question.kind === 'after') return say.after(question.n);
  if (question.kind === 'pattern') return say.next;
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
  if (question.kind === 'after') return say.isAfter(question.n, question.answer);
  if (question.kind === 'pattern') {
    return question.of === 'colors' ? say.isColor(t.colorNames[question.answer]) : say.hereIs(t.nouns[question.answer]);
  }
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
