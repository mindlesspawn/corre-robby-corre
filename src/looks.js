// Turns a character's "look" (from src/characters.js) into something the game can show,
// and makes it move, react, do tricks, and change expression.

import * as THREE from 'three';

const DEG = Math.PI / 180;
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

// The tricks a character does when it has none of its own listed.
const DEFAULT_TRICKS = ['flip', 'bigspin', 'dance'];

function makeGeometry(part) {
  const [a = 1, b = a, c = a] = part.size ?? [];
  const around = part.smooth ? 28 : 14;
  switch (part.shape) {
    case 'ball':
      return new THREE.SphereGeometry(a / 2, around, Math.round(around * 0.7));
    case 'cylinder':
      return new THREE.CylinderGeometry(a / 2, a / 2, b, 16);
    case 'cone':
      return new THREE.ConeGeometry(a / 2, b, 16);
    case 'arc':
      // Half a ring, open side down. Turn it 180 degrees for a smile.
      return new THREE.TorusGeometry(a / 2, b / 2, 8, 20, Math.PI);
    default:
      return new THREE.BoxGeometry(a, b, c);
  }
}

function makeMaterial(part) {
  const options = { color: part.color ?? '#cccccc', flatShading: !part.smooth };
  return part.shiny
    ? new THREE.MeshPhongMaterial({ ...options, shininess: 90, specular: 0x555555 })
    : new THREE.MeshLambertMaterial(options);
}

// kind: 'shapes'
function buildShapes(parts = []) {
  const group = new THREE.Group();
  const tagged = {};
  const moods = [];
  for (const part of parts) {
    const mesh = new THREE.Mesh(makeGeometry(part), makeMaterial(part));
    const [x, y, z] = part.at ?? [0, 0, 0];
    if (part.scale) mesh.scale.set(...part.scale);
    if (part.turn) mesh.rotation.set(part.turn[0] * DEG, part.turn[1] * DEG, part.turn[2] * DEG);
    if (part.mood) moods.push({ mesh, mood: part.mood });

    if (part.tag) {
      // Parts with the same tag move together around one pivot point.
      let pivot = tagged[part.tag];
      if (!pivot) {
        pivot = new THREE.Group();
        const [px, py, pz] = part.pivot ?? part.at ?? [0, 0, 0];
        pivot.position.set(px, py, pz);
        group.add(pivot);
        tagged[part.tag] = pivot;
      }
      mesh.position.set(x - pivot.position.x, y - pivot.position.y, z - pivot.position.z);
      pivot.add(mesh);
    } else {
      mesh.position.set(x, y, z);
      group.add(mesh);
    }
  }
  return { group, tagged, moods };
}

// The one place that knows how to build each kind of look.
// A picture or 3D model look gets added here as a new case.
export function buildLook(look) {
  switch (look?.kind) {
    case 'shapes':
      return buildShapes(look.parts);
    default:
      throw new Error(`Unknown look kind "${look?.kind}". Add it to buildLook() in src/looks.js.`);
  }
}

export function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material?.map?.dispose();
      material?.dispose();
    });
  });
}

const smooth = (p) => p * p * (3 - 2 * p);

