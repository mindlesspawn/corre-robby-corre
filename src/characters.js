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
    // A chunky T. rex: long snout, toothy overbite, tiny arms, strong running legs and a thick
    // curling tail. Tough brows over friendly eyes. Its jaw drops open after a right answer.
    id: 'dino',
    name: { es: 'Dinosaurio', en: 'Dinosaur' },
    unlockAt: 0,
    move: 'run',
    facesCamera: true,
    tricks: ['flip', 'dance', 'bigspin'],
    look: {
      kind: 'shapes',
      parts: [
        // thick tail, curling out to one side so it shows from the front, with dark stripes
        { shape: 'ball', size: [0.66], at: [0.04, 0.58, 0.5], color: '#4caf50', smooth: true, tag: 'tail', pivot: [0, 0.6, 0.35] },
        { shape: 'ball', size: [0.58], at: [0.1, 0.53, 0.7], color: '#4caf50', smooth: true, tag: 'tail' },
        { shape: 'ball', size: [0.5], at: [0.19, 0.48, 0.88], color: '#4caf50', smooth: true, tag: 'tail' },
        { shape: 'ball', size: [0.43], at: [0.3, 0.43, 1.04], color: '#4caf50', smooth: true, tag: 'tail' },
        { shape: 'ball', size: [0.36], at: [0.43, 0.39, 1.18], color: '#4caf50', smooth: true, tag: 'tail' },
        { shape: 'ball', size: [0.29], at: [0.57, 0.35, 1.3], color: '#4caf50', smooth: true, tag: 'tail' },
        { shape: 'cone', size: [0.24, 0.46], at: [0.72, 0.33, 1.43], turn: [95, 0, -50], color: '#4caf50', smooth: true, tag: 'tail' },
        { shape: 'ball', size: [0.4], scale: [1.1, 0.3, 0.5], at: [0.04, 0.86, 0.52], color: '#2e7d32', smooth: true, tag: 'tail' },
        { shape: 'ball', size: [0.3], scale: [1.1, 0.3, 0.5], at: [0.19, 0.69, 0.88], color: '#2e7d32', smooth: true, tag: 'tail' },
        { shape: 'ball', size: [0.22], scale: [1.1, 0.3, 0.5], at: [0.43, 0.54, 1.18], color: '#2e7d32', smooth: true, tag: 'tail' },
        // body, pale tummy, and dark stripes down the back
        { shape: 'ball', size: [1.12], scale: [1, 1.14, 1.04], at: [0, 0.84, 0.06], color: '#4caf50', smooth: true },
        { shape: 'ball', size: [0.84], scale: [1, 1.12, 0.42], at: [0, 0.78, -0.37], color: '#e6ee9c', smooth: true },
        { shape: 'ball', size: [0.5], scale: [1.3, 0.24, 0.5], at: [0, 1.2, 0.44], color: '#2e7d32', smooth: true },
        { shape: 'ball', size: [0.56], scale: [1.3, 0.24, 0.5], at: [0, 0.9, 0.54], color: '#2e7d32', smooth: true },
        // strong legs that run: thigh, shin, big foot, three white claws
        { shape: 'ball', size: [0.56], scale: [0.92, 1.1, 1.12], at: [-0.37, 0.5, 0.03], color: '#388e3c', smooth: true, tag: 'legL', pivot: [-0.36, 0.62, 0.04] },
        { shape: 'cylinder', size: [0.22, 0.3], at: [-0.37, 0.22, 0.03], color: '#388e3c', smooth: true, tag: 'legL' },
        { shape: 'ball', size: [0.46], scale: [1, 0.44, 1.5], at: [-0.37, 0.1, -0.15], color: '#388e3c', smooth: true, tag: 'legL' },
        { shape: 'cone', size: [0.1, 0.16], at: [-0.5, 0.07, -0.44], turn: [-90, 0, 0], color: '#fafafa', smooth: true, tag: 'legL' },
        { shape: 'cone', size: [0.1, 0.16], at: [-0.37, 0.07, -0.5], turn: [-90, 0, 0], color: '#fafafa', smooth: true, tag: 'legL' },
        { shape: 'cone', size: [0.1, 0.16], at: [-0.24, 0.07, -0.44], turn: [-90, 0, 0], color: '#fafafa', smooth: true, tag: 'legL' },
        { shape: 'ball', size: [0.56], scale: [0.92, 1.1, 1.12], at: [0.37, 0.5, 0.03], color: '#388e3c', smooth: true, tag: 'legR', pivot: [0.36, 0.62, 0.04] },
        { shape: 'cylinder', size: [0.22, 0.3], at: [0.37, 0.22, 0.03], color: '#388e3c', smooth: true, tag: 'legR' },
        { shape: 'ball', size: [0.46], scale: [1, 0.44, 1.5], at: [0.37, 0.1, -0.15], color: '#388e3c', smooth: true, tag: 'legR' },
        { shape: 'cone', size: [0.1, 0.16], at: [0.24, 0.07, -0.44], turn: [-90, 0, 0], color: '#fafafa', smooth: true, tag: 'legR' },
        { shape: 'cone', size: [0.1, 0.16], at: [0.37, 0.07, -0.5], turn: [-90, 0, 0], color: '#fafafa', smooth: true, tag: 'legR' },
        { shape: 'cone', size: [0.1, 0.16], at: [0.5, 0.07, -0.44], turn: [-90, 0, 0], color: '#fafafa', smooth: true, tag: 'legR' },
        // tiny arms, each with two little claws
        { shape: 'ball', size: [0.2], scale: [1, 1.5, 1], at: [-0.46, 1.0, -0.3], turn: [35, 0, 0], color: '#388e3c', smooth: true, tag: 'armL', pivot: [-0.44, 1.12, -0.2] },
        { shape: 'cone', size: [0.06, 0.1], at: [-0.5, 0.88, -0.42], turn: [-140, 0, 0], color: '#fafafa', smooth: true, tag: 'armL' },
        { shape: 'cone', size: [0.06, 0.1], at: [-0.42, 0.88, -0.42], turn: [-140, 0, 0], color: '#fafafa', smooth: true, tag: 'armL' },
        { shape: 'ball', size: [0.2], scale: [1, 1.5, 1], at: [0.46, 1.0, -0.3], turn: [35, 0, 0], color: '#388e3c', smooth: true, tag: 'armR', pivot: [0.44, 1.12, -0.2] },
        { shape: 'cone', size: [0.06, 0.1], at: [0.42, 0.88, -0.42], turn: [-140, 0, 0], color: '#fafafa', smooth: true, tag: 'armR' },
        { shape: 'cone', size: [0.06, 0.1], at: [0.5, 0.88, -0.42], turn: [-140, 0, 0], color: '#fafafa', smooth: true, tag: 'armR' },
        // big head with a long snout, nostril bumps, and stripes on top
        { shape: 'ball', size: [0.94], scale: [1.06, 0.88, 1], at: [0, 1.62, -0.06], color: '#4caf50', smooth: true },
        { shape: 'ball', size: [0.76], scale: [0.94, 0.6, 1.15], at: [0, 1.58, -0.5], color: '#4caf50', smooth: true },
        { shape: 'ball', size: [0.14], at: [-0.13, 1.74, -0.78], color: '#4caf50', smooth: true },
        { shape: 'ball', size: [0.14], at: [0.13, 1.74, -0.78], color: '#4caf50', smooth: true },
        { shape: 'ball', size: [0.05], at: [-0.13, 1.782, -0.836], color: '#1b5e20', smooth: true },
        { shape: 'ball', size: [0.05], at: [0.13, 1.782, -0.836], color: '#1b5e20', smooth: true },
        { shape: 'ball', size: [0.4], scale: [1.15, 0.28, 0.6], at: [0, 1.99, 0], color: '#2e7d32', smooth: true },
        { shape: 'ball', size: [0.34], scale: [1.15, 0.28, 0.6], at: [0, 1.93, 0.2], turn: [30, 0, 0], color: '#2e7d32', smooth: true },
        // the dark line of the mouth, and a row of teeth that hang over the lower jaw
        { shape: 'ball', size: [0.6], scale: [0.84, 0.2, 1.04], at: [0, 1.39, -0.45], color: '#7f0000', smooth: true },
        { shape: 'cone', size: [0.075, 0.12], at: [-0.215, 1.345, -0.51], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.075, 0.12], at: [-0.19, 1.345, -0.624], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.075, 0.12], at: [-0.114, 1.345, -0.725], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.075, 0.12], at: [0, 1.345, -0.765], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.075, 0.12], at: [0.114, 1.345, -0.725], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.075, 0.12], at: [0.19, 1.345, -0.624], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        { shape: 'cone', size: [0.075, 0.12], at: [0.215, 1.345, -0.51], turn: [180, 0, 0], color: '#ffffff', smooth: true },
        // lower jaw: shut most of the time, dropped open for a roar after a right answer
        { shape: 'ball', size: [0.6], scale: [0.9, 0.4, 1.05], at: [0, 1.29, -0.4], color: '#4caf50', smooth: true, mood: ['calm', 'oops'] },
        { shape: 'ball', size: [0.6], scale: [0.9, 0.4, 1.05], at: [0, 1.1, -0.36], turn: [-18, 0, 0], color: '#4caf50', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.52], scale: [0.9, 0.7, 0.9], at: [0, 1.26, -0.4], color: '#b71c1c', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.3], scale: [1, 0.3, 1.3], at: [0, 1.17, -0.45], color: '#ff5252', smooth: true, mood: 'yay' },
        { shape: 'cone', size: [0.075, 0.12], at: [-0.15, 1.2, -0.6], color: '#ffffff', smooth: true, mood: 'yay' },
        { shape: 'cone', size: [0.075, 0.12], at: [0.15, 1.2, -0.6], color: '#ffffff', smooth: true, mood: 'yay' },
        // yellow eyes with a sparkle. The brows sit low most of the time and lift when it is happy.
        { shape: 'ball', size: [0.26], at: [-0.27, 1.84, -0.34], color: '#ffee58', smooth: true, tag: 'eyes', pivot: [0, 1.84, -0.34] },
        { shape: 'ball', size: [0.26], at: [0.27, 1.84, -0.34], color: '#ffee58', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.15], at: [-0.26, 1.84, -0.44], color: '#111111', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.15], at: [0.26, 1.84, -0.44], color: '#111111', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.05], at: [-0.285, 1.878, -0.5], color: '#ffffff', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.05], at: [0.235, 1.878, -0.5], color: '#ffffff', smooth: true, tag: 'eyes' },
        { shape: 'ball', size: [0.28], scale: [1, 0.3, 0.7], at: [-0.27, 1.99, -0.3], turn: [0, 0, -5], color: '#2e7d32', smooth: true, mood: ['calm', 'oops'] },
        { shape: 'ball', size: [0.28], scale: [1, 0.3, 0.7], at: [0.27, 1.99, -0.3], turn: [0, 0, 5], color: '#2e7d32', smooth: true, mood: ['calm', 'oops'] },
        { shape: 'ball', size: [0.28], scale: [1, 0.3, 0.7], at: [-0.28, 2.05, -0.3], turn: [0, 0, 12], color: '#2e7d32', smooth: true, mood: 'yay' },
        { shape: 'ball', size: [0.28], scale: [1, 0.3, 0.7], at: [0.28, 2.05, -0.3], turn: [0, 0, -12], color: '#2e7d32', smooth: true, mood: 'yay' },
      ],
    },
  },

  {
    // A regular ninja: dark suit and hood, red headband and sash, wrapped arms and legs,
    // and two swords crossed on its back, which show best when it jumps and spins.
    id: 'ninja',
    name: { es: 'Ninja', en: 'Ninja' },
    unlockAt: 0,
    move: 'run',
    facesCamera: true,
    tricks: ['flip', 'bigspin', 'dance'], // a ninja leads with a backflip
    look: {
      kind: 'shapes',
      parts: [
        // two swords crossed on the back: dark sheath, gold guard, pale grip, gold ends
        { shape: 'cylinder', size: [0.1, 1.05], at: [-0.014, 0.73, 0.36], turn: [0, 0, -35], color: '#5d4037', smooth: true },
        { shape: 'ball', size: [0.11], at: [-0.316, 0.3, 0.36], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cylinder', size: [0.22, 0.04], at: [0.298, 1.176, 0.36], turn: [0, 0, -35], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cylinder', size: [0.09, 0.5], at: [0.459, 1.405, 0.36], turn: [0, 0, -35], color: '#eceff1', smooth: true },
        { shape: 'ball', size: [0.12], at: [0.614, 1.626, 0.36], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cylinder', size: [0.1, 1.05], at: [0.014, 0.73, 0.43], turn: [0, 0, 35], color: '#5d4037', smooth: true },
        { shape: 'ball', size: [0.11], at: [0.316, 0.3, 0.43], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cylinder', size: [0.22, 0.04], at: [-0.298, 1.176, 0.43], turn: [0, 0, 35], color: '#fdd835', smooth: true, shiny: true },
        { shape: 'cylinder', size: [0.09, 0.5], at: [-0.459, 1.405, 0.43], turn: [0, 0, 35], color: '#eceff1', smooth: true },
        { shape: 'ball', size: [0.12], at: [-0.614, 1.626, 0.43], color: '#fdd835', smooth: true, shiny: true },
        // legs that run: dark trousers, grey shin wraps, soft black shoes
        { shape: 'cylinder', size: [0.24, 0.44], at: [-0.17, 0.33, 0], color: '#263159', smooth: true, tag: 'legL', pivot: [-0.17, 0.52, 0] },
        { shape: 'cylinder', size: [0.26, 0.16], at: [-0.17, 0.25, 0], color: '#b0bec5', smooth: true, tag: 'legL' },
        { shape: 'ball', size: [0.3], scale: [1, 0.6, 1.35], at: [-0.17, 0.09, -0.06], color: '#151a33', smooth: true, tag: 'legL' },
        { shape: 'cylinder', size: [0.24, 0.44], at: [0.17, 0.33, 0], color: '#263159', smooth: true, tag: 'legR', pivot: [0.17, 0.52, 0] },
        { shape: 'cylinder', size: [0.26, 0.16], at: [0.17, 0.25, 0], color: '#b0bec5', smooth: true, tag: 'legR' },
        { shape: 'ball', size: [0.3], scale: [1, 0.6, 1.35], at: [0.17, 0.09, -0.06], color: '#151a33', smooth: true, tag: 'legR' },
        // dark suit with a red sash tied at the side
        { shape: 'ball', size: [0.72], scale: [1, 1.1, 0.82], at: [0, 0.88, 0], color: '#263159', smooth: true },
        { shape: 'cylinder', size: [0.7, 0.11], scale: [1, 1, 0.84], at: [0, 0.7, 0], color: '#e53935', smooth: true },
        { shape: 'ball', size: [0.14], at: [0.2, 0.7, -0.27], color: '#e53935', smooth: true },
        { shape: 'box', size: [0.08, 0.24, 0.03], at: [0.17, 0.57, -0.29], turn: [0, 0, -8], color: '#e53935' },
        { shape: 'box', size: [0.08, 0.2, 0.03], at: [0.25, 0.59, -0.28], turn: [0, 0, 14], color: '#e53935' },
        // arms that swing: dark sleeves, grey wrist wraps, bare hands
        { shape: 'cylinder', size: [0.17, 0.44], at: [-0.42, 0.9, 0], turn: [0, 0, -16], color: '#263159', smooth: true, tag: 'armL', pivot: [-0.34, 1.08, 0] },
        { shape: 'cylinder', size: [0.185, 0.14], at: [-0.455, 0.78, 0], turn: [0, 0, -16], color: '#b0bec5', smooth: true, tag: 'armL' },
        { shape: 'ball', size: [0.2], at: [-0.49, 0.67, 0], color: '#f2c9a0', smooth: true, tag: 'armL' },
        { shape: 'cylinder', size: [0.17, 0.44], at: [0.42, 0.9, 0], turn: [0, 0, 16], color: '#263159', smooth: true, tag: 'armR', pivot: [0.34, 1.08, 0] },
        { shape: 'cylinder', size: [0.185, 0.14], at: [0.455, 0.78, 0], turn: [0, 0, 16], color: '#b0bec5', smooth: true, tag: 'armR' },
        { shape: 'ball', size: [0.2], at: [0.49, 0.67, 0], color: '#f2c9a0', smooth: true, tag: 'armR' },
        // hooded head, with an opening that shows only the eyes
        { shape: 'ball', size: [0.82], at: [0, 1.5, 0], color: '#263159', smooth: true },
        { shape: 'ball', size: [0.66], scale: [1, 0.36, 0.5], at: [0, 1.53, -0.262], color: '#f2c9a0', smooth: true },
        // eyes: round with a sparkle most of the time, happy curves after a right answer
        { shape: 'ball', size: [0.13], scale: [1, 1.15, 0.5], at: [-0.14, 1.53, -0.41], color: '#111111', smooth: true, tag: 'eyes', pivot: [0, 1.53, -0.4], mood: ['calm', 'oops'] },
        { shape: 'ball', size: [0.13], scale: [1, 1.15, 0.5], at: [0.14, 1.53, -0.41], color: '#111111', smooth: true, tag: 'eyes', mood: ['calm', 'oops'] },
        { shape: 'ball', size: [0.045], at: [-0.155, 1.556, -0.43], color: '#ffffff', smooth: true, tag: 'eyes', mood: ['calm', 'oops'] },
        { shape: 'ball', size: [0.045], at: [0.125, 1.556, -0.43], color: '#ffffff', smooth: true, tag: 'eyes', mood: ['calm', 'oops'] },
        { shape: 'arc', size: [0.15, 0.04], at: [-0.14, 1.51, -0.43], color: '#111111', mood: 'yay' },
        { shape: 'arc', size: [0.15, 0.04], at: [0.14, 1.51, -0.43], color: '#111111', mood: 'yay' },
        // red headband, knotted at the back with two tails that sway
        { shape: 'cylinder', size: [0.78, 0.1], at: [0, 1.7, 0], color: '#e53935', smooth: true },
        { shape: 'ball', size: [0.14], at: [0, 1.7, 0.39], color: '#e53935', smooth: true },
        { shape: 'box', size: [0.08, 0.36, 0.03], at: [-0.06, 1.53, 0.49], turn: [22, 0, -10], color: '#e53935', tag: 'tail', pivot: [0, 1.7, 0.4] },
        { shape: 'box', size: [0.08, 0.3, 0.03], at: [0.07, 1.56, 0.5], turn: [26, 0, 12], color: '#e53935', tag: 'tail' },
      ],
    },
  },
];
