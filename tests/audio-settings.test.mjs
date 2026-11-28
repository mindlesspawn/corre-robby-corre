import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_DEFAULTS, restoreVolumes } from '../src/audio-settings.js';

test('fresh settings use quiet music and keep spoken instructions clear', () => {
  assert.deepEqual(restoreVolumes({}), AUDIO_DEFAULTS);
  assert.equal(AUDIO_DEFAULTS.musicVolume, 0.4);
  assert.equal(AUDIO_DEFAULTS.voiceVolume, 1);
});

test('migrates the old default but retains custom volumes and silence', () => {
  assert.equal(restoreVolumes({ musicVolume: 0.65 }).musicVolume, 0.4);
  for (const value of [0, 0.2, 0.9, 1]) {
    assert.equal(restoreVolumes({ musicVolume: value }).musicVolume, value);
  }
  assert.equal(restoreVolumes({ audioSettingsVersion: 1, musicVolume: 0.65 }).musicVolume, 0.65);
  assert.equal(restoreVolumes({ music: false, musicVolume: 0.8 }).musicVolume, 0);
});

test('invalid saved volumes recover without amplifying or losing valid choices', () => {
  assert.deepEqual(restoreVolumes({ masterVolume: -1, musicVolume: null, voiceVolume: 2, effectsVolume: NaN }), AUDIO_DEFAULTS);
  const settings = { masterVolume: 0.5, musicVolume: 0, voiceVolume: 0.7, effectsVolume: 0 };
  assert.deepEqual(restoreVolumes(settings), settings);
});