// Builds a character ready to place in the scene.
//   root     put this in the scene and move it around
//   front    how far it sticks out toward the doors
//   update   call every frame to animate it
//   react    'cheer' (jump and spin), 'oops' (dizzy wobble), 'party' (keeps celebrating),
//            'trick' (the character's next special trick), or a trick by name:
//            'flip' (backflip), 'bigspin' (high jump, two spins), 'dance' (side-to-side wiggle)
//   calm     back to normal
export function buildCharacter(def) {
  const root = new THREE.Group();
  const reaction = new THREE.Group(); // jumps, spins and wobbles
  const flipper = new THREE.Group(); // turns head over heels around the character's middle
  const unflip = new THREE.Group();
  const lean = new THREE.Group(); // tilts into a lane change
  root.add(reaction);
  reaction.add(flipper);
  flipper.add(unflip);
  unflip.add(lean);

  const { group: body, tagged, moods = [] } = buildLook(def.look);
  if (def.facesCamera) body.rotation.y = Math.PI;

  const size = new THREE.Box3().setFromObject(body);
  const front = Math.max(0.3, -size.min.z);
  const radius = Math.max(0.2, (size.max.x - size.min.x) / 2);
  const middle = Math.max(0.3, size.max.y / 2);
  flipper.position.y = middle;
  unflip.position.y = -middle;
  // A backflip goes head-first away from the way the character is looking.
  const backward = def.facesCamera ? -1 : 1;

  let spin = null;
  if (def.move === 'roll') {
    spin = new THREE.Group();
    spin.position.y = radius;
    body.position.y = -radius;
    spin.add(body);
    unflip.add(spin);
  } else {
    lean.add(body);
  }

  // Expressions: a part with mood 'oops' only shows while the character is in that mood.
  function setMood(name) {
    const known = moods.some((entry) => entry.mood === name);
    const show = known ? name : 'calm';
    for (const entry of moods) entry.mesh.visible = entry.mood === show;
  }
  setMood('calm');

  const tricks = def.tricks?.length ? def.tricks : DEFAULT_TRICKS;
  let nextTrick = 0;
  let phase = 0;
  let acting = null; // { kind, time }
  let blinkIn = 1.5 + Math.random() * 2;
  let blinkFor = 0;

  function stand() {
    reaction.position.set(0, 0, 0);
    reaction.rotation.set(0, 0, 0);
    flipper.rotation.set(0, 0, 0);
  }

  function calm() {
    acting = null;
    stand();
    setMood('calm');
  }

  function playReaction(dt) {
    stand();
    if (!acting) return;
    acting.time += dt;
    const s = acting.time;

    switch (acting.kind) {
      case 'cheer': {
        const p = Math.min(1, s / 0.6);
        reaction.position.y = Math.sin(Math.PI * p) * 0.9;
        reaction.rotation.y = smooth(p) * Math.PI * 2;
        if (s > 1.0) calm();
        break;
      }
      case 'flip': {
        const p = Math.min(1, s / 0.8);
        reaction.position.y = Math.sin(Math.PI * p) * 1.5;
        flipper.rotation.x = backward * smooth(p) * Math.PI * 2;
        if (s > 1.15) calm();
        break;
      }
      case 'bigspin': {
        const p = Math.min(1, s / 0.85);
        reaction.position.y = Math.sin(Math.PI * p) * 1.3;
        reaction.rotation.y = smooth(p) * Math.PI * 4;
        if (s > 1.15) calm();
        break;
      }
      case 'dance': {
        const fade = 1 - Math.min(1, s / 1.2) * 0.4;
        reaction.rotation.z = Math.sin(s * 14) * 0.32 * fade;
        reaction.position.y = Math.abs(Math.sin(s * 14)) * 0.28;
        if (s > 1.2) calm();
        break;
      }
      case 'oops': {
        const p = Math.min(1, s / 0.9);
        reaction.rotation.z = Math.sin(s * 22) * 0.3 * (1 - p);
        if (s > 1.5) calm();
        break;
      }
      case 'party': {
        // Keeps going until calm(): a spin, then a backflip, and round again.
        const p = (s % 0.8) / 0.8;
        reaction.position.y = Math.sin(Math.PI * p) * 1.0;
        if (Math.floor(s / 0.8) % 2) flipper.rotation.x = backward * p * Math.PI * 2;
        else reaction.rotation.y = p * Math.PI * 2;
        break;
      }
      default:
        calm();
    }
  }

  return {
    def,
    root,
    front,
    calm,

    react(kind) {
      let chosen = kind;
      if (kind === 'trick') {
        chosen = tricks[nextTrick % tricks.length];
        nextTrick += 1;
      }
      acting = { kind: chosen, time: 0 };
      setMood(chosen === 'oops' ? 'oops' : 'yay');
      return chosen;
    },

    // speed: how fast the belt moves. sideways: -1..1, how hard it is changing lanes.
    // dx: how far it moved sideways this frame.
    update(dt, speed, sideways, dx) {
      const stepsPerSecond = 1.5 + speed * 0.13;
      phase += dt * stepsPerSecond * Math.PI * 2;
      playReaction(dt);

      if (tagged.eyes) {
        blinkIn -= dt;
        if (blinkIn <= 0) {
          blinkFor = 0.13;
          blinkIn = 2.2 + Math.random() * 2.5;
        }
        blinkFor -= dt;
        tagged.eyes.scale.y = blinkFor > 0 ? 0.12 : 1;
      }

      if (def.move === 'roll') {
        spin.rotateOnWorldAxis(X_AXIS, (-speed * dt) / radius);
        spin.rotateOnWorldAxis(Z_AXIS, -dx / radius);
        return;
      }

      lean.rotation.z = -sideways * 0.3;

      if (def.move === 'bounce') {
        // Stays upright and bounces along, squashing a little when it lands.
        const air = Math.abs(Math.sin(phase / 2));
        const squash = 1 - air;
        body.position.y = air * 0.26;
        body.scale.set(1 + squash * 0.07, 0.93 + air * 0.1, 1 + squash * 0.07);
        lean.rotation.z += Math.sin(phase / 2) * 0.07;
        if (tagged.leaf) tagged.leaf.rotation.z = Math.sin(phase) * 0.18;
        if (tagged.tail) tagged.tail.rotation.y = Math.sin(phase / 2) * 0.35;
        if (tagged.armL) tagged.armL.rotation.z = -0.25 - air * 0.5;
        if (tagged.armR) tagged.armR.rotation.z = 0.25 + air * 0.5;
        return;
      }

      if (def.move === 'hop') {
        const air = Math.abs(Math.sin(phase / 2));
        body.position.y = air * 0.42;
        body.scale.y = 0.92 + air * 0.12;
        if (tagged.tail) tagged.tail.rotation.x = -air * 0.5;
        if (tagged.ears) tagged.ears.rotation.x = -air * 0.22;
        return;
      }

      // 'run'
      const swing = Math.sin(phase);
      body.position.y = Math.abs(swing) * 0.08;
      if (tagged.legL) tagged.legL.rotation.x = swing * 0.9;
      if (tagged.legR) tagged.legR.rotation.x = -swing * 0.9;
      if (tagged.armL) tagged.armL.rotation.x = -swing * 0.6;
      if (tagged.armR) tagged.armR.rotation.x = swing * 0.6;
      if (tagged.tail) tagged.tail.rotation.y = Math.sin(phase / 2) * 0.3;
    },
  };
}

