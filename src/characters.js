// THE CHARACTER LIST
//
// Add, remove, or change a runner by editing this list. Nothing else in the
// game needs to change.
//
//   id           short name used in saved data (do not change once kids have played)
//   name         what the player sees, in each language
//   unlockAt     total points needed to unlock it (0 = free from the start).
//                Every character is free for now. Give one a number, such as 25, to make it a prize.
//   move         how it moves: 'bounce', 'run', 'hop', or 'roll'
//   facesCamera  true if it should look at the player instead of at the doors
//   tricks       optional: the special tricks it does, in order, one on every third right
//                answer. Choose from 'flip' (backflip), 'bigspin' (high jump with two spins)
//                and 'dance' (side-to-side wiggle). Leave it out for all three.
//   trickSound   optional: a sound from src/audio.js to play with each trick, such as 'roar'
//   look         what it looks like (see below)
//
// LOOKS
//   kind: 'shapes' builds the character from simple colored shapes.
//   Art comes later: a picture or 3D model look will be a new "kind" in src/looks.js.
//
// SHAPES
//   Each part is a ball, box, cylinder, cone, or arc (half a ring, used for smiles).
//     size    ball: [width]   box: [width, height, depth]   cylinder/cone: [width, height]
//             arc: [width, thickness]
//     at      where its centre sits: [left/right, up, front/back]. The ground is 0.
//             Build every character facing away from you, so its face is on the negative
//             front/back side. facesCamera then turns the whole character around.
//     turn    optional tilt in degrees: [x, y, z]
//     scale   optional stretch: [x, y, z]
//     smooth  optional: true for a smooth surface instead of a faceted, blocky one
//     shiny   optional: true for a glossy surface
//     tag     optional name for a part that moves: legL, legR, armL, armR, tail, ears, leaf,
//             eyes (which blink)
//     pivot   optional point a tagged part swings around (for example, the hip of a leg)
//     mood    optional: the part only shows in that mood. 'calm' is the everyday face,
//             'yay' shows after a right answer, 'oops' after a wrong one.
//             A list such as ['calm', 'oops'] shows the part in each of those moods.
//   A rolling character spins around a point half its width above the ground.

