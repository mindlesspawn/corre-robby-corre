// Turns a character's "look" (from src/characters.js) into something the game can show,
// and makes it move.

import * as THREE from 'three';

const DEG = Math.PI / 180;
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

function makeGeometry(part) {
  const [a = 1, b = a, c = a] = part.size ?? [];
  switch (part.shape) {
    case 'ball':
      return new THREE.SphereGeometry(a / 2, 14, 10);
    case 'cylinder':
      return new THREE.CylinderGeometry(a / 2, a / 2, b, 16);
    case 'cone':
      return new THREE.ConeGeometry(a / 2, b, 16);
    default:
      return new THREE.BoxGeometry(a, b, c);
  }
}

// kind: 'shapes'
function buildShapes(parts = []) {
  const group = new THREE.Group();
  const tagged = {};
  for (const part of parts) {
    const material = new THREE.MeshLambertMaterial({ color: part.color ?? '#cccccc', flatShading: true });
    const mesh = new THREE.Mesh(makeGeometry(part), material);
    const [x, y, z] = part.at ?? [0, 0, 0];
    if (part.scale) mesh.scale.set(...part.scale);
    if (part.turn) mesh.rotation.set(part.turn[0] * DEG, part.turn[1] * DEG, part.turn[2] * DEG);

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
  return { group, tagged };
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

// Builds a character ready to place in the scene.
//   root    put this in the scene and move it around
//   front   how far its nose sticks out ahead of its centre
//   update  call every frame to animate it
export function buildCharacter(def) {
  const root = new THREE.Group();
  const { group: body, tagged } = buildLook(def.look);

  const size = new THREE.Box3().setFromObject(body);
  const front = Math.max(0.3, -size.min.z);
  const radius = Math.max(0.2, (size.max.x - size.min.x) / 2);

  const lean = new THREE.Group(); // tilts into a lane change
  root.add(lean);

  let spin = null;
  if (def.move === 'roll') {
    spin = new THREE.Group();
    spin.position.y = radius;
    body.position.y = -radius;
    spin.add(body);
    root.add(spin);
  } else {
    lean.add(body);
  }

  let phase = 0;

  return {
    def,
    root,
    front,

    // speed: how fast the belt moves. sideways: -1..1, how hard it is changing lanes.
    // dx: how far it moved sideways this frame.
    update(dt, speed, sideways, dx) {
      const stepsPerSecond = 1.5 + speed * 0.13;
      phase += dt * stepsPerSecond * Math.PI * 2;

      if (def.move === 'roll') {
        spin.rotateOnWorldAxis(X_AXIS, (-speed * dt) / radius);
        spin.rotateOnWorldAxis(Z_AXIS, -dx / radius);
        return;
      }

      lean.rotation.z = -sideways * 0.3;

      if (def.move === 'hop') {
        const air = Math.abs(Math.sin(phase / 2));
        body.position.y = air * 0.42;
        body.scale.y = 0.92 + air * 0.12;
        if (tagged.tail) tagged.tail.rotation.x = -air * 0.5;
        if (tagged.ears) tagged.ears.rotation.x = air * 0.25;
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
      character.root.rotation.y = Math.PI * 0.8; // turned to show its face
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
