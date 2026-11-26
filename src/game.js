// The 3D world and the rules of a run: treadmill, runner, doors, right and wrong.
// It knows nothing about menus or saving. It reports what happens through "events".

import * as THREE from 'three';
import { CONFIG, THEME } from './config.js';
import { buildCharacter, disposeObject } from './looks.js';
import { levelForCorrect, makeQuestion, shuffle } from './questions.js';

const LANE_X = [-CONFIG.laneWidth, 0, CONFIG.laneWidth];
const BELT_HALF = CONFIG.laneWidth * 1.5;

const FRONT_Z = 0; // where the runner normally is
const BACK_Z = 2.9; // where a miss pushes it
const EDGE_Z = 5.4; // back end of the treadmill (nearest the camera)
const FAR_Z = -100; // far end, hidden in the haze
const FLOOR_Y = -1;

const CAMERA_HEIGHT_ANGLE = (24 * Math.PI) / 180; // how steeply the camera looks down on the runner
const RUNNER_SCREEN_SPOT = 0.84; // how far down the screen the pushed-back runner sits (0 top, 1 bottom)

const IDLE_SPEED = 4;
const LOCK_TIME = 0.16; // the lane choice is fixed this many seconds before the doors arrive
const DOOR_OPEN_TIME = 0.13;
const DOOR_HEIGHT = 2.8;
const MARK_SPACING = 4;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
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

    this.mode = 'idle'; // idle | running | falling | over | paused
    this.speed = IDLE_SPEED;
    this.character = null;
    this.shake = 0;
    this.fallView = 0;
    this.cameraPitch = 0;

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
    const signHeight = 1.5;
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
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 400;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      const signMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(signWidth, signHeight), signMaterial);
      sign.position.set(0, signY, 0.16);
      door.add(sign);
      const signBack = new THREE.Mesh(new THREE.BoxGeometry(signWidth + 0.06, signHeight + 0.06, 0.12), frameMaterial);
      signBack.position.set(0, signY, 0.09);
      door.add(signBack);

      return {
        hinge,
        canvas,
        texture,
        frameMaterial,
        panelMaterial,
        materials: [frameMaterial, panelMaterial, knobMaterial, signMaterial],
        opening: false,
        open: 0,
      };
    });

    this.row = { group, state: 'none', z: 0, age: 0, fade: 1, locked: false, correct: false, chosen: 1, question: null };
  }

  drawSign(door, text, mood = 'signPlain') {
    const { canvas } = door;
    const g = canvas.getContext('2d');
    const { back, text: ink } = THEME[mood];
    const w = canvas.width;
    const h = canvas.height;

    g.clearRect(0, 0, w, h);
    g.fillStyle = back;
    g.fillRect(0, 0, w, h);

    let size = 300;
    const font = (px) => `900 ${px}px "Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif`;
    g.font = font(size);
    while (size > 80 && g.measureText(text).width > w - 56) {
      size -= 12;
      g.font = font(size);
    }
    g.fillStyle = ink;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + size * 0.05);
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

  // Little cubes that pop out on a right answer.
  buildSparks() {
    const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const colors = ['#fff176', '#ffffff', '#ffd54f', '#aed581'];
    this.sparks = [];
    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: colors[i % colors.length] }));
      mesh.visible = false;
      this.scene.add(mesh);
      this.sparks.push({ mesh, velocity: new THREE.Vector3(), life: 0 });
    }
  }

  popSparks(x, y, z) {
    for (const spark of this.sparks) {
      spark.mesh.position.set(x, y, z);
      spark.velocity.set((Math.random() - 0.5) * 6, 3 + Math.random() * 5, (Math.random() - 0.5) * 3);
      spark.life = 0.7;
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
    this.correctCount = 0;
    this.speedSteps = 0;
    this.pushedBack = false;
    this.streak = 0;
    this.lane = 1;
    this.runnerX = 0;
    this.runnerY = 0;
    this.runnerZ = FRONT_Z;
    this.fallSpeed = 0;
    this.fallView = 0;
    this.overTimer = 0;
    this.lastText = '';
    this.gapTimer = 0;
    this.inputLocked = false;
    this.shake = 0;
    this.row.state = 'none';
    this.row.group.visible = false;
    if (this.character) this.character.root.rotation.set(0, 0, 0);
  }

  startRun() {
    this.resetRun();
    this.gapTimer = 0.5;
    this.mode = 'running';
  }

  toIdle() {
    this.resetRun();
    this.mode = 'idle';
  }

  pause() {
    if (this.mode !== 'running' && this.mode !== 'falling') return false;
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
    return Math.max(CONFIG.minTravelTime, CONFIG.startTravelTime - CONFIG.travelTimeStep * this.speedSteps);
  }

  nextQuestion() {
    const level = levelForCorrect(this.correctCount);
    const question = makeQuestion(level, this.lastText);
    this.lastText = question.text;

    const row = this.row;
    row.question = question;
    row.z = FRONT_Z - CONFIG.spawnDistance;
    row.age = 0;
    row.state = 'approach';
    row.locked = false;
    row.correct = false;
    row.group.visible = true;
    this.setRowFade(1);

    const colors = shuffle(THEME.doors);
    this.doors.forEach((door, i) => {
      door.panelMaterial.color.set(colors[i]);
      door.frameMaterial.color.set(colors[i]).multiplyScalar(0.7);
      door.hinge.rotation.y = 0;
      door.opening = false;
      door.open = 0;
      this.drawSign(door, String(question.choices[i]));
    });

    this.events.onQuestion?.(question, level);
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

  answeredRight() {
    const row = this.row;
    const door = this.doors[row.chosen];
    this.score += 1;
    this.correctCount += 1;
    if (this.correctCount % CONFIG.correctPerSpeedStep === 0) this.speedSteps += 1;

    door.opening = true;
    this.drawSign(door, String(row.question.answer), 'signRight');
    this.popSparks(LANE_X[row.chosen], 1.6, this.runnerZ - 0.6);

    let caughtUp = false;
    if (this.pushedBack) {
      this.streak += 1;
      if (this.streak >= CONFIG.recoverStreak) {
        this.pushedBack = false;
        this.streak = 0;
        caughtUp = true;
      }
    }
    this.gapTimer = CONFIG.gapAfterCorrect;
    this.events.onAnswer?.({
      correct: true,
      fatal: false,
      caughtUp,
      question: row.question,
      score: this.score,
      pushedBack: this.pushedBack,
      streak: this.streak,
    });
  }

  answeredWrong() {
    const row = this.row;
    const q = row.question;
    this.drawSign(this.doors[row.chosen], String(q.choices[row.chosen]), 'signWrong');
    this.drawSign(this.doors[q.correctIndex], String(q.answer), 'signRight');
    this.speedSteps = Math.max(0, this.speedSteps - CONFIG.speedStepsLostOnMiss);
    this.shake = 0.3;

    const fatal = this.pushedBack;
    if (fatal) {
      this.mode = 'falling';
      row.state = 'shoving';
      this.fallSpeed = 0;
      this.overTimer = 0;
    } else {
      this.pushedBack = true;
      this.streak = 0;
      row.state = 'pushing';
      this.gapTimer = CONFIG.gapAfterWrong;
    }
    this.events.onAnswer?.({
      correct: false,
      fatal,
      caughtUp: false,
      question: q,
      score: this.score,
      pushedBack: true,
      streak: 0,
    });
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
    const playing = this.mode === 'running' || this.mode === 'falling';
    const targetSpeed = playing ? CONFIG.spawnDistance / this.travelTime() : IDLE_SPEED;
    this.speed += (targetSpeed - this.speed) * Math.min(1, dt * 2.5);

    this.markOffset = (this.markOffset + this.speed * dt) % MARK_SPACING;
    this.marks.position.z = this.markOffset;

    const targetX = LANE_X[this.lane];
    const before = this.runnerX;
    this.runnerX += (targetX - this.runnerX) * Math.min(1, dt * 16);
    const dx = this.runnerX - before;

    if (this.mode === 'running') this.updateRow(dt);
    if (this.mode === 'falling') this.updateFall(dt);

    if (this.mode !== 'falling' && this.mode !== 'over' && this.row.state !== 'pushing') {
      const targetZ = this.pushedBack ? BACK_Z : FRONT_Z;
      this.runnerZ += (targetZ - this.runnerZ) * Math.min(1, dt * 4);
    }

    if (this.character) {
      this.character.root.position.set(this.runnerX, this.runnerY, this.runnerZ);
      const landed = this.runnerY <= FLOOR_Y;
      if (!landed) this.character.update(dt, this.speed, clamp(targetX - this.runnerX, -1, 1), dx);
    }
    this.shadow.position.x = this.runnerX;
    this.shadow.position.z = this.runnerZ;
    this.shadow.visible = this.runnerZ < EDGE_Z;

    for (const spark of this.sparks) {
      if (spark.life <= 0) continue;
      spark.life -= dt;
      spark.velocity.y -= 16 * dt;
      spark.mesh.position.addScaledVector(spark.velocity, dt);
      spark.mesh.scale.setScalar(Math.max(0.01, spark.life / 0.7));
      if (spark.life <= 0) spark.mesh.visible = false;
    }

    // The camera sits at its home spot, pulled back and tipped down during a fall.
    const view = this.fallView * this.fallView * (3 - 2 * this.fallView);
    this.camera.position.copy(this.cameraHome);
    this.camera.position.y += 2.5 * view;
    this.camera.position.z += 7 * view;
    this.camera.rotation.x = -(this.cameraPitch + 0.13 * view);

    // A small wobble after a bump.
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
      if (this.gapTimer <= 0) this.nextQuestion();
      return;
    }

    row.z += this.speed * dt;
    row.age += dt;
    const contactZ = this.runnerZ - this.character.front; // where the doors touch the runner

    if (row.state === 'approach') {
      if (!row.locked && row.z >= contactZ - this.speed * LOCK_TIME) this.lockIn();
      if (row.locked && row.z >= contactZ) {
        if (row.correct) row.state = 'passing';
        else this.answeredWrong();
      }
    }

    if (row.state === 'pushing') {
      // The closed door shoves the runner back, then fades away.
      this.runnerZ = Math.min(BACK_Z, row.z + this.character.front);
      if (this.runnerZ >= BACK_Z) row.state = 'passing';
    }

    if (row.state === 'passing') {
      if (row.z > this.runnerZ + 0.4) this.inputLocked = false;
      const fadeFrom = row.correct ? this.runnerZ + 0.9 : this.runnerZ - this.character.front;
      if (row.z > fadeFrom) {
        this.setRowFade(Math.max(0, row.fade - dt / 0.25));
        if (row.fade <= 0) {
          row.state = 'none';
          row.group.visible = false;
          this.inputLocked = false;
        }
      }
    }

    this.placeRow(dt);
  }

  // Second miss: the closed door carries the runner off the back of the treadmill,
  // while the camera pulls back so the tumble can be seen.
  updateFall(dt) {
    const row = this.row;
    const front = this.character.front;
    row.z += this.speed * dt;
    this.fallView = Math.min(1, this.fallView + dt / 0.5);

    if (this.runnerZ <= EDGE_Z + 0.1) {
      this.runnerZ = Math.max(this.runnerZ, row.z + front);
    } else {
      if (this.runnerY > FLOOR_Y) {
        this.runnerZ += this.speed * 0.5 * dt;
        this.fallSpeed += 30 * dt;
        this.runnerY = Math.max(FLOOR_Y, this.runnerY - this.fallSpeed * dt);
        this.character.root.rotation.x += dt * 6;
      }
      this.overTimer += dt;
      if (this.overTimer > 1.15) {
        this.mode = 'over';
        row.state = 'none';
        row.group.visible = false;
        this.events.onGameOver?.(this.score);
      }
    }

    // The doors fade out as they reach the end of the belt.
    if (row.z + front > EDGE_Z - 0.3) this.setRowFade(Math.max(0, row.fade - dt / 0.25));
    this.placeRow(dt);
  }

  placeRow(dt) {
    const row = this.row;
    // New doors drop in from above.
    const drop = 1 - Math.min(1, row.age / 0.35);
    row.group.position.set(0, 7 * drop * drop * drop, row.z);
    for (const door of this.doors) {
      if (!door.opening) continue;
      door.open = Math.min(1, door.open + dt / DOOR_OPEN_TIME);
      door.hinge.rotation.y = door.open * 1.7;
    }
  }

  // --- Fitting the view to the screen ---------------------------------------

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);

    const aspect = width / height;
    const camera = this.camera;
    camera.aspect = aspect;
    // A fairly narrow view from further back keeps far-away door signs big enough to read.
    camera.fov = aspect < 0.62 ? 46 : aspect < 1.1 ? 44 : 40;
    const tanUp = Math.tan((camera.fov / 2) * (Math.PI / 180));

    // Pull the camera back until all three lanes fit where the runner stands when pushed back.
    const needHalfWidth = CONFIG.laneWidth + 0.8;
    const distance = clamp(needHalfWidth / (tanUp * aspect), 10, 26);
    this.cameraHome.set(
      0,
      0.6 + distance * Math.sin(CAMERA_HEIGHT_ANGLE),
      BACK_Z + distance * Math.cos(CAMERA_HEIGHT_ANGLE),
    );

    // Tilt so that pushed-back spot sits low on the screen, leaving the top for the question.
    // On a wide screen the scene sits a little lower, so the doors stay clear of the question.
    const spot = aspect > 1 ? Math.max(RUNNER_SCREEN_SPOT, 0.9) : RUNNER_SCREEN_SPOT;
    const spotBelowCentre = Math.atan(tanUp * (spot * 2 - 1));
    this.cameraPitch = CAMERA_HEIGHT_ANGLE - spotBelowCentre; // how far the camera looks down
    camera.position.copy(this.cameraHome);
    camera.rotation.set(-this.cameraPitch, 0, 0);
    camera.updateProjectionMatrix();
  }

  // Used by the automatic test player during development.
  debugState() {
    return {
      mode: this.mode,
      lane: this.lane,
      score: this.score,
      pushedBack: this.pushedBack,
      streak: this.streak,
      speed: this.speed,
      rowState: this.row.state,
      rowZ: this.row.z,
      question: this.row.question,
    };
  }
}
