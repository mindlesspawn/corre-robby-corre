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
  privacyButton: 'Privacidad y créditos',
  howToPlay: 'Cómo jugar',
  tutorialTitle: '¡Vamos a practicar!',
  tutorialTap: 'Toca otra puerta para moverte.',
  tutorialSwipe: 'Ahora desliza el dedo hacia un lado.',
  tutorialDone: '¡Ya sabes moverte!',
  tutorialSkip: 'Saltar práctica',
  settingSpeed: 'Velocidad',
  settingSound: 'Sonido',
  settingMusic: 'Música',
  soundControls: 'Volumen',
  settingMaster: 'Volumen general',
  settingVoice: 'Voz',
  settingEffects: 'Efectos',
  labelMasterVolume: 'Volumen general',
  labelVoiceVolume: 'Volumen de la voz',
  labelEffectsVolume: 'Volumen de los efectos',
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
  games: {
    numbers: 'Números',
    colors: 'Colores',
    princess: 'Princesa',
    animals: 'Animales',
    fruit: 'Frutas',
    shapes: 'Figuras',
    patterns: 'Patrones',
  },

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
    'Este juego es gratis y no tiene anuncios, y así se va a quedar. Si quieres apoyar el juego, puedes dejar una propina opcional de una sola vez. No es una suscripción y no desbloquea contenido.',
  supportThanks: '¡Gracias!',
  tipSmall: 'Propina pequeña',
  tipMedium: 'Propina mediana',
  tipLarge: 'Propina grande',
  tipLoading: 'Cargando opciones de Apple…',
  tipPurchasing: 'Completa la confirmación de Apple. Puedes cancelar.',
  tipRetry: 'Volver a intentar',
  gateAnswer: 'Escribe la respuesta',
  gateContinue: 'Continuar',
  tipMessages: {
    purchased: 'Gracias por apoyar el juego. Tu propina se completó.',
    cancelled: 'Cancelaste la compra. No se envió ninguna propina.',
    pending: 'La compra está pendiente de aprobación de Apple. No necesitas intentarlo otra vez.',
    unavailable: 'No se pueden cargar las propinas ahora. Revisa tu conexión e inténtalo más tarde. Puedes seguir jugando gratis.',
    restricted: 'Las compras no están disponibles con los ajustes de este dispositivo. El juego sigue siendo gratis.',
    auth: 'Para continuar, vuelve a responder la pregunta para adultos.',
    priceChanged: 'La tienda o el precio cambió. Vuelve a entrar para ver los precios actuales.',
    busy: 'Hay una compra en curso. Espera a que termine.',
    unverified: 'No pudimos verificar la compra. Revisa tu historial de compras de Apple antes de volver a intentarlo.',
    failed: 'No se pudo confirmar la propina. Revisa tu historial de compras de Apple antes de volver a intentarlo.',
  },
  gateTitle: 'Solo para adultos',
  gateAsk: (a, b) => `¿Cuánto es ${a} × ${b}?`,
  back: 'Volver',

  // Erasing saved progress, for grown-ups. Each thing that can be erased has the name on
  // its button and the question asked before it is erased.
  eraseButton: 'Borrar progreso',
  eraseTitle: 'Borrar progreso',
  eraseText: '¿Qué quieres borrar? Lo que borres no se puede recuperar.',
  eraseLevelsAge: (age) => `Niveles de ${age}`,
  eraseLevelsAgeAsk: (age) =>
    `¿Borrar los niveles y las estampas de todos los juegos para ${age}? Las otras edades no cambian.`,
  eraseLevelsAll: 'Niveles de todas las edades',
  eraseLevelsAllAsk: '¿Borrar los niveles y las estampas de todos los juegos, para todas las edades?',
  eraseScores: 'Récords de Sin fin',
  eraseScoresAsk: '¿Borrar todos los récords de Sin fin? Los niveles no cambian.',
  eraseAll: 'Todo, para empezar de cero',
  eraseAllAsk:
    '¿Borrar todo? Se borran los niveles, las estampas, los récords y los puntos, con los personajes que esos puntos desbloquearon. La práctica del principio vuelve a salir. Solo se quedan los ajustes (idioma, sonido y velocidad).',
  eraseYes: 'Sí, borrar',
  eraseNo: 'No, volver',
  eraseDone: 'Listo, se borró.',
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
    dog: ['el', 'perro'],
    cat: ['el', 'gato'],
    cow: ['la', 'vaca'],
    duck: ['el', 'pato'],
    pig: ['el', 'cerdo'],
    horse: ['el', 'caballo'],
    chicken: ['la', 'gallina'],
    rabbit: ['el', 'conejo'],
    fish: ['el', 'pez'],
    bird: ['el', 'pájaro'],
    sheep: ['la', 'oveja'],
    lion: ['el', 'león'],
    elephant: ['el', 'elefante'],
    monkey: ['el', 'mono'],
    apple: ['la', 'manzana'],
    banana: ['el', 'plátano'],
    strawberry: ['la', 'fresa'],
    orange: ['la', 'naranja'],
    watermelon: ['la', 'sandía'],
    pineapple: ['la', 'piña'],
    pear: ['la', 'pera'],
    lemon: ['el', 'limón'],
    peach: ['el', 'durazno'],
    mango: ['el', 'mango'],
    coconut: ['el', 'coco'],
    avocado: ['el', 'aguacate'],
    kiwi: ['el', 'kiwi'],
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
  privacyButton: 'Privacy and credits',
  howToPlay: 'How to play',
  tutorialTitle: 'Let’s practice!',
  tutorialTap: 'Tap another door to move.',
  tutorialSwipe: 'Now slide your finger to one side.',
  tutorialDone: 'You’re ready to move!',
  tutorialSkip: 'Skip practice',
  settingSpeed: 'Speed',
  settingSound: 'Sound',
  settingMusic: 'Music',
  soundControls: 'Sound controls',
  settingMaster: 'Overall volume',
  settingVoice: 'Voice',
  settingEffects: 'Sound effects',
  labelMasterVolume: 'Overall volume',
  labelVoiceVolume: 'Voice volume',
  labelEffectsVolume: 'Sound effects volume',
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

  games: {
    numbers: 'Numbers',
    colors: 'Colors',
    princess: 'Princess',
    animals: 'Animals',
    fruit: 'Fruit',
    shapes: 'Shapes',
    patterns: 'Patterns',
  },

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
    'This game is free and has no ads, and it will stay that way. You can support it with an optional one-time tip. It is not a subscription and does not unlock game content.',
  supportThanks: 'Thank you!',
  tipSmall: 'Small tip',
  tipMedium: 'Medium tip',
  tipLarge: 'Large tip',
  tipLoading: 'Loading options from Apple…',
  tipPurchasing: 'Complete Apple’s confirmation. You can cancel.',
  tipRetry: 'Try again',
  gateAnswer: 'Enter the answer',
  gateContinue: 'Continue',
  tipMessages: {
    purchased: 'Thank you for supporting the game. Your tip is complete.',
    cancelled: 'You cancelled the purchase. No tip was sent.',
    pending: 'The purchase is waiting for Apple approval. You do not need to try again.',
    unavailable: 'Tips cannot load right now. Check your connection and try later. You can keep playing for free.',
    restricted: 'Purchases are unavailable with this device’s settings. The game remains free.',
    auth: 'Please answer the grown-up question again to continue.',
    priceChanged: 'The storefront or price changed. Reopen this page to see current prices.',
    busy: 'A purchase is already in progress. Please wait for it to finish.',
    unverified: 'We could not verify the purchase. Check your Apple purchase history before trying again.',
    failed: 'The tip could not be confirmed. Check your Apple purchase history before trying again.',
  },
  gateTitle: 'Grown-ups only',
  gateAsk: (a, b) => `What is ${a} × ${b}?`,
  back: 'Back',

  eraseButton: 'Erase progress',
  eraseTitle: 'Erase progress',
  eraseText: 'What do you want to erase? Erased things cannot be brought back.',
  eraseLevelsAge: (age) => `Levels for ${age.toLowerCase()}`,
  eraseLevelsAgeAsk: (age) =>
    `Erase the levels and stickers of every game for ${age.toLowerCase()}? The other ages do not change.`,
  eraseLevelsAll: 'Levels for every age',
  eraseLevelsAllAsk: 'Erase the levels and stickers of every game, for every age?',
  eraseScores: 'Endless high scores',
  eraseScoresAsk: 'Erase all the endless high scores? Levels do not change.',
  eraseAll: 'Everything, to start over',
  eraseAllAsk:
    'Erase everything? The levels, stickers, high scores and points are erased, along with any characters those points unlocked. The first-level practice comes back. Only the settings stay (language, sound and speed).',
  eraseYes: 'Yes, erase',
  eraseNo: 'No, go back',
  eraseDone: 'Done. It was erased.',
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
    dog: ['the', 'dog'],
    cat: ['the', 'cat'],
    cow: ['the', 'cow'],
    duck: ['the', 'duck'],
    pig: ['the', 'pig'],
    horse: ['the', 'horse'],
    chicken: ['the', 'chicken'],
    rabbit: ['the', 'rabbit'],
    fish: ['the', 'fish'],
    bird: ['the', 'bird'],
    sheep: ['the', 'sheep'],
    lion: ['the', 'lion'],
    elephant: ['the', 'elephant'],
    monkey: ['the', 'monkey'],
    apple: ['the', 'apple'],
    banana: ['the', 'banana'],
    strawberry: ['the', 'strawberry'],
    orange: ['the', 'orange'],
    watermelon: ['the', 'watermelon'],
    pineapple: ['the', 'pineapple'],
    pear: ['the', 'pear'],
    lemon: ['the', 'lemon'],
    peach: ['the', 'peach'],
    mango: ['the', 'mango'],
    coconut: ['the', 'coconut'],
    avocado: ['the', 'avocado'],
    kiwi: ['the', 'kiwi'],
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
