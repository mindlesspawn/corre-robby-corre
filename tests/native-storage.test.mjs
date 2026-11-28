import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as config from '../src/config.js';
import * as questions from '../src/questions.js';
import * as text from '../src/text.js';
import * as audio from '../src/audio-settings.js';

test('native startup loads preferences without awaiting the plugin proxy and saves changes', async () => {
  const calls = [];
  let stored = JSON.stringify({ rules: 4, language: 'es', age: 3, totalPoints: 25, tutorialAges: { 3: true } });
  const context = vm.createContext({ window: { Capacitor: { isNativePlatform: () => true } } });
  // Capacitor exposes a callable for every property, including `then`. Returning
  // that proxy from an async function would invoke it as a thenable and hang.
  const proxy = new Proxy({}, {
    get(_target, method) {
      if (method === 'then') throw new Error('A native plugin proxy must never be awaited');
      return async (args) => {
        calls.push({ method, args });
        if (method === 'get') return { value: stored };
        if (method === 'set') { stored = args.value; return {}; }
        throw new Error(`Unexpected Preferences method: ${method}`);
      };
    },
  });
  const nativeModule = new vm.SyntheticModule(['Preferences'], function () { this.setExport('Preferences', proxy); }, { context });
  await nativeModule.link(() => {});
  await nativeModule.evaluate();
  const source = await readFile(new URL('../src/storage.js', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(source, {
    context,
    importModuleDynamically: async (specifier) => {
      assert.equal(specifier, '@capacitor/preferences');
      return nativeModule;
    },
  });
  const imports = { './config.js': config, './questions.js': questions, './text.js': text, './audio-settings.js': audio };
  await module.link((specifier) => {
    const values = imports[specifier];
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  const { store } = module.namespace;
  await store.init();
  assert.equal(store.get().language, 'es');
  assert.equal(store.get().totalPoints, 25);
  assert.equal(store.get().tutorialAges[3], true);
  store.update({ language: 'en', musicVolume: 0.15 });
  await new Promise(setImmediate);
  assert.equal(JSON.parse(stored).language, 'en');
  assert.equal(JSON.parse(stored).musicVolume, 0.15);
  assert.deepEqual(calls.map(({ method }) => method), ['get', 'set']);
});
