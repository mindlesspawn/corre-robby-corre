// Question makers. The game only ever calls makeQuestion(), so a new subject
// (subtraction, multiplication, spelling...) is added by putting one more entry
// in SUBJECTS. Nothing in the runner itself has to change.
//
// A subject's make(level) returns:
//   { text: '3 + 4', answer: 7, wrong: [6, 9] }
// "answer" and "wrong" can be numbers or short strings; they are shown on the doors.

import { CONFIG } from './config.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// --- Addition ----------------------------------------------------------------

function additionPair(level) {
  switch (level) {
    case 0: {
      // sums up to 5
      const a = rand(1, 4);
      return [a, rand(1, 5 - a)];
    }
    case 1: {
      // sums up to 10
      const a = rand(1, 9);
      return [a, rand(1, 10 - a)];
    }
    case 2:
      // sums up to 20
      return [rand(3, 10), rand(3, 10)];
    case 3:
      // two-digit plus one-digit
      return [rand(10, 40), rand(1, 9)];
    default: {
      // two-digit plus two-digit, sums under 100
      const a = rand(10, 60);
      return [a, rand(10, 99 - a)];
    }
  }
}

function additionWrongAnswers(answer, level) {
  // Close to the right answer, so guessing does not work.
  const offsets = level >= 3 ? [-10, -2, -1, 1, 2, 10] : [-2, -1, 1, 2, 3];
  const candidates = offsets.map((o) => answer + o).filter((v) => v >= 0);
  return shuffle(candidates).slice(0, 2);
}

const addition = {
  label: 'Addition',
  levels: 5,
  make(level) {
    const [a, b] = shuffle(additionPair(level));
    const answer = a + b;
    return { text: `${a} + ${b}`, answer, wrong: additionWrongAnswers(answer, level) };
  },
};

// --- Subject list ------------------------------------------------------------

export const SUBJECTS = {
  addition,
};

// Which level a run is on, from the number of right answers so far (0-based).
export function levelForCorrect(correctCount, subjectId = CONFIG.subject) {
  const maxLevel = SUBJECTS[subjectId].levels - 1;
  let level = 0;
  CONFIG.levelStarts.forEach((start, i) => {
    if (correctCount >= start) level = i;
  });
  return Math.min(level, maxLevel);
}

// Builds the next question, with the three door choices already shuffled.
// previousText avoids asking the same thing twice in a row.
export function makeQuestion(level, previousText = '', subjectId = CONFIG.subject) {
  const subject = SUBJECTS[subjectId];
  let q = subject.make(level);
  for (let tries = 0; tries < 8 && q.text === previousText; tries++) {
    q = subject.make(level);
  }
  const choices = shuffle([q.answer, ...q.wrong]);
  return {
    text: q.text,
    answer: q.answer,
    choices,
    correctIndex: choices.indexOf(q.answer),
  };
}
