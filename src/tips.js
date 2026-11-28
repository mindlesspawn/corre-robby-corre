import { Capacitor, registerPlugin } from '@capacitor/core';
import { createTipSession } from './tip-session.js';

const TipJar = registerPlugin('TipJar');
export const hasNativeTips = () => Capacitor.getPlatform() === 'ios' && Capacitor.isPluginAvailable('TipJar');
export const nativeApp = () => Capacitor.isNativePlatform();
export const makeTipSession = (changed) => createTipSession(TipJar, changed);
