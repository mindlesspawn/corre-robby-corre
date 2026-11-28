// The 3D world and the rules of a run: treadmill, runner, doors, right and wrong.
// It knows nothing about menus, saving, or speech. It reports what happens through "events".

import * as THREE from 'three';
import { COLORS, CONFIG, DOOR_COLORS, THEME } from './config.js';
import { buildCharacter, disposeObject } from './looks.js';
import { drawFace, faceSpot } from './faces.js';
import { LEVELS, SHAPES, THINGS, makeQuestion, shuffle } from './questions.js';

const LANE_X = [-CONFIG.laneWidth, 0, CONFIG.laneWidth];
const BELT_HALF = CONFIG.laneWidth * 1.5;

const FRONT_Z = 0; // where the runner normally is
const BACK_Z = 2.9; // where a wrong door bumps it to
const EDGE_Z = 5.4; // back end of the treadmill (nearest the camera)
const FAR_Z = -100; // far end, hidden in the haze
const FLOOR_Y = -1;

const CAMERA_HEIGHT_ANGLE = (24 * Math.PI) / 180; // how steeply the camera looks down on the runner
const RUNNER_SCREEN_SPOT = 0.84; // how far down the screen the bumped-back runner sits (0 top, 1 bottom)

const IDLE_SPEED = 4;
const LOCK_TIME = 0.16; // the lane choice is fixed this many seconds before the doors arrive
const DOOR_OPEN_TIME = 0.13;
const DOOR_HEIGHT = 2.8;
const SIGN_HEIGHT = 1.5;
const SIGN_TOP_Y = DOOR_HEIGHT + 0.3 + SIGN_HEIGHT + 0.05; // the very top of a door's sign
const MARK_SPACING = 4;
const SPARKS_PER_POP = 14;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Where the dots go on a door sign, like the faces of a dice up to 6,
// then rows of five. Returns [x, y, radius] for each dot.
// How many things a child may have to count to answer a question: the things shown in the
// banner, and the dots on the fullest door.
function thingsToCount(question) {
  const { kind, answer, choices, doors } = question;
  const shown = kind === 'same' || kind === 'count' ? answer : kind === 'add' && question.pictures ? question.a + question.b : 0;
  const numbers = ['same', 'count', 'find', 'more', 'fewer'].includes(kind);
  const dots = numbers && (doors === 'dots' || doors === 'both') ? Math.max(...choices) : 0;
  return shown + dots;
}

// Where the dots go on a door's sign: like the faces of a dice up to six, then two rows
// of five.
function dotLayout(count, w, h) {
  const n = clamp(Math.round(count), 1, 10);
  if (n <= 6) {
    const r = Math.min(w, h) * 0.13;
    const [left, mid, right] = [w * 0.24, w * 0.5, w * 0.76];
    const [top, centre, bottom] = [h * 0.24, h * 0.5, h * 0.76];
    const faces = {
      1: [[mid, centre]],
      2: [[left, top], [right, bottom]],
      3: [[left, top], [mid, centre], [right, bottom]],
      4: [[left, top], [right, top], [left, bottom], [right, bottom]],
      5: [[left, top], [right, top], [mid, centre], [left, bottom], [right, bottom]],
      6: [[left, top], [mid, top], [right, top], [left, bottom], [mid, bottom], [right, bottom]],
    };
    return faces[n].map(([x, y]) => [x, y, r]);
  }
  const r = w * 0.075;
  return Array.from({ length: n }, (_, i) => [w * (0.14 + (i % 5) * 0.18), h * (i < 5 ? 0.32 : 0.68), r]);
}
const lambert = (color) => new THREE.MeshLambertMaterial({ color });

export class Game {
  constructor(canvas, events = {}) {
    this.canvas = canvas;
    this.events = events;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(THEME.sky);
    this.scene.fog = new THREE.Fog(THEME.sky, 60, 116);

    this.camera = new THREE.PerspectiveCamera(46, 1, 1, 260);
    this.cameraHome = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();

    this.mode = 'idle'; // idle | running | finishing | over | paused
    this.speed = IDLE_SPEED;
    this.character = null;
    this.gameId = CONFIG.game;
    this.age = CONFIG.age;
    this.level = 0;
    this.reached = 0;
    this.shake = 0;
    this.topClear = 0.28;
    this.pace = CONFIG.paces[CONFIG.pace];

    this.buildWorld();
    this.buildRow();
    this.buildSparks();
    this.resetRun();
    this.resize();

    this.last = performance.now();
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }

