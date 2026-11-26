// Every number and color you might want to tune lives here.

export const CONFIG = {
  // Written all in lower case on purpose.
  title: 'corre, robby, corre',

  // The language the game starts in: 'es' (Spanish) or 'en' (English).
  // The player can switch on the start screen. The words themselves are in src/text.js.
  language: 'es',

  // The game picked the first time someone plays. The games are listed in src/questions.js.
  game: 'numbers',

  // --- Treadmill -----------------------------------------------------------
  laneWidth: 2, // distance between lane centres
  spawnDistance: 32, // how far away a row of doors appears

  // --- Speed ---------------------------------------------------------------
  // "Travel time" is how many seconds a row of doors takes to reach the runner.
  startTravelTime: 5.0,
  minTravelTime: 2.5, // never faster than this, so there is always time to look
  travelTimeStep: 0.25, // how much quicker each speed step is
  correctPerSpeedStep: 3, // right answers needed for one speed step
  speedStepsLostOnMiss: 2, // a wrong answer slows things down again

  // --- A run ---------------------------------------------------------------
  // A run is a fixed number of doors and never ends early. A wrong door bumps the
  // runner back; the next right door brings it forward again.
  doorsPerRun: 10,
  celebrateTime: 2.4, // seconds of confetti at the end of a run

  // --- Difficulty ----------------------------------------------------------
  // The learning steps are listed in src/questions.js. Each right answer is +1 and each
  // wrong answer is -1; this many are needed to move up one step. Bigger is slower.
  answersPerLevel: 8,

  // --- High scores ---------------------------------------------------------
  highScoreSlots: 10,
  nameMaxLength: 10,

  // --- Pauses between questions (seconds) ----------------------------------
  gapAfterCorrect: 0.8,
  gapAfterWrong: 2.8, // longer, so the right answer can be seen and heard
};

// The door colors, which are also the colors taught in the colors game.
// Their names in each language are in src/text.js.
export const COLORS = {
  red: '#e53935',
  blue: '#1e88e5',
  yellow: '#ffd21f',
  green: '#3fa34d',
  orange: '#f57c00',
  purple: '#8e24aa',
  pink: '#f48fb1',
};

// The look of the world. Plain colors for now; art can replace these later.
export const THEME = {
  sky: '#9ad8ff',
  floor: '#8fd67f',
  treadmillBody: '#37474f',
  belt: '#455a64',
  beltSlat: '#546e7a',
  laneLine: '#eceff1',
  rail: '#ff7043',
  // Toy blocks standing beside the treadmill.
  blocks: ['#ef5350', '#42a5f5', '#ffca28', '#66bb6a', '#ab47bc', '#ff8a65'],
  // Door signs
  signPlain: { back: '#ffffff', text: '#1a237e' },
  signRight: { back: '#43a047', text: '#ffffff' },
  signWrong: { back: '#ffcc80', text: '#5d4037' },
  // Confetti
  confetti: ['#fff176', '#ffffff', '#ff8a80', '#80d8ff', '#b9f6ca', '#ea80fc', '#ffd180'],
};