export const CHARACTERS = [
  {
    id: 'apple',
    name: { es: 'Manzana', en: 'Apple' },
    unlockAt: 0,
    move: 'bounce',
    facesCamera: true,
    tricks: ['bigspin', 'flip', 'dance'],
    look: {
      kind: 'shapes',
      parts: [
        // body
        { shape: 'ball', size: [1.25], scale: [1, 0.92, 1], at: [0, 0.6, 0], color: '#e53935', smooth: true, shiny: true },
        // stem and leaf
        { shape: 'cylinder', size: [0.11, 0.34], at: [0, 1.28, 0], turn: [0, 0, -8], color: '#6d4c41' },
        { shape: 'ball', size: [0.52], scale: [1, 0.22, 0.55], at: [0.28, 1.36, 0], turn: [0, 0, 22], color: '#4caf50', smooth: true, tag: 'leaf', pivot: [0.04, 1.3, 0] },
        // eyes: white, pupil, and a little sparkle
        { shape: 'ball', size: [0.3], at: [-0.21, 0.74, -0.5], color: '#ffffff', smooth: true, tag: 'eyes', pivot: [0, 0.74, -0.5] },
        { shape: 'ball', size: [0.3], at: [0.21, 0.74, -0.5], color: '#ffffff', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.17], at: [-0.21, 0.74, -0.615], color: '#212121', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.17], at: [0.21, 0.74, -0.615], color: '#212121', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.06], at: [-0.24, 0.79, -0.685], color: '#ffffff', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.06], at: [0.18, 0.79, -0.685], color: '#ffffff', smooth: true, tag: 'eyes' },
        // rosy cheeks
        { shape: 'ball', size: [0.2], scale: [1, 0.65, 0.3], at: [-0.41, 0.54, -0.49], turn: [0, 40, 0], color: '#ff8a80', smooth: true },
        { shape: 'ball', size: [0.2], scale: [1, 0.65, 0.3], at: [0.41, 0.54, -0.49], turn: [0, -40, 0], color: '#ff8a80', smooth: true },
        // mouths, one for each mood
        { shape: 'arc', size: [0.3, 0.06], at: [0, 0.54, -0.63], turn: [0, 0, 180], color: '#4e342e', mood: 'calm' },
        { shape: 'ball', size: [0.32], scale: [1, 0.8, 0.3], at: [0, 0.46, -0.615], color: '#4e342e', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.17], scale: [1, 0.5, 0.3], at: [0, 0.4, -0.645], color: '#ff5252', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.17], scale: [1, 1.1, 0.3], at: [0, 0.47, -0.625], color: '#4e342e', smooth: true, mood: 'oops' },
      ],
    },
  },

  {
    // An original princess: brown hair, pink dress, gold crown. Free from the start.
    id: 'princess',
    name: { es: 'Princesa', en: 'Princess' },
    unlockAt: 0,
    move: 'bounce',
    facesCamera: true,
    tricks: ['bigspin', 'dance', 'flip'], // a princess twirls first
    look: {
      kind: 'shapes',
      parts: [
        // dress: skirt, trim, top and sash
        { shape: 'cone', size: [1.3, 1.05], at: [0, 0.525, 0], color: '#ec407a', smooth: true },
        { shape: 'cylinder', size: [1.32, 0.1], at: [0, 0.06, 0], color: '#f8bbd0', smooth: true },
        { shape: 'ball', size: [0.52], scale: [1, 1.1, 0.85], at: [0, 0.96, 0], color: '#d81b60', smooth: true },
        { shape: 'cylinder', size: [0.47, 0.08], at: [0, 0.8, 0], color: '#7e57c2', smooth: true },
        // arms and hands
        { shape: 'cylinder', size: [0.11, 0.42], at: [-0.33, 0.86, 0], turn: [0, 0, -28], color: '#e8b48a', smooth: true },
        { shape: 'cylinder', size: [0.11, 0.42], at: [0.33, 0.86, 0], turn: [0, 0, 28], color: '#e8b48a', smooth: true },
        { shape: 'ball', size: [0.14], at: [-0.44, 0.68, 0], color: '#e8b48a', smooth: true },
        { shape: 'ball', size: [0.14], at: [0.44, 0.68, 0], color: '#e8b48a', smooth: true },
        // hair behind, then the head
        { shape: 'ball', size: [0.72], scale: [1, 1, 0.9], at: [0, 1.46, 0.08], color: '#5d4037', smooth: true },
        { shape: 'ball', size: [0.5], scale: [0.95, 1.4, 0.6], at: [0, 1.12, 0.27], color: '#5d4037', smooth: true },
        { shape: 'ball', size: [0.62], at: [0, 1.42, 0], color: '#e8b48a', smooth: true },
        // crown with a red jewel
        { shape: 'cylinder', size: [0.34, 0.12], at: [0, 1.84, 0], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cone', size: [0.11, 0.17], at: [-0.12, 1.97, 0], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cone', size: [0.11, 0.17], at: [0.12, 1.97, 0], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cone', size: [0.11, 0.17], at: [0, 1.97, -0.12], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cone', size: [0.11, 0.17], at: [0, 1.97, 0.12], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'ball', size: [0.09], at: [0, 1.84, -0.17], color: '#e53935', smooth: true, shiny: true },
        // eyes with a sparkle
        { shape: 'ball', size: [0.1], at: [-0.11, 1.45, -0.283], color: '#212121', smooth: true, tag: 'eyes', pivot: [0, 1.45, -0.283] },
        { shape: 'ball', size: [0.1], at: [0.11, 1.45, -0.283], color: '#212121', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.035], at: [-0.125, 1.475, -0.325], color: '#ffffff', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.035], at: [0.095, 1.475, -0.325], color: '#ffffff', smooth: true, tag: 'eyes' },
        // rosy cheeks
        { shape: 'ball', size: [0.11], scale: [1, 0.65, 0.3], at: [-0.19, 1.36, -0.25], turn: [0, 35, 0], color: '#f48fb1', smooth: true },
        { shape: 'ball', size: [0.11], scale: [1, 0.65, 0.3], at: [0.19, 1.36, -0.25], turn: [0, -35, 0], color: '#f48fb1', smooth: true },
        // mouths, one for each mood
        { shape: 'arc', size: [0.14, 0.035], at: [0, 1.34, -0.305], turn: [0, 0, 180], color: '#ad1457', mood: 'calm' },
        { shape: 'ball', size: [0.14], scale: [1, 0.8, 0.3], at: [0, 1.31, -0.3], color: '#ad1457', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.085], scale: [1, 1.1, 0.3], at: [0, 1.31, -0.305], color: '#ad1457', smooth: true, mood: 'oops' },
      ],
    },
  },

  {
    // A fierce T. rex: big jaws, sharp teeth, angry brows, claws. It roars when it does a trick.
    id: 'dino',
    name: { es: 'Dinosaurio', en: 'Dinosaur' },
    unlockAt: 0,
    move: 'bounce',
    facesCamera: true,
    tricks: ['flip', 'dance', 'bigspin'],
    trickSound: 'roar',
    look: {
      kind: 'shapes',
      parts: [
        // thick tail, swinging out to one side
        { shape: 'cone', size: [0.62, 1.3], at: [0.4, 0.42, 0.72], turn: [74, 0, -30], color: '#1b5e20', smooth: true, tag: 'tail', pivot: [0.12, 0.4, 0.25] },
        // body and tummy
        { shape: 'ball', size: [1.08], scale: [1, 1.15, 1], at: [0, 0.68, 0], color: '#2e7d32', smooth: true },
        { shape: 'ball', size: [0.72], scale: [1, 1.1, 0.4], at: [0, 0.6, -0.41], color: '#aed581', smooth: true },
        // strong legs, big feet, white claws
        { shape: 'ball', size: [0.48], scale: [1, 0.95, 1.1], at: [-0.32, 0.24, -0.04], color: '#1b5e20', smooth: true },
        { shape: 'ball', size: [0.48], scale: [1, 0.95, 1.1], at: [0.32, 0.24, -0.04], color: '#1b5e20', smooth: true },
        { shape: 'ball', size: [0.46], scale: [1, 0.45, 1.4], at: [-0.32, 0.1, -0.22], color: '#1b5e20', smooth: true },
        { shape: 'ball', size: [0.46], scale: [1, 0.45, 1.4], at: [0.32, 0.1, -0.22], color: '#1b5e20', smooth: true },
        { shape: 'cone', size: [0.1, 0.18], at: [-0.44, 0.08, -0.52], turn: [-90, 0, 0], color: '#fafafa', smooth: true },
        { shape: 'cone', size: [0.1, 0.18], at: [-0.32, 0.08, -0.56], turn: [-90, 0, 0], color: '#fafafa', smooth: true },
        { shape: 'cone', size: [0.1, 0.18], at: [-0.2, 0.08, -0.52], turn: [-90, 0, 0], color: '#fafafa', smooth: true },
        { shape: 'cone', size: [0.1, 0.18], at: [0.2, 0.08, -0.52], turn: [-90, 0, 0], color: '#fafafa', smooth: true },
        { shape: 'cone', size: [0.1, 0.18], at: [0.32, 0.08, -0.56], turn: [-90, 0, 0], color: '#fafafa', smooth: true },
        { shape: 'cone', size: [0.1, 0.18], at: [0.44, 0.08, -0.52], turn: [-90, 0, 0], color: '#fafafa', smooth: true },
        // tiny arms
        { shape: 'ball', size: [0.18], scale: [1, 1.6, 1], at: [-0.5, 0.84, -0.3], color: '#1b5e20', smooth: true, tag: 'armL', pivot: [-0.46, 0.98, -0.3] },
        { shape: 'ball', size: [0.18], scale: [1, 1.6, 1], at: [0.5, 0.84, -0.3], color: '#1b5e20', smooth: true, tag: 'armR', pivot: [0.46, 0.98, -0.3] },
        // big head
        { shape: 'ball', size: [1.0], scale: [1, 0.85, 1.05], at: [0, 1.52, -0.08], color: '#2e7d32', smooth: true },
        // upper jaw, the dark inside of the mouth, and nostrils
        { shape: 'ball', size: [0.72], scale: [1, 0.6, 1], at: [0, 1.44, -0.45], color: '#388e3c', smooth: true },
        { shape: 'ball', size: [0.62], scale: [1, 0.18, 0.9], at: [0, 1.32, -0.42], color: '#7f0000', smooth: true },
        { shape: 'ball', size: [0.06], at: [-0.1, 1.6, -0.72], color: '#1b5e20', smooth: true },
        { shape: 'ball', size: [0.06], at: [0.1, 1.6, -0.72], color: '#1b5e20', smooth: true },
        // a row of sharp teeth
        { shape: 'cone', size: [0.1, 0.16], at: [-0.24, 1.28, -0.655], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.1, 0.16], at: [-0.12, 1.28, -0.74], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.1, 0.16], at: [0, 1.28, -0.765], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.1, 0.16], at: [0.12, 1.28, -0.74], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.1, 0.16], at: [0.24, 1.28, -0.655], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        // lower jaw: shut most of the time, wide open for a roar after a right answer
        { shape: 'ball', size: [0.64], scale: [1, 0.38, 0.95], at: [0, 1.21, -0.4], color: '#2e7d32', smooth: true, mood: ['calm', 'oops'] },
        { shape: 'ball', size: [0.64], scale: [1, 0.38, 0.95], at: [0, 1.04, -0.36], turn: [20, 0, 0], color: '#2e7d32', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.56], scale: [1, 0.6, 0.85], at: [0, 1.2, -0.38], color: '#b71c1c', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.3], scale: [1, 0.3, 1.25], at: [0, 1.1, -0.47], color: '#ff5252', smooth: true, mood: 'yay' },
        { shape: 'cone', size: [0.09, 0.14], at: [-0.17, 1.16, -0.6], color: '#ffffff', smooth: true, mood: 'yay' },
        { shape: 'cone', size: [0.09, 0.14], at: [0.17, 1.16, -0.6], color: '#ffffff', smooth: true, mood: 'yay' },
        // yellow eyes with narrow pupils, under heavy angry brows
        { shape: 'ball', size: [0.22], at: [-0.24, 1.74, -0.4], color: '#ffeb3b', smooth: true, tag: 'eyes', pivot: [0, 1.74, -0.4] },
        { shape: 'ball', size: [0.22], at: [0.24, 1.74, -0.4], color: '#ffeb3b', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.11], scale: [0.45, 1, 1], at: [-0.24, 1.74, -0.485], color: '#111111', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.11], scale: [0.45, 1, 1], at: [0.24, 1.74, -0.485], color: '#111111', smooth: true, tag: 'eyes' },
        { shape: 'box', size: [0.34, 0.11, 0.36], at: [-0.25, 1.87, -0.33], turn: [0, 0, -24], color: '#1b5e20' },
        { shape: 'box', size: [0.34, 0.11, 0.36], at: [0.25, 1.87, -0.33], turn: [0, 0, 24], color: '#1b5e20' },
        // red spikes over the head and down the back
        { shape: 'cone', size: [0.2, 0.3], at: [0, 2.0, -0.12], color: '#e53935', smooth: true },
        { shape: 'cone', size: [0.2, 0.3], at: [0, 1.96, 0.16], turn: [30, 0, 0], color: '#e53935', smooth: true },
        { shape: 'cone', size: [0.2, 0.3], at: [0, 1.72, 0.44], turn: [62, 0, 0], color: '#e53935', smooth: true },
        { shape: 'cone', size: [0.2, 0.3], at: [0, 1.28, 0.56], turn: [78, 0, 0], color: '#e53935', smooth: true },
        { shape: 'cone', size: [0.2, 0.3], at: [0, 0.82, 0.6], turn: [82, 0, 0], color: '#e53935', smooth: true },
      ],
    },
  },

  {
    // A round grey mouse with big ears and a pink nose. An original design.
    id: 'mouse',
    name: { es: 'Ratón', en: 'Mouse' },
    unlockAt: 0,
    move: 'hop',
    facesCamera: true,
    tricks: ['bigspin', 'flip', 'dance'],
    look: {
      kind: 'shapes',
      parts: [
        // tail, curling out to one side
        { shape: 'cylinder', size: [0.07, 0.85], at: [0.5, 0.34, 0.3], turn: [50, 0, -55], color: '#f48fb1', smooth: true, tag: 'tail', pivot: [0.2, 0.2, 0.3] },
        // body and tummy
        { shape: 'ball', size: [0.92], scale: [1, 1.05, 0.9], at: [0, 0.52, 0], color: '#b0bec5', smooth: true },
        { shape: 'ball', size: [0.6], scale: [1, 1.05, 0.4], at: [0, 0.46, -0.33], color: '#eceff1', smooth: true },
        // feet and paws
        { shape: 'ball', size: [0.28], scale: [1, 0.5, 1.35], at: [-0.22, 0.07, -0.16], color: '#f8bbd0', smooth: true },
        { shape: 'ball', size: [0.28], scale: [1, 0.5, 1.35], at: [0.22, 0.07, -0.16], color: '#f8bbd0', smooth: true },
        { shape: 'ball', size: [0.2], at: [-0.43, 0.62, -0.14], color: '#b0bec5', smooth: true },
        { shape: 'ball', size: [0.2], at: [0.43, 0.62, -0.14], color: '#b0bec5', smooth: true },
        // big round ears, pink inside
        { shape: 'ball', size: [0.54], scale: [1, 1, 0.28], at: [-0.42, 1.56, 0.04], color: '#b0bec5', smooth: true, tag: 'ears', pivot: [0, 1.3, 0.04] },
        { shape: 'ball', size: [0.54], scale: [1, 1, 0.28], at: [0.42, 1.56, 0.04], color: '#b0bec5', smooth: true, tag: 'ears' },
        { shape: 'ball', size: [0.36], scale: [1, 1, 0.28], at: [-0.42, 1.56, -0.02], color: '#f8bbd0', smooth: true, tag: 'ears' },
        { shape: 'ball', size: [0.36], scale: [1, 1, 0.28], at: [0.42, 1.56, -0.02], color: '#f8bbd0', smooth: true, tag: 'ears' },
        // head
        { shape: 'ball', size: [0.86], at: [0, 1.14, 0], color: '#b0bec5', smooth: true },
        // eyes: white, pupil, and a little sparkle
        { shape: 'ball', size: [0.25], at: [-0.17, 1.22, -0.36], color: '#ffffff', smooth: true, tag: 'eyes', pivot: [0, 1.22, -0.36] },
        { shape: 'ball', size: [0.25], at: [0.17, 1.22, -0.36], color: '#ffffff', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.14], at: [-0.17, 1.22, -0.455], color: '#212121', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.14], at: [0.17, 1.22, -0.455], color: '#212121', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.045], at: [-0.2, 1.26, -0.515], color: '#ffffff', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.045], at: [0.14, 1.26, -0.515], color: '#ffffff', smooth: true, tag: 'eyes' },
        // pink nose and rosy cheeks
        { shape: 'ball', size: [0.14], at: [0, 1.07, -0.43], color: '#f06292', smooth: true, shiny: true },
        { shape: 'ball', size: [0.15], scale: [1, 0.65, 0.3], at: [-0.29, 1.03, -0.3], turn: [0, 40, 0], color: '#f8a5c2', smooth: true },
        { shape: 'ball', size: [0.15], scale: [1, 0.65, 0.3], at: [0.29, 1.03, -0.3], turn: [0, -40, 0], color: '#f8a5c2', smooth: true },
        // mouths, one for each mood
        { shape: 'arc', size: [0.15, 0.035], at: [0, 0.97, -0.405], turn: [0, 0, 180], color: '#546e7a', mood: 'calm' },
        { shape: 'ball', size: [0.16], scale: [1, 0.8, 0.3], at: [0, 0.94, -0.4], color: '#546e7a', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.09], scale: [1, 1.1, 0.3], at: [0, 0.94, -0.405], color: '#546e7a', smooth: true, mood: 'oops' },
      ],
    },
  },
];