  // --- Building the world ---------------------------------------------------

  buildWorld() {
    const scene = this.scene;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9bbf8a, 1.3));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 12, 8);
    scene.add(sun);

    const length = EDGE_Z - FAR_Z;
    const midZ = (EDGE_Z + FAR_Z) / 2;
    const fullWidth = BELT_HALF * 2 + 1.2;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), lambert(THEME.floor));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, FLOOR_Y, -120);
    scene.add(floor);

    const body = new THREE.Mesh(new THREE.BoxGeometry(fullWidth, 1, length), lambert(THEME.treadmillBody));
    body.position.set(0, -0.52, midZ);
    scene.add(body);

    const belt = new THREE.Mesh(new THREE.PlaneGeometry(BELT_HALF * 2, length), lambert(THEME.belt));
    belt.rotation.x = -Math.PI / 2;
    belt.position.set(0, 0, midZ);
    scene.add(belt);

    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, length), lambert(THEME.rail));
      rail.position.set(side * (BELT_HALF + 0.3), 0.1, midZ);
      scene.add(rail);
    }

    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, fullWidth, 20), lambert(THEME.treadmillBody));
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, -0.52, EDGE_Z);
    scene.add(roller);

    // Marks on the belt. They slide toward the camera to show the belt moving.
    const rows = Math.floor((EDGE_Z - 0.9 - FAR_Z) / MARK_SPACING);
    const slats = new THREE.InstancedMesh(
      new THREE.BoxGeometry(BELT_HALF * 2, 0.03, 0.2),
      lambert(THEME.beltSlat),
      rows,
    );
    const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.03, 1.5), lambert(THEME.laneLine), rows * 2);
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < rows; i++) {
      const z = EDGE_Z - 0.9 - MARK_SPACING * (i + 1);
      slats.setMatrixAt(i, matrix.makeTranslation(0, 0.03, z - MARK_SPACING / 2));
      dashes.setMatrixAt(i * 2, matrix.makeTranslation(-CONFIG.laneWidth / 2, 0.035, z));
      dashes.setMatrixAt(i * 2 + 1, matrix.makeTranslation(CONFIG.laneWidth / 2, 0.035, z));
    }
    slats.frustumCulled = false;
    dashes.frustumCulled = false;
    this.marks = new THREE.Group();
    this.marks.add(slats, dashes);
    this.markOffset = 0;
    scene.add(this.marks);

    // Toy blocks standing beside the treadmill. Same layout every time.
    let seed = 11;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 28; i++) {
      const side = i % 2 ? 1 : -1;
      const w = 1.2 + random() * 2.4;
      const h = 1 + random() * 4.5;
      const d = 1.2 + random() * 2.4;
      const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(THEME.blocks[i % THEME.blocks.length]));
      block.position.set(side * (BELT_HALF + 2 + random() * 5 + w / 2), FLOOR_Y + h / 2, 3 - i * 3.1 - random() * 2);
      scene.add(block);
    }

    // Soft round shadow under the runner.
    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.06;
    scene.add(this.shadow);
  }

  // One row of three doors, reused for every question.
  buildRow() {
    const group = new THREE.Group();
    group.visible = false;
    this.scene.add(group);

    const width = CONFIG.laneWidth - 0.1;
    const post = 0.16;
    const panelWidth = width - post * 2;
    const signWidth = CONFIG.laneWidth - 0.08;
    const signHeight = SIGN_HEIGHT;
    const signY = DOOR_HEIGHT + 0.3 + signHeight / 2;
    const anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    this.doors = LANE_X.map((x) => {
      const door = new THREE.Group();
      door.position.x = x;
      group.add(door);

      const frameMaterial = lambert('#ffffff');
      const panelMaterial = lambert('#ffffff');
      const knobMaterial = lambert('#ffffff');

      for (const side of [-1, 1]) {
        const upright = new THREE.Mesh(new THREE.BoxGeometry(post, DOOR_HEIGHT, 0.3), frameMaterial);
        upright.position.set(side * (width / 2 - post / 2), DOOR_HEIGHT / 2, 0);
        door.add(upright);
      }
      const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, 0.3), frameMaterial);
      top.position.set(0, DOOR_HEIGHT + 0.15, 0);
      door.add(top);

      // The panel hangs from a hinge on its left edge and swings away from the runner.
      const hinge = new THREE.Group();
      hinge.position.set(-panelWidth / 2, 0, 0);
      door.add(hinge);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, DOOR_HEIGHT, 0.1), panelMaterial);
      panel.position.set(panelWidth / 2, DOOR_HEIGHT / 2, 0);
      hinge.add(panel);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), knobMaterial);
      knob.position.set(panelWidth - 0.24, DOOR_HEIGHT * 0.45, 0.1);
      hinge.add(knob);

      // The sign on top, showing this door's answer. The game writes the number itself.
      // Games without written answers (colors) hide the sign.
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 400;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      const signMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const signGroup = new THREE.Group();
      signGroup.position.set(0, signY, 0);
      door.add(signGroup);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(signWidth, signHeight), signMaterial);
      sign.position.z = 0.16;
      signGroup.add(sign);
      const signBack = new THREE.Mesh(new THREE.BoxGeometry(signWidth + 0.06, signHeight + 0.06, 0.12), frameMaterial);
      signBack.position.z = 0.09;
      signGroup.add(signBack);

      return {
        group: door,
        hinge,
        signGroup,
        canvas,
        texture,
        frameMaterial,
        panelMaterial,
        materials: [frameMaterial, panelMaterial, knobMaterial, signMaterial],
        opening: false,
        open: 0,
        pulse: 0,
      };
    });

    this.row = { group, state: 'none', z: 0, age: 0, fade: 1, locked: false, correct: false, chosen: 1, question: null };
  }

  // Writes a door's answer on its sign: a number, or that many dots.
  drawSign(door, value, mood = 'signPlain') {
    if (!door.signGroup.visible) return;
    const { canvas } = door;
    const g = canvas.getContext('2d');
    const { back, text: ink } = THEME[mood];
    const w = canvas.width;
    const h = canvas.height;

    g.clearRect(0, 0, w, h);
    g.fillStyle = back;
    g.fillRect(0, 0, w, h);

    if (this.row.question?.doors === 'dots') {
      g.fillStyle = ink;
      g.fillStyle = ink;
      for (const [x, y, r] of dotLayout(value, w, h)) {
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
      door.texture.needsUpdate = true;
      return;
    }

    // A little picture of a thing (the princess game).
    if (this.row.question?.doors === 'things') {
      g.font = `${Math.round(h * 0.62)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      g.fillStyle = ink;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(THINGS[value] ?? '', w / 2, h * 0.54);
      door.texture.needsUpdate = true;
      return;
    }

    // A shape, drawn in one color so only the shape tells the doors apart.
    if (this.row.question?.doors === 'shapes') {
      // Some levels draw a shape smaller, tilted, or in other proportions (see questions.js).
      const form = this.row.question.forms?.[value];
      const scale = ((h * 0.82) / 100) * (form?.size ?? 1);
      g.save();
      g.translate(w / 2, h / 2);
      g.rotate(((form?.turn ?? 0) * Math.PI) / 180);
      g.scale(scale, scale);
      g.translate(-50, -50);
      g.fillStyle = ink;
      const outline = form?.path ?? SHAPES[value] ?? '';
      g.fill(new Path2D(outline));
      g.restore();
      // The shape's face stays the right way up however the shape is turned.
      const spot = faceSpot(outline);
      const turn = ((form?.turn ?? 0) * Math.PI) / 180;
      const [dx, dy] = [spot.x - 50, spot.y - 50];
      drawFace(
        g,
        w / 2 + scale * (dx * Math.cos(turn) - dy * Math.sin(turn)),
        h / 2 + scale * (dx * Math.sin(turn) + dy * Math.cos(turn)),
        spot.r * scale * 0.8,
        back,
        ink,
      );
      door.texture.needsUpdate = true;
      return;
    }

    const text = String(value);
    const paired = this.row.question?.doors === 'both'; // a number with its dots underneath
    let size = paired ? 230 : 300;
    const font = (px) => `700 ${px}px "Fredoka Variable", "Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif`;
    g.font = font(size);
    while (size > 80 && g.measureText(text).width > w - 56) {
      size -= 12;
      g.font = font(size);
    }
    g.fillStyle = ink;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, (paired ? h * 0.4 : h / 2) + size * 0.05);
    if (paired) {
      const count = clamp(Math.round(value), 1, 10);
      const radius = Math.min(28, (w * 0.8) / (count * 2.6));
      const step = radius * 2.6;
      for (let i = 0; i < count; i++) {
        g.beginPath();
        g.arc(w / 2 + (i - (count - 1) / 2) * step, h * 0.85, radius, 0, Math.PI * 2);
        g.fill();
      }
    }
    door.texture.needsUpdate = true;
  }

  setRowFade(amount) {
    this.row.fade = amount;
    for (const door of this.doors) {
      for (const material of door.materials) {
        material.transparent = amount < 1;
        material.opacity = amount;
      }
    }
  }

  // Confetti: little cubes that pop out on a right answer and at the end of a run.
  buildSparks() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    this.sparks = [];
    this.nextSpark = 0;
    for (let i = 0; i < SPARKS_PER_POP * 4; i++) {
      const color = THEME.confetti[i % THEME.confetti.length];
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color }));
      mesh.visible = false;
      this.scene.add(mesh);
      this.sparks.push({ mesh, velocity: new THREE.Vector3(), turn: new THREE.Vector3(), life: 0 });
    }
  }

  popSparks(x, y, z, power = 1) {
    for (let i = 0; i < SPARKS_PER_POP; i++) {
      const spark = this.sparks[this.nextSpark];
      this.nextSpark = (this.nextSpark + 1) % this.sparks.length;
      spark.mesh.position.set(x, y, z);
      spark.velocity.set((Math.random() - 0.5) * 7 * power, (3 + Math.random() * 5) * power, (Math.random() - 0.5) * 4);
      spark.turn.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
      spark.life = 0.9;
      spark.mesh.visible = true;
    }
  }

  // --- Characters -----------------------------------------------------------

  setCharacter(def) {
    if (this.character?.def === def) return;
    if (this.character) {
      this.scene.remove(this.character.root);
      disposeObject(this.character.root);
    }
    this.character = buildCharacter(def);
    this.scene.add(this.character.root);
  }

  // --- Starting, stopping, pausing --------------------------------------------

  resetRun() {
    this.score = 0;
    this.doorsDone = 0;
    this.results = [];
    this.speedSteps = 0;
    this.pushedBack = false;
    this.endless = false;
    this.lane = 1;
    this.runnerX = 0;
    this.runnerZ = FRONT_Z;
    this.lastText = '';
    this.gapTimer = 0;
    this.finishTimer = 0;
    this.confettiTimer = 0;
    this.inputLocked = false;
    this.shake = 0;
    this.row.state = 'none';
    this.row.group.visible = false;
    this.character?.calm();
  }

  // game: which game to play (see src/questions.js). age: the age picked on the start screen.
  // level: which of that age's levels to play (0 is the first).
  // reached: the highest level open to the child, which an endless run draws from.
  // pace: 'slow', 'normal' or 'fast' (see config.js).
  // endless: true for the mode that gets faster and faster until the first miss ends it.
  startRun({ game = CONFIG.game, age = CONFIG.age, level = 0, reached = level, pace = CONFIG.pace, endless = false } = {}) {
    this.resetRun();
    this.pace = CONFIG.paces[pace] ?? CONFIG.paces[CONFIG.pace];
    this.endless = endless;
    this.endlessTravel = this.pace.travel;
    this.gameId = game;
    this.age = age;
    this.level = Math.min(LEVELS - 1, Math.max(0, level));
    this.reached = Math.min(LEVELS - 1, Math.max(0, reached));
    this.gapTimer = 0.6;
    this.mode = 'running';
  }

  toIdle() {
    this.resetRun();
    this.mode = 'idle';
  }

  pause() {
    if (this.mode !== 'running' && this.mode !== 'finishing') return false;
    this.modeBeforePause = this.mode;
    this.mode = 'paused';
    return true;
  }

  resume() {
    if (this.mode !== 'paused') return;
    this.mode = this.modeBeforePause;
    this.last = performance.now();
  }

  // --- Player input ---------------------------------------------------------

  setLane(index) {
    if (this.mode !== 'running' || this.inputLocked) return false;
    const lane = clamp(Math.round(index), 0, LANE_X.length - 1);
    if (lane === this.lane) return false;
    this.lane = lane;
    this.events.onMove?.(lane);
    return true;
  }

  moveLane(direction) {
    return this.setLane(this.lane + direction);
  }

  // A tap picks the lane under the finger: a door if the finger is on one,
  // otherwise the spot on the belt, otherwise the left/middle/right third of the screen.
  tapAt(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const across = (clientX - rect.left) / rect.width;
    const down = (clientY - rect.top) / rect.height;
    this.raycaster.setFromCamera(new THREE.Vector2(across * 2 - 1, -(down * 2 - 1)), this.camera);
    const { origin, direction } = this.raycaster.ray;

    const laneAt = (x) => clamp(Math.round(x / CONFIG.laneWidth) + 1, 0, LANE_X.length - 1);
    const reach = BELT_HALF + 0.8;

    if (this.row.state === 'approach' && direction.z < 0) {
      const t = (this.row.z - origin.z) / direction.z;
      const y = origin.y + direction.y * t;
      const x = origin.x + direction.x * t;
      if (t > 0 && y >= 0 && y <= DOOR_HEIGHT + 2.2 && Math.abs(x) <= reach) return this.setLane(laneAt(x));
    }
    if (direction.y < 0) {
      const t = -origin.y / direction.y;
      const x = origin.x + direction.x * t;
      const z = origin.z + direction.z * t;
      if (z > FAR_Z && Math.abs(x) <= reach) return this.setLane(laneAt(x));
    }
    return this.setLane(Math.floor(clamp(across, 0, 0.999) * LANE_X.length));
  }

  // --- Questions ------------------------------------------------------------

  travelTime() {
    if (this.endless) return this.endlessTravel;
    return Math.max(CONFIG.minTravelTime, this.pace.travel - CONFIG.travelTimeStep * this.speedSteps);
  }

  nextQuestion() {
    // Endless runs pull questions at random from every level open to the child.
    const widest = Math.min(LEVELS - 1, Math.max(this.reached, CONFIG.endless.minSteps - 1));
    const level = this.endless ? Math.floor(Math.random() * (widest + 1)) : this.level;
    const question = makeQuestion(this.gameId, this.age, level, this.lastText);
    this.lastText = question.text;

    const row = this.row;
    row.question = question;
    row.z = FRONT_Z - CONFIG.spawnDistance;
    // A question that takes a while to say gets a slower belt, so there is still time to think.
    const spoken = this.events.questionSeconds?.(question) ?? 0;
    // (The extra half second covers the belt getting up to speed and the choice being
    // fixed a moment before the doors arrive.)
    // Endless runs do not wait for anybody.
    // Younger children get a slower belt, and extra time for every thing there is to count.
    const ease = CONFIG.ageEase[this.age] ?? { slower: 1, perItem: 0 };
    const toCount = Math.min(14, thingsToCount(question));
    row.travelTime = this.endless
      ? this.travelTime()
      : Math.max(this.travelTime() * ease.slower, spoken + this.pace.think * ease.slower + toCount * ease.perItem + 0.5);
    row.age = 0;
    row.state = 'approach';
    row.locked = false;
    row.correct = false;
    row.group.visible = true;
    this.setRowFade(1);

    // When the answers are colors, the doors themselves are the answers, with plain frames
    // and no signs. Otherwise the doors get three bright colors and a sign with the answer on top.
    const isColor = question.paint === true;
    const hexes = isColor ? question.choices.map((id) => COLORS[id]) : shuffle(DOOR_COLORS).slice(0, 3);
    this.doors.forEach((door, i) => {
      door.panelMaterial.color.set(hexes[i]);
      if (isColor) door.frameMaterial.color.set('#eceff1');
      else door.frameMaterial.color.set(hexes[i]).multiplyScalar(0.7);
      door.hinge.rotation.y = 0;
      door.opening = false;
      door.open = 0;
      door.pulse = 0;
      door.group.scale.set(1, 1, 1);
      door.signGroup.visible = !isColor;
      this.drawSign(door, question.choices[i]);
    });

    this.events.onQuestion?.(question, { level, index: this.doorsDone, total: CONFIG.doorsPerRun });
  }

  // The lane choice is fixed just before the doors arrive.
  lockIn() {
    const row = this.row;
    row.locked = true;
    row.chosen = this.lane;
    row.correct = row.chosen === row.question.correctIndex;
    this.inputLocked = true;
    if (row.correct) this.answeredRight();
  }

  report(correct, trick = false) {
    this.events.onAnswer?.({
      correct,
      trick, // true when the runner did one of its special tricks
      question: this.row.question,
      score: this.score,
      results: [...this.results],
      total: CONFIG.doorsPerRun,
      endless: this.endless,
      travel: this.row.travelTime, // seconds this row of doors took to arrive
    });
  }

  answeredRight() {
    const row = this.row;
    const door = this.doors[row.chosen];
    this.score += 1;
    this.doorsDone += 1;
    this.results.push(true);
    if (this.score % CONFIG.correctPerSpeedStep === 0) this.speedSteps += 1;

    door.opening = true;
    this.drawSign(door, row.question.answer, 'signRight');
    this.popSparks(LANE_X[row.chosen], 1.6, this.runnerZ - 0.6);
    // Mostly a jump and a spin; every so often a special trick (a backflip, a dance...).
    const trick = this.score % CONFIG.trickEvery === 0;
    this.character.react(trick ? 'trick' : 'cheer');
    if (this.endless) {
      // Every right answer makes the belt faster.
      this.endlessTravel = Math.max(CONFIG.endless.minTravel, this.endlessTravel * CONFIG.endless.faster);
      this.gapTimer = Math.min(CONFIG.gapAfterCorrect, this.endlessTravel * 0.12);
    } else {
      this.pushedBack = false; // a right answer brings the runner back to the front
      this.gapTimer = CONFIG.gapAfterCorrect;
    }
    this.report(true, trick);
  }

  // A wrong door bumps the runner back and shows the right door. In an ordinary run that is
  // all. An endless run ends right there, at the first miss.
  answeredWrong() {
    const row = this.row;
    const q = row.question;
    this.doorsDone += 1;
    this.results.push(false);
    this.speedSteps = Math.max(0, this.speedSteps - CONFIG.speedStepsLostOnMiss);

    this.drawSign(this.doors[row.chosen], q.choices[row.chosen], 'signWrong');
    this.drawSign(this.doors[q.correctIndex], q.answer, 'signRight');
    this.doors[q.correctIndex].pulse = 1.2;
    this.shake = 0.3;
    this.character.react('oops');
    if (this.endless) {
      // The doors stay where they are, with the right one marked, while the run winds up.
      this.report(false);
      this.startFinish();
      return;
    }
    this.pushedBack = true;
    row.state = 'pushing';
    this.gapTimer = CONFIG.gapAfterWrong;
    this.report(false);
  }

  // The run is over. After the last door of an ordinary run: confetti and a happy dance.
  // After the miss that ends an endless run: confetti for the score, but no dance.
  startFinish() {
    this.mode = 'finishing';
    this.finishTimer = 0;
    this.confettiTimer = 0;
    this.inputLocked = false;
    if (!this.endless) {
      this.pushedBack = false;
      this.character.react('party');
    }
    this.events.onFinishing?.({ score: this.score, total: CONFIG.doorsPerRun, endless: this.endless });
  }

  // --- Every frame ----------------------------------------------------------

  frame(now) {
    requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (this.mode !== 'paused') this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    const playing = this.mode === 'running' || this.mode === 'finishing';
    const travel = this.row.state === 'none' ? this.travelTime() : (this.row.travelTime ?? this.travelTime());
    const targetSpeed = playing ? CONFIG.spawnDistance / travel : IDLE_SPEED;
    this.speed += (targetSpeed - this.speed) * Math.min(1, dt * 2.5);

    this.markOffset = (this.markOffset + this.speed * dt) % MARK_SPACING;
    this.marks.position.z = this.markOffset;

    const targetX = LANE_X[this.lane];
    const before = this.runnerX;
    this.runnerX += (targetX - this.runnerX) * Math.min(1, dt * 16);
    const dx = this.runnerX - before;

    if (this.mode === 'running') this.updateRow(dt);
    if (this.mode === 'finishing') this.updateFinish(dt);

    if (this.row.state !== 'pushing') {
      const targetZ = this.pushedBack ? BACK_Z : FRONT_Z;
      this.runnerZ += (targetZ - this.runnerZ) * Math.min(1, dt * 4);
    }

    if (this.character) {
      this.character.root.position.set(this.runnerX, 0, this.runnerZ);
      this.character.update(dt, this.speed, clamp(targetX - this.runnerX, -1, 1), dx);
    }
    this.shadow.position.x = this.runnerX;
    this.shadow.position.z = this.runnerZ;

    for (const spark of this.sparks) {
      if (spark.life <= 0) continue;
      spark.life -= dt;
      spark.velocity.y -= 14 * dt;
      spark.mesh.position.addScaledVector(spark.velocity, dt);
      spark.mesh.rotation.x += spark.turn.x * dt;
      spark.mesh.rotation.y += spark.turn.y * dt;
      spark.mesh.scale.setScalar(Math.max(0.01, Math.min(1, spark.life / 0.5)));
      if (spark.life <= 0) spark.mesh.visible = false;
    }

    // A small wobble of the camera after a bump.
    this.camera.position.copy(this.cameraHome);
    if (this.shake > 0) {
      this.shake -= dt;
      const strength = Math.max(0, this.shake) * 0.5;
      this.camera.position.x += Math.sin(this.shake * 70) * strength;
      this.camera.position.y += Math.cos(this.shake * 55) * strength * 0.6;
    }
  }

  updateRow(dt) {
    const row = this.row;
    this.gapTimer -= dt;

    if (row.state === 'none') {
      if (this.gapTimer > 0) return;
      // Let the voice finish what it is saying before the next doors come, within reason.
      if (!this.endless && this.gapTimer > -CONFIG.maxWaitForVoice && this.events.isSpeaking?.()) return;
      if (!this.endless && this.doorsDone >= CONFIG.doorsPerRun) this.startFinish();
      else this.nextQuestion();
      return;
    }

    row.z += this.speed * dt;
    row.age += dt;
    const front = this.character.front;
    const contactZ = this.runnerZ - front; // where the doors touch the runner

    if (row.state === 'approach') {
      if (!row.locked && row.z >= contactZ - this.speed * LOCK_TIME) this.lockIn();
      if (row.locked && row.z >= contactZ) {
        if (row.correct) row.state = 'passing';
        else this.answeredWrong();
      }
    }

    if (row.state === 'pushing') {
      // The closed door shoves the runner back, then fades away.
      this.runnerZ = Math.min(BACK_Z, Math.max(this.runnerZ, row.z + front));
      if (this.runnerZ >= BACK_Z) row.state = 'passing';
    }

    if (row.state === 'passing') {
      if (row.z > this.runnerZ + 0.4) this.inputLocked = false;
      // After a wrong answer the doors fade slowly, so the right one can be seen.
      const fadeFrom = row.correct ? this.runnerZ + 0.9 : this.runnerZ - front;
      const fadeTime = row.correct ? 0.25 : 0.55;
      if (row.z > fadeFrom) {
        this.setRowFade(Math.max(0, row.fade - dt / fadeTime));
        if (row.fade <= 0) {
          row.state = 'none';
          row.group.visible = false;
          this.inputLocked = false;
        }
      }
    }

    this.placeRow(dt);
  }

  updateFinish(dt) {
    this.finishTimer += dt;
    this.confettiTimer -= dt;
    if (this.confettiTimer <= 0) {
      this.confettiTimer = 0.26;
      this.popSparks(
        this.runnerX + (Math.random() - 0.5) * 5,
        1.5 + Math.random() * 2.5,
        this.runnerZ - 0.5 - Math.random() * 3,
        1.25,
      );
    }
    if (this.finishTimer >= CONFIG.celebrateTime) {
      this.mode = 'over';
      this.events.onRunEnd?.({
        endless: this.endless,
        score: this.score,
        total: CONFIG.doorsPerRun,
        level: this.level,
        results: [...this.results],
      });
    }
  }

  placeRow(dt) {
    const row = this.row;
    // New doors drop in from above.
    const drop = 1 - Math.min(1, row.age / 0.35);
    row.group.position.set(0, 7 * drop * drop * drop, row.z);
    for (const door of this.doors) {
      if (door.opening) {
        door.open = Math.min(1, door.open + dt / DOOR_OPEN_TIME);
        door.hinge.rotation.y = door.open * 1.7;
      }
      // The right door grows and shrinks to say "it was this one".
      if (door.pulse > 0) {
        door.pulse -= dt;
        const grow = 1 + 0.14 * Math.abs(Math.sin(door.pulse * Math.PI * 2.5));
        door.group.scale.set(grow, grow, 1);
      }
    }
  }

  // --- Fitting the view to the screen ---------------------------------------

  // How much of the top of the screen the question area covers (0 to 1).
  // The view is framed so that the door signs never go under it.
  setTopClear(fraction) {
    const value = clamp(fraction || 0, 0, 0.46);
    if (Math.abs(value - this.topClear) < 0.005) return;
    this.topClear = value;
    this.resize();
  }

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);

    const aspect = width / height;
    const camera = this.camera;
    const rad = Math.PI / 180;
    const sin = Math.sin(CAMERA_HEIGHT_ANGLE);
    const cos = Math.cos(CAMERA_HEIGHT_ANGLE);

    // Where things should sit on the screen, as a fraction of its height from the top:
    const top = this.topClear + 0.02; // the tops of the far-away door signs, just under the question
    const spot = aspect > 1 ? 0.9 : RUNNER_SCREEN_SPOT; // the bumped-back runner, when there is room
    const lowest = 0.91; // the bumped-back runner, at the very lowest

    // A fairly narrow view from further back keeps far-away door signs big enough to read.
    let fov = aspect < 0.62 ? 46 : aspect < 1.1 ? 44 : 40;
    let pitch = 0;
    let distance = 10;

    for (let pass = 0; pass < 6; pass++) {
      const tanUp = Math.tan((fov / 2) * rad);
      // Pull the camera back until all three lanes fit where the runner stands when bumped back.
      distance = clamp((CONFIG.laneWidth + 0.8) / (tanUp * aspect), 10, 26);
      const camY = 0.6 + distance * sin;
      const camZ = BACK_Z + distance * cos;

      // How far below level the camera has to look to see each of the two things.
      const toRunner = CAMERA_HEIGHT_ANGLE;
      const toSigns = Math.atan2(camY - SIGN_TOP_Y, camZ - (FRONT_Z - CONFIG.spawnDistance));
      const screenY = (angle, tilt) => 0.5 + Math.tan(angle - tilt) / (2 * tanUp);

      // First choice: the runner at its usual spot.
      pitch = toRunner - Math.atan((spot - 0.5) * 2 * tanUp);
      if (screenY(toSigns, pitch) >= top) break;

      // Otherwise tilt down so the signs clear the question.
      pitch = toSigns - Math.atan((top - 0.5) * 2 * tanUp);
      if (screenY(toRunner, pitch) <= lowest) break;

      // If the runner would then drop off the bottom, widen the view until both fit.
      let low = toSigns;
      let high = toRunner;
      for (let i = 0; i < 40; i++) {
        const mid = (low + high) / 2;
        const balance = Math.tan(toSigns - mid) * (lowest - 0.5) - Math.tan(toRunner - mid) * (top - 0.5);
        if (balance > 0) low = mid;
        else high = mid;
      }
      pitch = (low + high) / 2;
      const wider = clamp((2 * Math.atan(Math.tan(toRunner - pitch) / (2 * (lowest - 0.5)))) / rad, fov, 82);
      if (wider - fov < 0.05) break;
      fov = wider;
    }

    camera.aspect = aspect;
    camera.fov = fov;
    this.cameraHome.set(0, 0.6 + distance * sin, BACK_Z + distance * cos);
    camera.position.copy(this.cameraHome);
    camera.rotation.set(-pitch, 0, 0);
    camera.updateProjectionMatrix();
  }

  // Used by the automatic test player during development.
  debugState() {
    return {
      mode: this.mode,
      game: this.gameId,
      endless: this.endless,
      travel: this.travelTime(),
      lane: this.lane,
      score: this.score,
      level: this.level,
      doorsDone: this.doorsDone,
      pushedBack: this.pushedBack,
      speed: this.speed,
      rowState: this.row.state,
      rowZ: this.row.z,
      question: this.row.question,
    };
  }
}
