// Shared defaults for fresh saves, old saves, and the sound controls.
export const AUDIO_DEFAULTS = Object.freeze({
  masterVolume: 1,
  musicVolume: 0.4,
  voiceVolume: 1,
  effectsVolume: 0.65,
});

export function restoreVolumes(saved) {
  const restored = {};
  for (const [key, initial] of Object.entries(AUDIO_DEFAULTS)) {
    const value = saved[key];
    restored[key] = Number.isFinite(value) && value >= 0 && value <= 1 ? value : initial;
  }
  // The previous music slider default was saved even when nobody adjusted it.
  // Migrate that default once; retain other choices, including silence.
  if (!saved.audioSettingsVersion && saved.musicVolume === 0.65) {
    restored.musicVolume = AUDIO_DEFAULTS.musicVolume;
  }
  // The new music slider replaces the old separate on/off switch.
  if (saved.music === false) restored.musicVolume = 0;
  return restored;
}
