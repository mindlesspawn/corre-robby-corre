// Every number and color you might want to tune lives here.

export const CONFIG = {
  title: 'Number Run',

  // Which kind of question the doors ask. See src/questions.js for the list.
  subject: 'addition',

  // --- Treadmill -----------------------------------------------------------
  laneWidth: 2, // distance between lane centres
  spawnDistance: 32, // how far away a row of doors appears

  // --- Speed ---------------------------------------------------------------
  // "Travel time" is how many seconds a row of doors takes to reach the runner.
  startTravelTime: 6.0,
  minTravelTime: 2.5, // never faster than this, so there is always time to read
  travelTimeStep: 0.25, // how much quicker each speed step is
  correctPerSpeedStep: 3, // right answers needed for one speed step
  speedStepsLostOnMiss: 2, // a wrong answer slows things down again

  // --- Mistakes ------------------------------------------------------------
  // First miss pushes the runner back. A second miss while pushed back ends the run.
  recoverStreak: 3, // right answers in a row that bring the runner back to the front

  // --- Difficulty ----------------------------------------------------------
  // Number of right answers needed to reach each level (level 1 starts at 0).
  levelStarts: [0, 5, 12, 22, 35],

  // --- High scores ---------------------------------------------------------
  highScoreSlots: 10,
  nameMaxLength: 10,

  // --- Pauses between questions (seconds) ----------------------------------
  gapAfterCorrect: 0.6,
  gapAfterWrong: 1.6, // longer, so the right answer can be read
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
  // Each row of doors picks three of these at random.
  doors: ['#e53935', '#1e88e5', '#fbc02d', '#43a047', '#8e24aa', '#fb8c00'],
  // Toy blocks standing beside the treadmill.
  blocks: ['#ef5350', '#42a5f5', '#ffca28', '#66bb6a', '#ab47bc', '#ff8a65'],
  // Door signs
  signPlain: { back: '#ffffff', text: '#1a237e' },
  signRight: { back: '#43a047', text: '#ffffff' },
  signWrong: { back: '#ffcc80', text: '#5d4037' },
};
