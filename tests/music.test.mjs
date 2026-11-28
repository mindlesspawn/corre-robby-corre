import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { AUDIO_DEFAULTS } from '../src/audio-settings.js';

const source = await readFile(new URL('../src/music.js', import.meta.url), 'utf8');
const flush = () => new Promise((resolve) => setImmediate(resolve));

async function harness() {
  const h = { unlocked: false, speaking: false, players: [], intervals: new Map(), fallbackOn: false };
  const listeners = new Map();
  const document = { hidden: false, addEventListener: (name, callback) => listeners.set(name, callback) };
  h.visibility = (hidden) => { document.hidden = hidden; listeners.get('visibilitychange')(); };
  let id = 0;
  h.tick = () => { for (const callback of h.intervals.values()) callback(); };
  h.gain = {
    value: 0,
    setTargetAtTime(value, _time, constant) { this.value = value; this.constant = constant; },
    setValueAtTime(value) { this.value = value; },
    cancelScheduledValues() {},
  };
  h.ctx = {
    currentTime: 1, state: 'running', destination: {},
    createGain: () => ({ gain: h.gain, connect() {} }),
    createMediaElementSource: () => ({ connect: (node) => node }),
  };
  class Audio {
    paused = true;
    currentTime = 0;
    playbackRate = 1;
    events = new Map();
    constructor() { h.players.push(this); }
    setAttribute() {}
    addEventListener(name, callback) { this.events.set(name, callback); }
    pause() { this.paused = true; }
    play() {
      h.playCalls = (h.playCalls || 0) + 1;
      if (h.playError) return Promise.reject({ name: h.playError });
      this.paused = false;
      return h.pendingPlay || Promise.resolve();
    }
  }
  const context = vm.createContext({
    Audio, document,
    setInterval: (callback) => { h.intervals.set(++id, callback); return id; },
    clearInterval: (key) => h.intervals.delete(key),
  });
  const dependencies = {
    './audio.js': { audioContext: () => h.unlocked ? h.ctx : null, audioOutput: () => h.ctx.destination },
    './audio-settings.js': { AUDIO_DEFAULTS },
    './speech.js': { isSpeaking: () => h.speaking },
    './music-fallback.js': {
      setMusic: (on) => { h.fallbackOn = on; },
      setMusicVolume: (volume) => { h.fallbackVolume = volume; },
      setMusicSpeed: (speed) => { h.fallbackSpeed = speed; },
    },
  };
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    const values = dependencies[specifier];
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  h.music = module.namespace;
  h.start = async () => { h.unlocked = true; h.music.setMusic(true); await flush(); };
  return h;
}

test('waits for a touch, reuses one player, and resumes its position', async () => {
  const h = await harness();
  h.music.setMusic(true);
  assert.equal(h.players.length, 0);
  await h.start();
  const player = h.players[0];
  assert.equal(player.loop, true);
  assert.equal(player.preservesPitch, true);
  assert.equal(player.src, './music/sunny-steps.mp3');
  player.currentTime = 42;
  h.music.setMusic(false);
  assert.equal(player.paused, true);
  assert.equal(h.gain.value, 0);
  assert.equal(h.intervals.size, 0);
  h.music.setMusic(true);
  await flush();
  assert.equal(player.currentTime, 42);
  assert.equal(h.players.length, 1);
  assert.equal(h.intervals.size, 1);
});

test('ducks for speech and makes slider zero silent', async () => {
  const h = await harness();
  await h.start();
  const normal = h.gain.value;
  h.speaking = true;
  h.tick();
  assert.ok(Math.abs(h.gain.value / normal - 0.2) < 1e-10);
  assert.equal(h.gain.constant, 0.06);
  h.speaking = false;
  h.tick();
  assert.equal(h.gain.value, normal);
  h.music.setMusicVolume(0);
  assert.equal(h.players[0].paused, true);
  assert.equal(h.gain.value, 0);
  h.music.setMusicVolume(0.5);
  await flush();
  assert.equal(h.players[0].paused, false);
  assert.equal(h.gain.value, 0.125);
});

test('backgrounding stops playback and returning respects mute', async () => {
  const h = await harness();
  await h.start();
  h.visibility(true);
  assert.equal(h.players[0].paused, true);
  h.visibility(false);
  await flush();
  assert.equal(h.players[0].paused, false);
  h.visibility(true);
  h.music.setMusic(false);
  h.visibility(false);
  assert.equal(h.players[0].paused, true);
});

test('an autoplay denial retries on touch without triggering the fallback', async () => {
  const h = await harness();
  h.playError = 'NotAllowedError';
  await h.start();
  assert.equal(h.fallbackOn, false);
  h.playError = null;
  h.music.wakeMusic();
  await flush();
  assert.equal(h.players[0].paused, false);
});

test('late play resolution cannot unmute a stopped track', async () => {
  const h = await harness();
  let finish;
  h.pendingPlay = new Promise((resolve) => { finish = resolve; });
  await h.start();
  h.music.setMusic(false);
  h.players[0].paused = false;
  finish();
  await flush();
  assert.equal(h.players[0].paused, true);
});

test('a missing recording falls back and still follows visibility and mute', async () => {
  const h = await harness();
  await h.start();
  h.players[0].events.get('error')();
  assert.equal(h.fallbackOn, true);
  assert.equal(h.players[0].paused, true);
  h.visibility(true);
  assert.equal(h.fallbackOn, false);
  h.visibility(false);
  assert.equal(h.fallbackOn, true);
  h.music.setMusicVolume(0);
  assert.equal(h.fallbackOn, false);
  h.music.setMusic(false);
  h.music.wakeMusic();
  assert.equal(h.fallbackOn, false);
});

test('endless mode accelerates gently with pitch correction and resets', async () => {
  const h = await harness();
  await h.start();
  h.music.setMusicSpeed(10);
  for (let i = 0; i < 100; i++) h.tick();
  assert.ok(h.players[0].playbackRate > 1.17 && h.players[0].playbackRate <= 1.18);
  assert.equal(h.players[0].preservesPitch, true);
  h.music.setMusicSpeed(1);
  for (let i = 0; i < 100; i++) h.tick();
  assert.ok(Math.abs(h.players[0].playbackRate - 1) < 0.002);
});