// Takes a small snapshot of each character for the picker on the start screen.
// Returns { characterId: imageUrl }. If snapshots cannot be made, returns {}.
export function renderThumbnails(defs, pixels = 220) {
  const shots = {};
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  } catch {
    return shots;
  }
  renderer.setSize(pixels, pixels, false);
  renderer.setClearColor(0x000000, 0);

  for (const def of defs) {
    try {
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.4));
      const sun = new THREE.DirectionalLight(0xffffff, 1.5);
      sun.position.set(3, 6, 5);
      scene.add(sun);

      const character = buildCharacter(def);
      // Turned to show its face. A character that already faces the camera only needs a little turn.
      character.root.rotation.y = def.facesCamera ? -0.3 : Math.PI * 0.8;
      scene.add(character.root);

      const box = new THREE.Box3().setFromObject(character.root);
      const centre = box.getCenter(new THREE.Vector3());
      const extent = box.getSize(new THREE.Vector3());
      const reach = Math.max(extent.x, extent.y, extent.z) * 0.62;

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(centre.x, centre.y + reach * 0.4, centre.z + reach / Math.tan(15 * DEG));
      camera.lookAt(centre);

      renderer.render(scene, camera);
      shots[def.id] = renderer.domElement.toDataURL('image/png');
      disposeObject(character.root);
    } catch (error) {
      console.warn(`Could not draw a snapshot of "${def.id}"`, error);
    }
  }

  renderer.dispose();
  renderer.forceContextLoss();
  return shots;
}
