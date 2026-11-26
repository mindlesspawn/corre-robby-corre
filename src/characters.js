// THE CHARACTER LIST
//
// Add, remove, or change a runner by editing this list. Nothing else in the
// game needs to change.
//
//   id           short name used in saved data (do not change once kids have played)
//   name         what the player sees, in each language
//   unlockAt     total points needed to unlock it (0 = free from the start)
//   move         how it moves: 'bounce', 'run', 'hop', or 'roll'
//   facesCamera  true if it should look at the player instead of at the doors
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
//   A rolling character spins around a point half its width above the ground.

export const CHARACTERS = [
  {
    id: 'apple',
    name: { es: 'Manzana', en: 'Apple' },
    unlockAt: 0,
    move: 'bounce',
    facesCamera: true,
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
    id: 'dino',
    name: { es: 'Dinosaurio', en: 'Dinosaur' },
    unlockAt: 25,
    move: 'run',
    look: {
      kind: 'shapes',
      parts: [
        // legs
        { shape: 'box', size: [0.32, 0.8, 0.4], at: [-0.3, 0.4, 0.05], pivot: [-0.3, 0.8, 0.05], tag: 'legL', color: '#2e7d32' },
        { shape: 'box', size: [0.32, 0.8, 0.4], at: [0.3, 0.4, 0.05], pivot: [0.3, 0.8, 0.05], tag: 'legR', color: '#2e7d32' },
        // body and head
        { shape: 'box', size: [0.95, 0.85, 1.3], at: [0, 1.2, 0], color: '#43a047' },
        { shape: 'box', size: [0.7, 0.65, 0.85], at: [0, 1.82, -0.72], color: '#4caf50' },
        { shape: 'box', size: [0.5, 0.3, 0.4], at: [0, 1.65, -1.25], color: '#66bb6a' },
        // eyes
        { shape: 'box', size: [0.06, 0.18, 0.18], at: [-0.36, 1.95, -0.85], color: '#ffffff' },
        { shape: 'box', size: [0.06, 0.18, 0.18], at: [0.36, 1.95, -0.85], color: '#ffffff' },
        { shape: 'box', size: [0.07, 0.09, 0.09], at: [-0.37, 1.95, -0.89], color: '#212121' },
        { shape: 'box', size: [0.07, 0.09, 0.09], at: [0.37, 1.95, -0.89], color: '#212121' },
        // little arms
        { shape: 'box', size: [0.14, 0.38, 0.14], at: [-0.54, 1.12, -0.45], pivot: [-0.54, 1.3, -0.45], tag: 'armL', color: '#2e7d32' },
        { shape: 'box', size: [0.14, 0.38, 0.14], at: [0.54, 1.12, -0.45], pivot: [0.54, 1.3, -0.45], tag: 'armR', color: '#2e7d32' },
        // tail
        { shape: 'box', size: [0.6, 0.5, 0.6], at: [0, 1.1, 0.9], pivot: [0, 1.1, 0.6], tag: 'tail', color: '#43a047' },
        { shape: 'box', size: [0.4, 0.34, 0.6], at: [0, 1.0, 1.45], tag: 'tail', color: '#4caf50' },
        { shape: 'box', size: [0.22, 0.2, 0.5], at: [0, 0.92, 1.95], tag: 'tail', color: '#66bb6a' },
        // back plates
        { shape: 'box', size: [0.12, 0.34, 0.34], at: [0, 1.66, -0.3], turn: [45, 0, 0], color: '#fb8c00' },
        { shape: 'box', size: [0.12, 0.38, 0.38], at: [0, 1.68, 0.12], turn: [45, 0, 0], color: '#fb8c00' },
        { shape: 'box', size: [0.12, 0.3, 0.3], at: [0, 1.64, 0.5], turn: [45, 0, 0], color: '#fb8c00' },
      ],
    },
  },

  {
    id: 'mouse',
    name: { es: 'Ratón', en: 'Mouse' },
    unlockAt: 60,
    move: 'hop',
    look: {
      kind: 'shapes',
      parts: [
        // body and head
        { shape: 'ball', size: [1.0], scale: [1, 0.9, 1.2], at: [0, 0.52, 0], color: '#9e9e9e' },
        { shape: 'ball', size: [0.78], at: [0, 1.1, -0.35], color: '#b0b0b0' },
        // face
        { shape: 'ball', size: [0.16], at: [0, 1.04, -0.75], color: '#f48fb1' },
        { shape: 'ball', size: [0.1], at: [-0.18, 1.22, -0.68], color: '#212121' },
        { shape: 'ball', size: [0.1], at: [0.18, 1.22, -0.68], color: '#212121' },
        // ears: grey outside, pink inside
        { shape: 'cylinder', size: [0.5, 0.08], at: [-0.36, 1.56, -0.3], turn: [90, 0, 0], tag: 'ears', pivot: [0, 1.3, -0.3], color: '#8d8d8d' },
        { shape: 'cylinder', size: [0.5, 0.08], at: [0.36, 1.56, -0.3], turn: [90, 0, 0], tag: 'ears', color: '#8d8d8d' },
        { shape: 'cylinder', size: [0.32, 0.04], at: [-0.36, 1.56, -0.35], turn: [90, 0, 0], tag: 'ears', color: '#f8bbd0' },
        { shape: 'cylinder', size: [0.32, 0.04], at: [0.36, 1.56, -0.35], turn: [90, 0, 0], tag: 'ears', color: '#f8bbd0' },
        // feet
        { shape: 'box', size: [0.22, 0.12, 0.36], at: [-0.28, 0.06, -0.15], color: '#f8bbd0' },
        { shape: 'box', size: [0.22, 0.12, 0.36], at: [0.28, 0.06, -0.15], color: '#f8bbd0' },
        // tail
        { shape: 'cylinder', size: [0.08, 0.8], at: [0, 0.5, 0.85], turn: [65, 0, 0], pivot: [0, 0.4, 0.5], tag: 'tail', color: '#f48fb1' },
        // little yellow backpack
        { shape: 'box', size: [0.46, 0.4, 0.26], at: [0, 0.98, 0.42], turn: [-15, 0, 0], color: '#fdd835' },
      ],
    },
  },
];
